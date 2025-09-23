import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, StatusUpdate } from '@/types';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';
import { CreateTransactionDto } from '@dto/create-transaction.dto';
import { TransactionListItemDto } from '@dto/transaction-list.dto';
import { TransactionValidationService } from '@services/transaction.validation.service';
import { TransactionStatusPriorityService } from '@services/transaction.status-priority.service';
import { TransactionStorageService } from '@services/transaction.storage.service';
import { LoggingService } from '../../../common/services/logging.service';

@Injectable()
export class TransactionService {
  private readonly baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

  constructor(
    private readonly stateValidationService: TransactionValidationService,
    private readonly statusPriorityService: TransactionStatusPriorityService,
    private readonly storage: TransactionStorageService,
    private readonly logService: LoggingService,
  ) {}

  /**
   * Gets a transaction by ID
   */
  public getById(transactionId: string): Transaction {
    const transaction = this.storage.get(transactionId);
    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} not found`);
    }
    return transaction;
  }

  /**
   * Gets all transactions
   */
  public getAll(): Transaction[] {
    return this.storage.getAll();
  }

  /**
   * Gets all transactions as summary data with HATEOAS links
   */
  public getAllSummaries(): TransactionListItemDto[] {
    const transactions = this.storage.getAll();
    return transactions.map(transaction => this.createSummary(transaction));
  }

  /**
   * Creates a new transaction or updates an existing one
   */
  public createOrUpdate(dto: CreateTransactionDto): Transaction {
    const existingTransaction: Transaction = this.storage.get(dto.transactionId);

    if (existingTransaction) {
      this.logService.log(`Updating existing transaction: ${dto.transactionId}`);
      return this.updateStatus(dto.transactionId, dto.status || TransactionStatus.INITIATED);
    } else {
      this.logService.log(`Creating new transaction: ${dto.transactionId}`);
      return this.create(dto);
    }
  }

  /**
   * Gets transaction status history
   */
  public getHistory(transactionId: string): StatusUpdate[] {
    const transaction = this.getById(transactionId);
    return transaction.statusHistory;
  }

  /**
   * Clears all transactions (for testing)
   */
  public clearAll(): void {
    this.storage.clear();
    this.logService.log('All transactions cleared');
  }

  /**
   * Updates an existing transaction's status
   */
  private updateStatus(transactionId: string, status: TransactionStatus): Transaction {
    const transaction = this.getById(transactionId);
    this.validateStatus(status);

    return this.statusPriorityService.updateStatus(transaction, status);
  }

  /**
   * Creates a new transaction
   */
  private create(dto: CreateTransactionDto): Transaction {
    const status = dto.status || TransactionStatus.INITIATED;

    const transaction: Transaction = {
      id: uuidv4(),
      transactionId: dto.transactionId,
      fromAddress: dto.fromAddress,
      toAddress: dto.toAddress,
      tokenName: dto.tokenName,
      amount: dto.amount,
      status: status,
      statusHistory: [
        {
          id: uuidv4(),
          status,
          timestamp: new Date(),
          createdAt: Date.now(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.storage.set(dto.transactionId, transaction);
    return transaction;
  }

  private validateStatus(status: TransactionStatus): void {
    if (!this.stateValidationService.isValidStatus(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
  }

  /**
   * Creates a transaction summary with HATEOAS links
   */
  private createSummary(transaction: Transaction): TransactionListItemDto {
    return {
      id: transaction.id,
      transactionId: transaction.transactionId,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      tokenName: transaction.tokenName,
      amount: transaction.amount,
      status: transaction.status,
      statusHistoryCount: transaction.statusHistory.length,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      _links: this.createHateoasLinks(transaction),
    };
  }

  private createHateoasLinks(transaction: Transaction) {
    return {
      self: {
        href: `${this.baseUrl}/transactions/${transaction.transactionId}`,
        method: 'GET',
        description: 'Get detailed information about this transaction',
      },
      history: {
        href: `${this.baseUrl}/transactions/${transaction.transactionId}/history`,
        method: 'GET',
        description: 'Get the complete status history for this transaction',
      },
      update: {
        href: `${this.baseUrl}/transactions/${transaction.transactionId}/status`,
        method: 'POST',
        description: 'Update the status of this transaction',
      },
    };
  }
}
