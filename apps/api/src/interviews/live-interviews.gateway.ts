import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/live-interviews',
})
export class LiveInterviewsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(LiveInterviewsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as Record<string, string>).token ??
        (client.handshake.headers.authorization ?? '').replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'super_secret_dev_key_at_least_32_characters_long',
      });

      const userId = payload.sub;
      client.data = { userId, role: payload.role };
      this.logger.log(`Live Interview Room: Client connected: ${client.id} (user: ${userId})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Live Interview Room: Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const { sessionId } = data;
    if (!sessionId) return;
    void client.join(`interview:${sessionId}`);
    this.logger.log(`User ${client.data?.userId} joined room interview:${sessionId}`);
    client.to(`interview:${sessionId}`).emit('user_joined', { userId: client.data?.userId, role: client.data?.role });
  }

  @SubscribeMessage('code_update')
  handleCodeUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; code: string },
  ) {
    const { sessionId, code } = data;
    if (!sessionId) return;
    client.to(`interview:${sessionId}`).emit('code_updated', { code, userId: client.data?.userId });
  }

  @SubscribeMessage('cursor_update')
  handleCursorUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; cursor: { line: number; ch: number } },
  ) {
    const { sessionId, cursor } = data;
    if (!sessionId) return;
    client.to(`interview:${sessionId}`).emit('cursor_updated', { cursor, userId: client.data?.userId });
  }

  @SubscribeMessage('interview_completed')
  handleInterviewCompleted(
    @MessageBody() data: { sessionId: string },
  ) {
    const { sessionId } = data;
    if (!sessionId) return;
    this.server.to(`interview:${sessionId}`).emit('interview_finished', { sessionId });
  }
}
