import { Test, TestingModule } from '@nestjs/testing';
import { TransactionConfigService } from './transaction.config.service';

describe('TransactionConfigService', () => {
  let service: TransactionConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionConfigService],
    }).compile();

    service = module.get<TransactionConfigService>(TransactionConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = TransactionConfigService.getInstance();
      const instance2 = TransactionConfigService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance if none exists', () => {
      const instance = TransactionConfigService.getInstance();

      expect(instance).toBeInstanceOf(TransactionConfigService);
    });
  });

  describe('config getter', () => {
    it('should return the configuration object', () => {
      const config = service.config;

      expect(config).toBeDefined();
      expect(config.statuses).toBeDefined();
      expect(typeof config.statuses).toBe('object');
    });

    it('should return the same config object on multiple calls', () => {
      const config1 = service.config;
      const config2 = service.config;

      expect(config1).toBe(config2);
    });
  });

  describe('getStatusConfig', () => {
    it('should return status config for valid status', () => {
      const statusConfig = service.getStatusConfig('Initiated');

      expect(statusConfig).toBeDefined();
      expect(statusConfig?.priority).toBe(1);
      expect(statusConfig?.isTerminal).toBe(false);
      expect(statusConfig?.description).toBeDefined();
      expect(statusConfig?.allowedTransitions).toBeDefined();
    });

    it('should return status config for Complete status', () => {
      const statusConfig = service.getStatusConfig('Complete');

      expect(statusConfig).toBeDefined();
      expect(statusConfig?.priority).toBe(5);
      expect(statusConfig?.isTerminal).toBe(true);
      expect(statusConfig?.allowedTransitions).toEqual([]);
    });

    it('should return status config for Failed status', () => {
      const statusConfig = service.getStatusConfig('Failed');

      expect(statusConfig).toBeDefined();
      expect(statusConfig?.priority).toBe(0);
      expect(statusConfig?.isTerminal).toBe(true);
      expect(statusConfig?.allowedTransitions).toEqual([]);
    });

    it('should return undefined for invalid status', () => {
      const statusConfig = service.getStatusConfig('InvalidStatus');

      expect(statusConfig).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const statusConfig = service.getStatusConfig('');

      expect(statusConfig).toBeUndefined();
    });
  });

  describe('getStatusPriority', () => {
    it('should return correct priority for Initiated', () => {
      expect(service.getStatusPriority('Initiated')).toBe(1);
    });

    it('should return correct priority for InMemPool', () => {
      expect(service.getStatusPriority('InMemPool')).toBe(2);
    });

    it('should return correct priority for Processing', () => {
      expect(service.getStatusPriority('Processing')).toBe(3);
    });

    it('should return correct priority for InCompliance', () => {
      expect(service.getStatusPriority('InCompliance')).toBe(4);
    });

    it('should return correct priority for Complete', () => {
      expect(service.getStatusPriority('Complete')).toBe(5);
    });

    it('should return correct priority for Failed', () => {
      expect(service.getStatusPriority('Failed')).toBe(0);
    });

    it('should return 0 for invalid status', () => {
      expect(service.getStatusPriority('InvalidStatus')).toBe(0);
    });

    it('should return 0 for empty string', () => {
      expect(service.getStatusPriority('')).toBe(0);
    });
  });

  describe('isTerminalStatus', () => {
    it('should return true for Complete status', () => {
      expect(service.isTerminalStatus('Complete')).toBe(true);
    });

    it('should return true for Failed status', () => {
      expect(service.isTerminalStatus('Failed')).toBe(true);
    });

    it('should return false for Initiated status', () => {
      expect(service.isTerminalStatus('Initiated')).toBe(false);
    });

    it('should return false for InMemPool status', () => {
      expect(service.isTerminalStatus('InMemPool')).toBe(false);
    });

    it('should return false for Processing status', () => {
      expect(service.isTerminalStatus('Processing')).toBe(false);
    });

    it('should return false for InCompliance status', () => {
      expect(service.isTerminalStatus('InCompliance')).toBe(false);
    });

    it('should return false for invalid status', () => {
      expect(service.isTerminalStatus('InvalidStatus')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.isTerminalStatus('')).toBe(false);
    });
  });

  describe('getAllowedTransitions', () => {
    it('should return correct transitions for Initiated', () => {
      const transitions = service.getAllowedTransitions('Initiated');

      expect(transitions).toEqual(['InMemPool', 'Failed']);
    });

    it('should return correct transitions for InMemPool', () => {
      const transitions = service.getAllowedTransitions('InMemPool');

      expect(transitions).toEqual(['Processing', 'Failed']);
    });

    it('should return correct transitions for Processing', () => {
      const transitions = service.getAllowedTransitions('Processing');

      expect(transitions).toEqual(['InCompliance', 'Failed']);
    });

    it('should return correct transitions for InCompliance', () => {
      const transitions = service.getAllowedTransitions('InCompliance');

      expect(transitions).toEqual(['Complete', 'Failed']);
    });

    it('should return empty array for Complete', () => {
      const transitions = service.getAllowedTransitions('Complete');

      expect(transitions).toEqual([]);
    });

    it('should return empty array for Failed', () => {
      const transitions = service.getAllowedTransitions('Failed');

      expect(transitions).toEqual([]);
    });

    it('should return empty array for invalid status', () => {
      const transitions = service.getAllowedTransitions('InvalidStatus');

      expect(transitions).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const transitions = service.getAllowedTransitions('');

      expect(transitions).toEqual([]);
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transitions', () => {
      expect(service.isValidTransition('Initiated', 'InMemPool')).toBe(true);
      expect(service.isValidTransition('InMemPool', 'Processing')).toBe(true);
      expect(service.isValidTransition('Processing', 'InCompliance')).toBe(true);
      expect(service.isValidTransition('InCompliance', 'Complete')).toBe(true);
    });

    it('should return true for transitions to Failed from any status', () => {
      expect(service.isValidTransition('Initiated', 'Failed')).toBe(true);
      expect(service.isValidTransition('InMemPool', 'Failed')).toBe(true);
      expect(service.isValidTransition('Processing', 'Failed')).toBe(true);
      expect(service.isValidTransition('InCompliance', 'Failed')).toBe(true);
    });

    it('should return true for same status (idempotent)', () => {
      expect(service.isValidTransition('Initiated', 'Initiated')).toBe(true);
      expect(service.isValidTransition('Complete', 'Complete')).toBe(true);
      expect(service.isValidTransition('Failed', 'Failed')).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(service.isValidTransition('Initiated', 'Processing')).toBe(false);
      expect(service.isValidTransition('InMemPool', 'Complete')).toBe(false);
      expect(service.isValidTransition('Processing', 'Initiated')).toBe(false);
      expect(service.isValidTransition('Complete', 'Processing')).toBe(false);
    });

    it('should return false for transitions from terminal states', () => {
      expect(service.isValidTransition('Complete', 'Processing')).toBe(false);
      expect(service.isValidTransition('Failed', 'Initiated')).toBe(false);
    });

    it('should return false for invalid statuses', () => {
      expect(service.isValidTransition('InvalidStatus', 'Initiated')).toBe(false);
      expect(service.isValidTransition('Initiated', 'InvalidStatus')).toBe(false);
    });
  });

  describe('getStatuses', () => {
    it('should return all status configurations', () => {
      const statuses = service.getStatuses();

      expect(statuses).toBeDefined();
      expect(typeof statuses).toBe('object');
      expect(Object.keys(statuses)).toHaveLength(6);

      // Check that all expected statuses are present
      expect(statuses).toHaveProperty('Initiated');
      expect(statuses).toHaveProperty('InMemPool');
      expect(statuses).toHaveProperty('Processing');
      expect(statuses).toHaveProperty('InCompliance');
      expect(statuses).toHaveProperty('Complete');
      expect(statuses).toHaveProperty('Failed');
    });

    it('should return the same object on multiple calls', () => {
      const statuses1 = service.getStatuses();
      const statuses2 = service.getStatuses();

      expect(statuses1).toBe(statuses2);
    });

    it('should contain all required properties for each status', () => {
      const statuses = service.getStatuses();

      Object.values(statuses).forEach(statusConfig => {
        expect(statusConfig).toHaveProperty('priority');
        expect(statusConfig).toHaveProperty('isTerminal');
        expect(statusConfig).toHaveProperty('description');
        expect(statusConfig).toHaveProperty('allowedTransitions');

        expect(typeof statusConfig.priority).toBe('number');
        expect(typeof statusConfig.isTerminal).toBe('boolean');
        expect(typeof statusConfig.description).toBe('string');
        expect(Array.isArray(statusConfig.allowedTransitions)).toBe(true);
      });
    });
  });
});
