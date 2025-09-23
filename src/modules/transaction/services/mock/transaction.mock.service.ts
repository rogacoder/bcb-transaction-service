import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Transaction } from '@/types';
import { TransactionStorageService } from '../transaction.storage.service';
import { LoggingService } from '../../../../common/services/logging.service';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';

interface JsonTransactionData {
  transactionId: string;
  fromAddress: string;
  toAddress: string;
  tokenName: string;
  amount: string;
  status: string;
}

@Injectable()
export class TransactionMockService implements OnModuleInit {
  constructor(
    private readonly storage: TransactionStorageService,
    private readonly logService: LoggingService,
  ) {}

  async onModuleInit() {
    if (this.shouldLoadMockData()) {
      await this.loadMockData();
    }
  }

  private shouldLoadMockData(): boolean {
    return process.env.LOAD_MOCK_DATA === 'true' || process.argv.includes('mock');
  }

  private async loadMockData(): Promise<void> {
    this.logService.log('Loading mock data from JSON file...');
    try {
      const jsonTransactions = await this.loadJsonData();
      this.processLoadedTransactions(jsonTransactions);
    } catch (error) {
      this.logService.log('Failed to load JSON data:', error);
    }
  }

  private processLoadedTransactions(transactions: Transaction[]): void {
    if (transactions.length === 0) {
      this.logService.log('JSON loader returned 0 transactions');
      return;
    }

    transactions.forEach(transaction => {
      this.storage.set(transaction.transactionId, transaction);
    });
    this.logService.log(`Successfully loaded ${transactions.length} transactions from JSON`);
  }

  /**
   * Manually load mock data (for testing purposes)
   */
  async loadMockDataManually(): Promise<void> {
    await this.loadMockData();
  }

  /**
   * Check if mock data should be loaded
   */
  isMockDataEnabled(): boolean {
    return this.shouldLoadMockData();
  }

  /**
   * Loads transaction data from JSON file
   */
  private async loadJsonData(): Promise<Transaction[]> {
    const jsonPath = path.join(process.cwd(), 'data.json');

    if (!fs.existsSync(jsonPath)) {
      this.logService.log(`JSON file not found at ${jsonPath}`);
      return [];
    }

    try {
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      const statusUpdates: JsonTransactionData[] = JSON.parse(jsonData);

      this.logService.log(`Loading ${statusUpdates.length} status updates from JSON`);

      // Group status updates by transactionId
      const transactionMap = new Map<string, JsonTransactionData[]>();

      statusUpdates.forEach(update => {
        if (!transactionMap.has(update.transactionId)) {
          transactionMap.set(update.transactionId, []);
        }
        const updates = transactionMap.get(update.transactionId);
        if (updates) {
          updates.push(update);
        }
      });

      // Hardcoded Simple priority mapping for the service
      const STATUS_PRIORITY: Record<string, number> = {
        Initiated: 1,
        InMemPool: 2,
        Processing: 3,
        InCompliance: 4,
        Complete: 5,
        Failed: 0,
      };

      const transactions: Transaction[] = Array.from(transactionMap.entries()).map(
        ([transactionId, updates]) => {
          // Sort updates by status priority (simulating chronological order)
          const sortedUpdates = [...updates].sort((a, b) => {
            const priorityA = STATUS_PRIORITY[a.status] || 0;
            const priorityB = STATUS_PRIORITY[b.status] || 0;
            return priorityA - priorityB;
          });

          // Find highest priority status
          let currentStatus = updates[0].status as TransactionStatus;
          let highestPriority = STATUS_PRIORITY[currentStatus] || 0;

          for (const update of updates) {
            const priority = STATUS_PRIORITY[update.status] || 0;
            if (priority > highestPriority) {
              highestPriority = priority;
              currentStatus = update.status as TransactionStatus;
            }
          }

          // Create status history
          const statusHistory = sortedUpdates.map((update, updateIndex) => ({
            id: `update-${Date.now()}-${transactionId}-${updateIndex}`,
            status: update.status as TransactionStatus,
            timestamp: new Date(Date.now() + updateIndex * 1000), // Simulate timestamps
            createdAt: Date.now() + updateIndex * 1000,
          }));

          const firstUpdate = sortedUpdates[0];

          return {
            id: `tx-${transactionId}`,
            transactionId,
            fromAddress: firstUpdate.fromAddress,
            toAddress: firstUpdate.toAddress,
            tokenName: firstUpdate.tokenName,
            amount: firstUpdate.amount,
            status: currentStatus,
            statusHistory,
            createdAt: new Date(Date.now() - updates.length * 1000),
            updatedAt: new Date(),
          };
        },
      );

      this.logService.log(
        `Successfully loaded ${transactions.length} transactions from ${statusUpdates.length} status updates`,
      );
      return transactions;
    } catch (error) {
      this.logService.log('Error reading JSON file:', error);
      return [];
    }
  }
}
