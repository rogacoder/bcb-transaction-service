import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, StatusUpdate } from '@/types';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';
import { TransactionValidationService } from './transaction.validation.service';
import { TransactionConfigService } from './transaction.config.service';
import { TransactionStorageService } from './transaction.storage.service';
import { LoggingService } from '../../../common/services/logging.service';

@Injectable()
export class TransactionStatusPriorityService {
  uuidv4 = uuidv4;

  constructor(
    private readonly stateValidationService: TransactionValidationService,
    private readonly configService: TransactionConfigService,
    private readonly storageService: TransactionStorageService,
    private readonly logService: LoggingService,
  ) {}

  /**
   * Updates transaction status with priority-based logic
   */
  updateStatus(transaction: Transaction, newStatus: TransactionStatus): Transaction {
    this.logService.log(
      `[Transaction: ${transaction.transactionId}] Status update: ${transaction.status} → ${newStatus}`,
    );

    // Validate the update
    const validation = this.stateValidationService.validateStateUpdate(
      transaction.status,
      newStatus,
    );

    // Log warnings
    validation.warnings.forEach(warning => {
      this.logService.log(`[Transaction: ${transaction.transactionId}] Warning: ${warning}`);
    });

    // Create new status update
    const statusUpdate: StatusUpdate = {
      id: uuidv4(),
      status: newStatus,
      timestamp: new Date(),
      createdAt: Date.now(),
    };

    // Use storage service to update history
    this.storageService.updateHistory(transaction, statusUpdate);

    return this.setTransactionStatus(transaction, newStatus);
  }

  /**
   * Sets the transaction status based on priority comparison
   * @param transaction - The transaction to update
   * @param newStatus - The new status to potentially set
   * @returns The updated transaction
   */
  private setTransactionStatus(
    transaction: Transaction,
    newStatus: TransactionStatus,
  ): Transaction {
    // Determine the new current status based on priority comparison
    const currentPriority = this.configService.getStatusPriority(transaction.status);
    const newPriority = this.configService.getStatusPriority(newStatus);

    // Only update current status if new status has higher priority
    if (newPriority > currentPriority) {
      transaction.status = newStatus;
      transaction.updatedAt = new Date();

      this.logService.log(
        `[Transaction: ${transaction.transactionId}] Status updated to higher priority: ${transaction.status} → ${newStatus}`,
      );
    } else {
      this.logService.log(
        `[Transaction: ${transaction.transactionId}] Status update recorded but current status unchanged (lower priority): ${newStatus}`,
      );
    }

    return transaction;
  }

  /**
   * Determines if an update should be handled as out-of-order
   */
  shouldHandleAsOutOfOrder(
    currentStatus: TransactionStatus,
    newStatus: TransactionStatus,
  ): boolean {
    return !this.stateValidationService.isValidTransition(currentStatus, newStatus);
  }
}
