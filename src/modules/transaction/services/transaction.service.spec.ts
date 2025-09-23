import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { TransactionValidationService } from './transaction.validation.service';
import { TransactionStatusPriorityService } from './transaction.status-priority.service';
import { TransactionStorageService } from './transaction.storage.service';
import { TransactionConfigService } from './transaction.config.service';
import { LoggingService } from '../../../common/services/logging.service';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';
import { Transaction } from '@/types';

describe('TransactionService', () => {
  let service: TransactionService;
  let _stateValidationService: TransactionValidationService;
  let _statusPriorityService: TransactionStatusPriorityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        TransactionValidationService,
        TransactionStatusPriorityService,
        TransactionStorageService,
        TransactionConfigService,
        {
          provide: LoggingService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    _stateValidationService = module.get<TransactionValidationService>(
      TransactionValidationService,
    );
    _statusPriorityService = module.get<TransactionStatusPriorityService>(
      TransactionStatusPriorityService,
    );
  });

  afterEach(() => {
    service.clearAll();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdateTransaction', () => {
    it('should create a new transaction', () => {
      const dto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
      };

      const result = service.createOrUpdate(dto);

      expect(result.transactionId).toBe(dto.transactionId);
      expect(result.status).toBe(TransactionStatus.INITIATED);
      expect(result.statusHistory).toHaveLength(1);
      expect(result.statusHistory[0].status).toBe(TransactionStatus.INITIATED);
      // Future: source field removed for simplicity
    });

    it('should create transaction with default status when none provided', () => {
      const dto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
      };

      const result = service.createOrUpdate(dto);

      expect(result.status).toBe(TransactionStatus.INITIATED);
      // Future: source field removed for simplicity
    });

    it('should update existing transaction', () => {
      const dto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
      };

      // Create transaction
      service.createOrUpdate(dto);

      // Update transaction
      const updateDto = { ...dto, status: TransactionStatus.PROCESSING };
      const result = service.createOrUpdate(updateDto);

      expect(result.transactionId).toBe(dto.transactionId);
      expect(result.statusHistory).toHaveLength(2);
      expect(result.statusHistory[1].status).toBe(TransactionStatus.PROCESSING);
    });
  });

  describe('getTransaction', () => {
    it('should return transaction by id', () => {
      const dto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
      };

      service.createOrUpdate(dto);
      const result = service.getById('0xtest123');

      expect(result.transactionId).toBe('0xtest123');
    });

    it('should throw NotFoundException for non-existent transaction', () => {
      expect(() => service.getById('nonexistent')).toThrow('Transaction nonexistent not found');
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions', () => {
      const dto1 = {
        transactionId: '0xtest1',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
      };

      const dto2 = {
        transactionId: '0xtest2',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '200.75',
        status: TransactionStatus.COMPLETE,
      };

      service.createOrUpdate(dto1);
      service.createOrUpdate(dto2);

      const result = service.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].transactionId).toBe('0xtest1');
      expect(result[1].transactionId).toBe('0xtest2');
    });
  });

  describe('updateStatus', () => {
    let mockTransaction: Transaction;

    beforeEach(() => {
      mockTransaction = {
        id: 'test-id',
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [
          {
            id: 'history-id',
            status: TransactionStatus.INITIATED,
            timestamp: new Date(),
            createdAt: Date.now(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create a transaction first
      service.createOrUpdate({
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
      });
    });

    it('should update transaction status', () => {
      jest.spyOn(_statusPriorityService, 'updateStatus').mockReturnValue(mockTransaction);

      const result = service['updateStatus']('0xtest123', TransactionStatus.PROCESSING);

      expect(_statusPriorityService.updateStatus).toHaveBeenCalledWith(
        expect.any(Object),
        TransactionStatus.PROCESSING,
      );
      expect(result).toBe(mockTransaction);
    });

    it('should throw BadRequestException for invalid status', () => {
      jest.spyOn(_stateValidationService, 'isValidStatus').mockReturnValue(false);

      expect(() =>
        service['updateStatus']('0xtest123', 'InvalidStatus' as TransactionStatus),
      ).toThrow('Invalid status: InvalidStatus');
    });

    it('should throw NotFoundException for non-existent transaction', () => {
      expect(() => service['updateStatus']('nonexistent', TransactionStatus.PROCESSING)).toThrow(
        'Transaction nonexistent not found',
      );
    });
  });

  describe('validateStatus', () => {
    it('should not throw for valid status', () => {
      jest.spyOn(_stateValidationService, 'isValidStatus').mockReturnValue(true);

      expect(() => service['validateStatus'](TransactionStatus.INITIATED)).not.toThrow();
    });

    it('should throw BadRequestException for invalid status', () => {
      jest.spyOn(_stateValidationService, 'isValidStatus').mockReturnValue(false);

      expect(() => service['validateStatus']('InvalidStatus' as TransactionStatus)).toThrow(
        'Invalid status: InvalidStatus',
      );
    });
  });

  describe('getAllSummaries', () => {
    it('should return transaction summaries with HATEOAS links', () => {
      const dto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
      };

      service.createOrUpdate(dto);
      const result = service.getAllSummaries();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistoryCount: 1,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        _links: {
          self: {
            href: 'http://localhost:3000/transactions/0xtest123',
            method: 'GET',
            description: 'Get detailed information about this transaction',
          },
          history: {
            href: 'http://localhost:3000/transactions/0xtest123/history',
            method: 'GET',
            description: 'Get the complete status history for this transaction',
          },
          update: {
            href: 'http://localhost:3000/transactions/0xtest123/status',
            method: 'POST',
            description: 'Update the status of this transaction',
          },
        },
      });
    });

    it('should return empty array when no transactions exist', () => {
      const result = service.getAllSummaries();
      expect(result).toEqual([]);
    });
  });

  describe('createSummary', () => {
    it('should create transaction summary with HATEOAS links', () => {
      const transaction = {
        id: 'test-id',
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistory: [
          {
            id: '1',
            status: TransactionStatus.INITIATED,
            timestamp: new Date(),
            createdAt: Date.now(),
          },
          {
            id: '2',
            status: TransactionStatus.PROCESSING,
            timestamp: new Date(),
            createdAt: Date.now(),
          },
        ],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:01:00.000Z'),
      };

      const result = service['createSummary'](transaction as Transaction);

      expect(result).toEqual({
        id: 'test-id',
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
        statusHistoryCount: 2,
        createdAt: '2025-01-01T10:00:00.000Z',
        updatedAt: '2025-01-01T10:01:00.000Z',
        _links: {
          self: {
            href: 'http://localhost:3000/transactions/0xtest123',
            method: 'GET',
            description: 'Get detailed information about this transaction',
          },
          history: {
            href: 'http://localhost:3000/transactions/0xtest123/history',
            method: 'GET',
            description: 'Get the complete status history for this transaction',
          },
          update: {
            href: 'http://localhost:3000/transactions/0xtest123/status',
            method: 'POST',
            description: 'Update the status of this transaction',
          },
        },
      });
    });
  });

  describe('createHateoasLinks', () => {
    it('should create HATEOAS links with correct URLs and methods', () => {
      const transaction = {
        transactionId: '0xtest123',
      };

      const result = service['createHateoasLinks'](transaction as Transaction);

      expect(result).toEqual({
        self: {
          href: 'http://localhost:3000/transactions/0xtest123',
          method: 'GET',
          description: 'Get detailed information about this transaction',
        },
        history: {
          href: 'http://localhost:3000/transactions/0xtest123/history',
          method: 'GET',
          description: 'Get the complete status history for this transaction',
        },
        update: {
          href: 'http://localhost:3000/transactions/0xtest123/status',
          method: 'POST',
          description: 'Update the status of this transaction',
        },
      });
    });

    it('should use custom base URL when set', () => {
      const originalBaseUrl = process.env.API_BASE_URL;
      process.env.API_BASE_URL = 'https://api.example.com';

      // Create new service instance to pick up the new base URL
      const newService = new TransactionService(
        _stateValidationService,
        _statusPriorityService,
        service['storage'],
        service['logService'],
      );

      const transaction = { transactionId: '0xtest123' };
      const result = newService['createHateoasLinks'](transaction as Transaction);

      expect(result.self.href).toBe('https://api.example.com/transactions/0xtest123');
      expect(result.history.href).toBe('https://api.example.com/transactions/0xtest123/history');
      expect(result.update.href).toBe('https://api.example.com/transactions/0xtest123/status');

      // Restore original base URL
      process.env.API_BASE_URL = originalBaseUrl;
    });
  });

  describe('getHistory', () => {
    it('should return transaction status history', () => {
      const dto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
      };

      service.createOrUpdate(dto);
      const result = service.getHistory('0xtest123');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TransactionStatus.INITIATED);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('timestamp');
      expect(result[0]).toHaveProperty('createdAt');
    });

    it('should throw NotFoundException for non-existent transaction', () => {
      expect(() => service.getHistory('nonexistent')).toThrow('Transaction nonexistent not found');
    });
  });

  describe('clearAll', () => {
    it('should clear all transactions and log the action', () => {
      const logSpy = jest.spyOn(service['logService'], 'log');

      // Create some transactions
      service.createOrUpdate({
        transactionId: '0xtest1',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
      });

      service.createOrUpdate({
        transactionId: '0xtest2',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '200.75',
        status: TransactionStatus.COMPLETE,
      });

      expect(service.getAll()).toHaveLength(2);

      service.clearAll();

      expect(service.getAll()).toHaveLength(0);
      expect(logSpy).toHaveBeenCalledWith('All transactions cleared');
    });
  });

  describe('create', () => {
    it('should create transaction with provided status', () => {
      const dto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.PROCESSING,
      };

      const result = service['create'](dto);

      expect(result.transactionId).toBe('0xtest123');
      expect(result.status).toBe(TransactionStatus.PROCESSING);
      expect(result.statusHistory).toHaveLength(1);
      expect(result.statusHistory[0].status).toBe(TransactionStatus.PROCESSING);
      expect(result.fromAddress).toBe(dto.fromAddress);
      expect(result.toAddress).toBe(dto.toAddress);
      expect(result.tokenName).toBe(dto.tokenName);
      expect(result.amount).toBe(dto.amount);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should create transaction with default status when none provided', () => {
      const dto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
      };

      const result = service['create'](dto);

      expect(result.status).toBe(TransactionStatus.INITIATED);
      expect(result.statusHistory[0].status).toBe(TransactionStatus.INITIATED);
    });
  });
});
