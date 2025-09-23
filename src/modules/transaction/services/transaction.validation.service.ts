import { Injectable } from '@nestjs/common';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';
import { TransactionConfigService } from './transaction.config.service';

export interface StateValidationResult {
  isValid: boolean;
  status: TransactionStatus;
  newStatus: TransactionStatus;
  isTransitionAllowed: boolean;
  isOutOfOrder: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class TransactionValidationService {
  private readonly configService = TransactionConfigService.getInstance();

  /**
   * Validates if a status is valid
   */
  isValidStatus(status: string): status is TransactionStatus {
    return (Object.values(TransactionStatus) as string[]).includes(status);
  }

  /**
   * Validates if a transition from one status to another is allowed
   */
  isValidTransition(from: TransactionStatus, to: TransactionStatus): boolean {
    return this.configService.isValidTransition(from, to);
  }

  /**
   * Determines the current status based on status history and priority
   */
  determineCurrentStatus(
    statusHistory: Array<{ status: TransactionStatus; timestamp: Date }>,
  ): TransactionStatus {
    if (statusHistory.length === 0) {
      return TransactionStatus.INITIATED;
    }

    let status = TransactionStatus.INITIATED;
    let highestPriority = 0;

    for (const update of statusHistory) {
      const updateStatus = update.status;
      const priority = this.configService.getStatusPriority(updateStatus);

      if (priority > highestPriority) {
        highestPriority = priority;
        status = updateStatus;
      }
    }

    return status;
  }

  /**
   * Validates a state update and returns detailed validation result
   */
  validateStateUpdate(
    status: TransactionStatus,
    newStatus: TransactionStatus,
  ): StateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate new status
    if (!this.isValidStatus(newStatus)) {
      errors.push(`Invalid status: ${newStatus}`);
    }

    // Check if it's a valid transition
    const isTransitionAllowed = this.isValidTransition(status, newStatus);
    const isOutOfOrder = !isTransitionAllowed && status !== newStatus;

    if (isOutOfOrder) {
      warnings.push(
        `Out-of-order update detected: ${status} → ${newStatus}. This will be handled gracefully.`,
      );
    }

    // Check if current status is terminal
    const isCurrentTerminal = this.configService.isTerminalStatus(status);
    if (isCurrentTerminal && newStatus !== status) {
      warnings.push(`Attempting to update terminal status ${status} to ${newStatus}`);
    }

    return {
      isValid: errors.length === 0,
      status,
      newStatus,
      isTransitionAllowed,
      isOutOfOrder,
      errors,
      warnings,
    };
  }

  /**
   * Gets the priority of a status
   */
  getStatusPriority(status: TransactionStatus): number {
    return this.configService.getStatusPriority(status);
  }

  /**
   * Checks if a status is terminal
   */
  isTerminalStatus(status: TransactionStatus): boolean {
    return this.configService.isTerminalStatus(status);
  }

  /**
   * Gets all valid next states for a given status
   */
  getValidNextStates(status: TransactionStatus): TransactionStatus[] {
    return this.configService.getAllowedTransitions(status) as TransactionStatus[];
  }
}
