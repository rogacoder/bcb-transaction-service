import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStatusPriorityService } from './transaction.status-priority.service';
import {
  TransactionValidationService,
  StateValidationResult,
} from './transaction.validation.service';
import { TransactionConfigService } from './transaction.config.service';
import { TransactionStorageService } from './transaction.storage.service';
import { LoggingService } from '../../../common/services/logging.service';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';
import { Transaction } from '../../../common/types/transaction.types';

describe('TransactionStatusPriorityService', () => {
  let service: TransactionStatusPriorityService;
  let _stateValidationService: TransactionValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionStatusPriorityService,
        TransactionValidationService,
        TransactionConfigService,
        TransactionStorageService,
        {
          provide: LoggingService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionStatusPriorityService>(TransactionStatusPriorityService);
    _stateValidationService = module.get<TransactionValidationService>(
      TransactionValidationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateStatus', () => {
    let mockTransaction: Transaction;
    let mockValidationResult: StateValidationResult;

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

      mockValidationResult = {
        isValid: true,
        status: TransactionStatus.INITIATED,
        newStatus: TransactionStatus.IN_MEM_POOL,
        isTransitionAllowed: true,
        isOutOfOrder: false,
        errors: [],
        warnings: [],
      };
    });

    it('should add new status update to history', () => {
      jest
        .spyOn(_stateValidationService, 'validateStateUpdate')
        .mockReturnValue(mockValidationResult);
      jest
        .spyOn(_stateValidationService, 'determineCurrentStatus')
        .mockReturnValue(TransactionStatus.IN_MEM_POOL);

      const result = service.updateStatus(mockTransaction, TransactionStatus.IN_MEM_POOL);

      expect(result.statusHistory).toHaveLength(2);
      expect(result.statusHistory[1].status).toBe(TransactionStatus.IN_MEM_POOL);
    });

    it('should update current status to higher priority status', () => {
      const result = service.updateStatus(mockTransaction, TransactionStatus.PROCESSING);

      expect(result.status).toBe(TransactionStatus.PROCESSING);
    });

    it('should not change current status for lower priority status', () => {
      // First update to higher priority
      const updatedTransaction = service.updateStatus(
        mockTransaction,
        TransactionStatus.PROCESSING,
      );

      // Then add lower priority status
      const result = service.updateStatus(updatedTransaction, TransactionStatus.IN_MEM_POOL);

      expect(result.status).toBe(TransactionStatus.PROCESSING);
    });

    it('should sort status history chronologically', () => {
      const result = service.updateStatus(mockTransaction, TransactionStatus.IN_MEM_POOL);

      expect(result.statusHistory).toHaveLength(2);
      expect(result.statusHistory[0].status).toBe(TransactionStatus.INITIATED);
      expect(result.statusHistory[1].status).toBe(TransactionStatus.IN_MEM_POOL);
    });

    it('should create status update without metadata', () => {
      const result = service.updateStatus(mockTransaction, TransactionStatus.IN_MEM_POOL);

      expect(result.statusHistory[1].status).toBe(TransactionStatus.IN_MEM_POOL);
      expect(result.statusHistory[1].id).toBeDefined();
      expect(result.statusHistory[1].timestamp).toBeInstanceOf(Date);
    });

    it('should update transaction updatedAt timestamp', () => {
      const beforeUpdate = mockTransaction.updatedAt;

      // Wait a small amount to ensure timestamp difference
      setTimeout(() => {
        const result = service.updateStatus(mockTransaction, TransactionStatus.IN_MEM_POOL);

        expect(result.updatedAt).not.toBe(beforeUpdate);
        expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(
          new Date(beforeUpdate).getTime(),
        );
      }, 1);
    });

    it('should handle multiple out-of-order updates correctly', () => {
      jest
        .spyOn(_stateValidationService, 'validateStateUpdate')
        .mockReturnValue(mockValidationResult);
      jest
        .spyOn(_stateValidationService, 'determineCurrentStatus')
        .mockReturnValue(TransactionStatus.PROCESSING);

      // Add Processing status first
      let result = service.updateStatus(mockTransaction, TransactionStatus.PROCESSING);

      // Then add InMemPool (out of order)
      result = service.updateStatus(result, TransactionStatus.IN_MEM_POOL);

      // Current status should still be Processing (higher priority)
      expect(result.status).toBe(TransactionStatus.PROCESSING);
      expect(result.statusHistory).toHaveLength(3);
    });

    it('should handle status updates by always adding to history', () => {
      const validationResult = {
        isValid: true,
        status: TransactionStatus.INITIATED,
        newStatus: TransactionStatus.INITIATED,
        isTransitionAllowed: false,
        isOutOfOrder: false,
        errors: [],
        warnings: [],
      };
      jest.spyOn(_stateValidationService, 'validateStateUpdate').mockReturnValue(validationResult);

      const result = service.updateStatus(mockTransaction, TransactionStatus.INITIATED);

      expect(result).toBe(mockTransaction);
      expect(result.statusHistory).toHaveLength(2); // Always add to history for audit trail
      expect(result.statusHistory[1].status).toBe(TransactionStatus.INITIATED);
    });

    it('should log warnings from validation', () => {
      const logSpy = jest.spyOn(service['logService'], 'log');
      const warningValidationResult = {
        isValid: true,
        status: TransactionStatus.INITIATED,
        newStatus: TransactionStatus.IN_MEM_POOL,
        isTransitionAllowed: true,
        isOutOfOrder: true,
        errors: [],
        warnings: ['Warning: Invalid transition', 'Warning: Out of order update'],
      };
      jest
        .spyOn(_stateValidationService, 'validateStateUpdate')
        .mockReturnValue(warningValidationResult);
      jest
        .spyOn(_stateValidationService, 'determineCurrentStatus')
        .mockReturnValue(TransactionStatus.IN_MEM_POOL);

      service.updateStatus(mockTransaction, TransactionStatus.IN_MEM_POOL);

      expect(logSpy).toHaveBeenCalledWith(
        '[Transaction: 0xtest123] Warning: Warning: Invalid transition',
      );
      expect(logSpy).toHaveBeenCalledWith(
        '[Transaction: 0xtest123] Warning: Warning: Out of order update',
      );
    });

    it('should log status update recorded message', () => {
      const logSpy = jest.spyOn(service['logService'], 'log');
      const validationResult = {
        isValid: true,
        status: TransactionStatus.INITIATED,
        newStatus: TransactionStatus.INITIATED,
        isTransitionAllowed: false,
        isOutOfOrder: false,
        errors: [],
        warnings: [],
      };
      jest.spyOn(_stateValidationService, 'validateStateUpdate').mockReturnValue(validationResult);

      service.updateStatus(mockTransaction, TransactionStatus.INITIATED);

      expect(logSpy).toHaveBeenCalledWith(
        '[Transaction: 0xtest123] Status update recorded but current status unchanged (lower priority): Initiated',
      );
    });

    it('should call validation service with correct parameters', () => {
      const validateSpy = jest
        .spyOn(_stateValidationService, 'validateStateUpdate')
        .mockReturnValue(mockValidationResult);
      jest
        .spyOn(_stateValidationService, 'determineCurrentStatus')
        .mockReturnValue(TransactionStatus.IN_MEM_POOL);

      service.updateStatus(mockTransaction, TransactionStatus.IN_MEM_POOL);

      expect(validateSpy).toHaveBeenCalledWith(
        TransactionStatus.INITIATED,
        TransactionStatus.IN_MEM_POOL,
      );
    });

    it('should call config service for priority comparison', () => {
      jest
        .spyOn(_stateValidationService, 'validateStateUpdate')
        .mockReturnValue(mockValidationResult);
      const configService = service['configService'];
      const getStatusPrioritySpy = jest.spyOn(configService, 'getStatusPriority');

      service.updateStatus(mockTransaction, TransactionStatus.IN_MEM_POOL);

      expect(getStatusPrioritySpy).toHaveBeenCalledWith(TransactionStatus.INITIATED);
      expect(getStatusPrioritySpy).toHaveBeenCalledWith(TransactionStatus.IN_MEM_POOL);
    });

    it('should log out-of-order update message', () => {
      const logSpy = jest.spyOn(service['logService'], 'log');
      jest
        .spyOn(_stateValidationService, 'validateStateUpdate')
        .mockReturnValue(mockValidationResult);
      jest
        .spyOn(_stateValidationService, 'determineCurrentStatus')
        .mockReturnValue(TransactionStatus.IN_MEM_POOL);

      service.updateStatus(mockTransaction, TransactionStatus.IN_MEM_POOL);

      expect(logSpy).toHaveBeenCalledWith(
        '[Transaction: 0xtest123] Status update: Initiated → InMemPool',
      );
    });

    it('should log status updated to higher priority message', () => {
      const logSpy = jest.spyOn(service['logService'], 'log');
      jest
        .spyOn(_stateValidationService, 'validateStateUpdate')
        .mockReturnValue(mockValidationResult);
      jest
        .spyOn(_stateValidationService, 'determineCurrentStatus')
        .mockReturnValue(TransactionStatus.IN_MEM_POOL);

      service.updateStatus(mockTransaction, TransactionStatus.IN_MEM_POOL);

      expect(logSpy).toHaveBeenCalledWith(
        '[Transaction: 0xtest123] Status updated to higher priority: InMemPool → InMemPool',
      );
    });
  });

  describe('shouldHandleAsOutOfOrder', () => {
    it('should return true when transition is invalid', () => {
      jest.spyOn(_stateValidationService, 'isValidTransition').mockReturnValue(false);

      const result = service.shouldHandleAsOutOfOrder(
        TransactionStatus.INITIATED,
        TransactionStatus.COMPLETE,
      );

      expect(result).toBe(true);
    });

    it('should return false when transition is valid', () => {
      jest.spyOn(_stateValidationService, 'isValidTransition').mockReturnValue(true);

      const result = service.shouldHandleAsOutOfOrder(
        TransactionStatus.INITIATED,
        TransactionStatus.IN_MEM_POOL,
      );

      expect(result).toBe(false);
    });

    it('should call validation service with correct parameters', () => {
      const isValidSpy = jest
        .spyOn(_stateValidationService, 'isValidTransition')
        .mockReturnValue(false);

      service.shouldHandleAsOutOfOrder(TransactionStatus.INITIATED, TransactionStatus.COMPLETE);

      expect(isValidSpy).toHaveBeenCalledWith(
        TransactionStatus.INITIATED,
        TransactionStatus.COMPLETE,
      );
    });
  });
});
