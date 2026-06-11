import { Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { EventsGateway } from './events.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [Neo4jService, EventsGateway],
  exports: [Neo4jService, EventsGateway],
})
export class CommonModule {}
