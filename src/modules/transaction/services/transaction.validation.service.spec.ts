import { Test, TestingModule } from '@nestjs/testing';
import { TransactionValidationService } from './transaction.validation.service';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';

// Mock the config service
jest.mock('./transaction.config.service', () => ({
  TransactionConfigService: {
    getInstance: jest.fn(() => ({
      getStatusPriority: jest.fn(status => {
        const priorities = {
          Failed: 0,
          Initiated: 1,
          InMemPool: 2,
          Processing: 3,
          InCompliance: 4,
          Complete: 5,
        };
        return priorities[status] || 0;
      }),
      isTerminalStatus: jest.fn(status => status === 'Complete' || status === 'Failed'),
      getValidTransitions: jest.fn(status => {
        const transitions = {
          Initiated: ['InMemPool', 'Failed'],
          InMemPool: ['Processing', 'Failed'],
          Processing: ['InCompliance', 'Failed'],
          InCompliance: ['Complete', 'Failed'],
          Complete: [],
          Failed: [],
        };
        return transitions[status] || [];
      }),
      getAllowedTransitions: jest.fn(status => {
        const transitions = {
          Initiated: ['InMemPool', 'Failed'],
          InMemPool: ['Processing', 'Failed'],
          Processing: ['InCompliance', 'Failed'],
          InCompliance: ['Complete', 'Failed'],
          Complete: [],
          Failed: [],
        };
        return transitions[status] || [];
      }),
      isValidTransition: jest.fn((from, to) => {
        const transitions = {
          Initiated: ['InMemPool', 'Failed'],
          InMemPool: ['Processing', 'Failed'],
          Processing: ['InCompliance', 'Failed'],
          InCompliance: ['Complete', 'Failed'],
          Complete: [],
          Failed: [],
        };
        return transitions[from]?.includes(to) || false;
      }),
    })),
  },
}));

describe('TransactionValidationService', () => {
  let service: TransactionValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionValidationService],
    }).compile();

    service = module.get<TransactionValidationService>(TransactionValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isValidStatus', () => {
    it('should return true for valid status', () => {
      const result = service.isValidStatus(TransactionStatus.INITIATED);
      expect(result).toBe(true);
    });

    it('should return false for invalid status', () => {
      const result = service.isValidStatus('InvalidStatus');
      expect(result).toBe(false);
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transition', () => {
      const result = service.isValidTransition(
        TransactionStatus.INITIATED,
        TransactionStatus.IN_MEM_POOL,
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid transition', () => {
      const result = service.isValidTransition(
        TransactionStatus.INITIATED,
        TransactionStatus.COMPLETE,
      );
      expect(result).toBe(false);
    });
  });

  describe('determineCurrentStatus', () => {
    it('should return INITIATED for empty history', () => {
      const result = service.determineCurrentStatus([]);
      expect(result).toBe(TransactionStatus.INITIATED);
    });

    it('should return highest priority status from history', () => {
      const statusHistory = [
        { status: TransactionStatus.INITIATED, timestamp: new Date('2025-01-01T10:00:00.000Z') },
        { status: TransactionStatus.PROCESSING, timestamp: new Date('2025-01-01T10:01:00.000Z') },
        { status: TransactionStatus.IN_MEM_POOL, timestamp: new Date('2025-01-01T10:02:00.000Z') },
      ];
      const result = service.determineCurrentStatus(statusHistory);
      expect(result).toBe(TransactionStatus.PROCESSING);
    });
  });

  describe('validateStateUpdate', () => {
    it('should validate successful state update', () => {
      const result = service.validateStateUpdate(
        TransactionStatus.INITIATED,
        TransactionStatus.IN_MEM_POOL,
      );
      expect(result.isValid).toBe(true);
      expect(result.isTransitionAllowed).toBe(true);
    });

    it('should not include duplicate checking in validation result', () => {
      const result = service.validateStateUpdate(
        TransactionStatus.IN_MEM_POOL,
        TransactionStatus.IN_MEM_POOL,
      );
      // Verify that isDuplicate property doesn't exist in the result
      expect(result).not.toHaveProperty('isDuplicate');
      expect(result.warnings.some(warning => warning.includes('Duplicate status update'))).toBe(
        false,
      );
    });
  });

  describe('getStatusPriority', () => {
    it('should return correct priority for status', () => {
      const result = service.getStatusPriority(TransactionStatus.PROCESSING);
      expect(result).toBe(3);
    });
  });

  describe('isTerminalStatus', () => {
    it('should return true for terminal status', () => {
      const result = service.isTerminalStatus(TransactionStatus.COMPLETE);
      expect(result).toBe(true);
    });

    it('should return false for non-terminal status', () => {
      const result = service.isTerminalStatus(TransactionStatus.INITIATED);
      expect(result).toBe(false);
    });
  });

  describe('getValidNextStates', () => {
    it('should return valid transitions for Initiated status', () => {
      const result = service.getValidNextStates(TransactionStatus.INITIATED);
      expect(result).toContain(TransactionStatus.IN_MEM_POOL);
      expect(result).toContain(TransactionStatus.FAILED);
      expect(result).not.toContain(TransactionStatus.COMPLETE);
    });

    it('should return valid transitions for Processing status', () => {
      const result = service.getValidNextStates(TransactionStatus.PROCESSING);
      expect(result).toContain(TransactionStatus.IN_COMPLIANCE);
      expect(result).toContain(TransactionStatus.FAILED);
      expect(result).not.toContain(TransactionStatus.INITIATED);
    });

    it('should return empty array for terminal states', () => {
      const result = service.getValidNextStates(TransactionStatus.COMPLETE);
      expect(result).toEqual([]);
    });
  });
});
