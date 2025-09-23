import { Module } from '@nestjs/common';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionService } from './services/transaction.service';
import { TransactionMockService } from './services/mock/transaction.mock.service';
import { TransactionValidationService } from './services/transaction.validation.service';
import { TransactionStatusPriorityService } from './services/transaction.status-priority.service';
import { TransactionStorageService } from './services/transaction.storage.service';
import { TransactionConfigService } from './services/transaction.config.service';
import { LoggingService } from '../../common/services/logging.service';

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionMockService,
    TransactionValidationService,
    TransactionStatusPriorityService,
    TransactionStorageService,
    TransactionConfigService,
    LoggingService,
  ],
  exports: [
    TransactionService,
    TransactionValidationService,
    TransactionStatusPriorityService,
    TransactionStorageService,
    TransactionConfigService,
  ],
})
export class TransactionModule {}
