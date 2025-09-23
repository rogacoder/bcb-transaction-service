// RS > BCB: Service facade for a DB. Just using menory from a prop 'transactions' on this singleton for the test
import { Injectable } from '@nestjs/common';
import { Transaction, StatusUpdate } from '../../../common/types/transaction.types';

@Injectable()
export class TransactionStorageService {
  private static readonly transactions: Map<string, Transaction> = new Map();

  constructor() {}

  set(transactionId: string, transaction: Transaction): void {
    TransactionStorageService.transactions.set(transactionId, transaction);
  }

  get(transactionId: string): Transaction | undefined {
    return TransactionStorageService.transactions.get(transactionId);
  }

  getAll(): Transaction[] {
    return Array.from(TransactionStorageService.transactions.values());
  }

  has(transactionId: string): boolean {
    return TransactionStorageService.transactions.has(transactionId);
  }

  count(): number {
    return TransactionStorageService.transactions.size;
  }

  clear(): void {
    TransactionStorageService.transactions.clear();
  }

  /**
   * Updates transaction history with a new status update
   * @param transaction - The transaction to update
   * @param statusUpdate - The status update to add to history
   * @returns The updated transaction
   */
  updateHistory(transaction: Transaction, statusUpdate: StatusUpdate): Transaction {
    // Add to history
    transaction.statusHistory.push(statusUpdate);

    // Sort history by timestamp to maintain chronological order
    transaction.statusHistory.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return transaction;
  }
}
