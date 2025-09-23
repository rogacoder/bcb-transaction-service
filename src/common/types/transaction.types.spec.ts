import { Transaction, StatusUpdate, TransactionStatus } from './transaction.types';

describe('Transaction Types', () => {
  describe('Transaction interface', () => {
    it('should allow creating valid Transaction objects', () => {
      const mockTransaction: Transaction = {
        id: 'test-id',
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(mockTransaction.id).toBe('test-id');
      expect(mockTransaction.transactionId).toBe('0xtest123');
      expect(mockTransaction.fromAddress).toBe('0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2');
      expect(mockTransaction.toAddress).toBe('0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e');
      expect(mockTransaction.tokenName).toBe('USDC');
      expect(mockTransaction.amount).toBe('100.50');
      expect(mockTransaction.status).toBe(TransactionStatus.INITIATED);
      expect(mockTransaction.statusHistory).toEqual([]);
      expect(mockTransaction.createdAt).toBeInstanceOf(Date);
      expect(mockTransaction.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('StatusUpdate interface', () => {
    it('should allow creating valid StatusUpdate objects', () => {
      const mockStatusUpdate: StatusUpdate = {
        id: 'update-id',
        status: TransactionStatus.INITIATED,
        timestamp: new Date(),
        createdAt: Date.now(),
      };

      expect(mockStatusUpdate.id).toBe('update-id');
      expect(mockStatusUpdate.status).toBe(TransactionStatus.INITIATED);
      expect(mockStatusUpdate.timestamp).toBeInstanceOf(Date);
      expect(typeof mockStatusUpdate.createdAt).toBe('number');
    });

    it('should create valid StatusUpdate objects', () => {
      const mockStatusUpdate: StatusUpdate = {
        id: 'update-id',
        status: TransactionStatus.INITIATED,
        timestamp: new Date(),
        createdAt: Date.now(),
      };

      expect(mockStatusUpdate.id).toBe('update-id');
      expect(mockStatusUpdate.status).toBe(TransactionStatus.INITIATED);
      expect(mockStatusUpdate.timestamp).toBeInstanceOf(Date);
      expect(typeof mockStatusUpdate.createdAt).toBe('number');
    });
  });

  describe('TransactionStatus enum', () => {
    it('should be defined', () => {
      expect(TransactionStatus).toBeDefined();
    });

    it('should have all expected status values', () => {
      expect(TransactionStatus.INITIATED).toBe('Initiated');
      expect(TransactionStatus.IN_MEM_POOL).toBe('InMemPool');
      expect(TransactionStatus.PROCESSING).toBe('Processing');
      expect(TransactionStatus.IN_COMPLIANCE).toBe('InCompliance');
      expect(TransactionStatus.COMPLETE).toBe('Complete');
      expect(TransactionStatus.FAILED).toBe('Failed');
    });

    it('should be usable in type annotations', () => {
      const status: TransactionStatus = TransactionStatus.INITIATED;
      expect(status).toBe(TransactionStatus.INITIATED);
    });
  });

  describe('Type compatibility', () => {
    it('should allow TransactionStatus in StatusUpdate', () => {
      const statusUpdate: StatusUpdate = {
        id: 'test',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date(),
        createdAt: Date.now(),
      };

      expect(statusUpdate.status).toBe(TransactionStatus.PROCESSING);
    });

    it('should allow StatusUpdate array in Transaction', () => {
      const transaction: Transaction = {
        id: 'test',
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
            timestamp: new Date(),
            createdAt: Date.now(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(transaction.statusHistory).toHaveLength(1);
      expect(transaction.statusHistory[0].status).toBe(TransactionStatus.INITIATED);
    });
  });
});
