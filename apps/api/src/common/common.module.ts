import { Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { EventsGateway } from './events.gateway';
import { EmailService } from './email.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [Neo4jService, EventsGateway, EmailService],
  exports: [Neo4jService, EventsGateway, EmailService],
})
export class CommonModule {}
