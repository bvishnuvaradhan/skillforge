import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
  namespace: '/',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

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
      void client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id} → user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit dlt_updated to the user's private room
   */
  emitDltUpdated(userId: string, data: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit('dlt_updated', data);
  }

  /**
   * Emit world_unlocked to the user's private room
   */
  emitWorldUnlocked(userId: string, data: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit('world_unlocked', data);
  }

  /**
   * Emit badge_earned to the user's private room
   */
  emitBadgeEarned(userId: string, data: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit('badge_earned', data);
  }

  /**
   * Emit streak_milestone to the user's private room
   */
  emitStreakMilestone(userId: string, data: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit('streak_milestone', data);
  }
}
