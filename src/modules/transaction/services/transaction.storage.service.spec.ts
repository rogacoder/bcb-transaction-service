import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStorageService } from './transaction.storage.service';
import { Transaction, StatusUpdate } from '../../../common/types/transaction.types';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';

describe('TransactionStorageService', () => {
  let service: TransactionStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionStorageService],
    }).compile();

    service = module.get<TransactionStorageService>(TransactionStorageService);

    // Clear storage before each test
    service.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set and get', () => {
    it('should store and retrieve a transaction', () => {
      const transaction: Transaction = {
        id: 'tx-123',
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [
          {
            id: 'update-1',
            status: TransactionStatus.INITIATED,
            timestamp: new Date('2025-01-01T10:00:00.000Z'),
            // Future: source field removed for simplicity
            createdAt: 1,
          },
        ],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      };

      service.set('0xtest123', transaction);
      const retrieved = service.get('0xtest123');

      expect(retrieved).toEqual(transaction);
    });

    it('should return undefined for non-existent transaction', () => {
      const result = service.get('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should overwrite existing transaction', () => {
      const transaction1: Transaction = {
        id: 'tx-1',
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      };

      const transaction2: Transaction = {
        ...transaction1,
        status: TransactionStatus.PROCESSING,
        id: 'tx-2',
      };

      service.set('0xtest123', transaction1);
      service.set('0xtest123', transaction2);

      const retrieved = service.get('0xtest123');
      expect(retrieved).toEqual(transaction2);
      expect(retrieved?.id).toBe('tx-2');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no transactions', () => {
      const result = service.getAll();
      expect(result).toEqual([]);
    });

    it('should return all stored transactions', () => {
      const transaction1: Transaction = {
        id: 'tx-1',
        transactionId: '0xtest1',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      };

      const transaction2: Transaction = {
        id: 'tx-2',
        transactionId: '0xtest2',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'ETH',
        amount: '1.5',
        status: TransactionStatus.COMPLETE,
        statusHistory: [],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      };

      service.set('0xtest1', transaction1);
      service.set('0xtest2', transaction2);

      const result = service.getAll();
      expect(result).toHaveLength(2);
      expect(result).toContain(transaction1);
      expect(result).toContain(transaction2);
    });
  });

  describe('has', () => {
    it('should return true for existing transaction', () => {
      const transaction: Transaction = {
        id: 'tx-123',
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      };

      service.set('0xtest123', transaction);
      const result = service.has('0xtest123');
      expect(result).toBe(true);
    });

    it('should return false for non-existent transaction', () => {
      const result = service.has('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 when no transactions', () => {
      const result = service.count();
      expect(result).toBe(0);
    });

    it('should return correct count of transactions', () => {
      const transaction1: Transaction = {
        id: 'tx-1',
        transactionId: '0xtest1',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      };

      const transaction2: Transaction = {
        id: 'tx-2',
        transactionId: '0xtest2',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'ETH',
        amount: '1.5',
        status: TransactionStatus.COMPLETE,
        statusHistory: [],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      };

      service.set('0xtest1', transaction1);
      expect(service.count()).toBe(1);

      service.set('0xtest2', transaction2);
      expect(service.count()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should remove all transactions', () => {
      const transaction: Transaction = {
        id: 'tx-123',
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      };

      service.set('0xtest123', transaction);
      expect(service.count()).toBe(1);

      service.clear();
      expect(service.count()).toBe(0);
      expect(service.getAll()).toEqual([]);
    });
  });

  describe('updateHistory', () => {
    let mockTransaction: Transaction;

    beforeEach(() => {
      mockTransaction = {
        id: 'tx-123',
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [
          {
            id: 'update-1',
            status: TransactionStatus.INITIATED,
            timestamp: new Date('2025-01-01T10:00:00.000Z'),
            createdAt: 1,
          },
        ],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      };
    });

    it('should add new status update to history', () => {
      const originalHistoryLength = mockTransaction.statusHistory.length;
      const statusUpdate: StatusUpdate = {
        id: 'test-update-id',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date('2025-01-01T11:00:00.000Z'),
        createdAt: Date.now(),
      };

      service.updateHistory(mockTransaction, statusUpdate);

      expect(mockTransaction.statusHistory).toHaveLength(originalHistoryLength + 1);
      expect(mockTransaction.statusHistory[1]).toEqual(statusUpdate);
    });

    it('should not modify transaction status or updatedAt', () => {
      const originalStatus = mockTransaction.status;
      const originalUpdatedAt = mockTransaction.updatedAt;
      const statusUpdate: StatusUpdate = {
        id: 'test-update-id',
        status: TransactionStatus.COMPLETE,
        timestamp: new Date('2025-01-01T11:00:00.000Z'),
        createdAt: Date.now(),
      };

      service.updateHistory(mockTransaction, statusUpdate);

      // Storage service only handles history, not status or timestamps
      expect(mockTransaction.status).toBe(originalStatus);
      expect(mockTransaction.updatedAt).toEqual(originalUpdatedAt);
    });

    it('should sort status history by timestamp', () => {
      const statusUpdate1: StatusUpdate = {
        id: 'update-1',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date('2025-01-01T12:00:00.000Z'), // Later timestamp
        createdAt: Date.now(),
      };

      const statusUpdate2: StatusUpdate = {
        id: 'update-2',
        status: TransactionStatus.COMPLETE,
        timestamp: new Date('2025-01-01T11:00:00.000Z'), // Earlier timestamp
        createdAt: Date.now(),
      };

      // Add updates in reverse chronological order
      service.updateHistory(mockTransaction, statusUpdate1);
      service.updateHistory(mockTransaction, statusUpdate2);

      // Should be sorted chronologically
      const timestamps = mockTransaction.statusHistory.map(update => update.timestamp.getTime());
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b);

      expect(timestamps).toEqual(sortedTimestamps);
      expect(mockTransaction.statusHistory[0].timestamp).toEqual(
        new Date('2025-01-01T10:00:00.000Z'),
      );
      expect(mockTransaction.statusHistory[1].timestamp).toEqual(
        new Date('2025-01-01T11:00:00.000Z'),
      );
      expect(mockTransaction.statusHistory[2].timestamp).toEqual(
        new Date('2025-01-01T12:00:00.000Z'),
      );
    });

    it('should return the updated transaction', () => {
      const statusUpdate: StatusUpdate = {
        id: 'test-update-id',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date('2025-01-01T11:00:00.000Z'),
        createdAt: Date.now(),
      };

      const result = service.updateHistory(mockTransaction, statusUpdate);

      expect(result).toBe(mockTransaction);
      expect(result.statusHistory).toHaveLength(2);
    });

    it('should handle empty status history', () => {
      mockTransaction.statusHistory = [];
      const statusUpdate: StatusUpdate = {
        id: 'test-update-id',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date('2025-01-01T11:00:00.000Z'),
        createdAt: Date.now(),
      };

      service.updateHistory(mockTransaction, statusUpdate);

      expect(mockTransaction.statusHistory).toHaveLength(1);
      expect(mockTransaction.statusHistory[0]).toEqual(statusUpdate);
    });
  });
});
