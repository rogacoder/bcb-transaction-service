import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from './modules/transaction/transaction.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TransactionModule,
    HealthModule,
  ],
})
export class AppModule {}
