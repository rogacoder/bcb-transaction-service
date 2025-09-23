import { Test, TestingModule } from '@nestjs/testing';
import { TransactionMockService } from './transaction.mock.service';
import { TransactionStorageService } from '../transaction.storage.service';
import { LoggingService } from '../../../../common/services/logging.service';
import { Transaction } from '@/types';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';
import * as fs from 'fs';

describe('TransactionMockService', () => {
  let service: TransactionMockService;
  let storage: TransactionStorageService;
  let logService: LoggingService;

  const mockTransaction: Transaction = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionMockService,
        {
          provide: TransactionStorageService,
          useValue: {
            set: jest.fn(),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionMockService>(TransactionMockService);
    storage = module.get<TransactionStorageService>(TransactionStorageService);
    logService = module.get<LoggingService>(LoggingService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shouldLoadMockData', () => {
    it('should return true when LOAD_MOCK_DATA env var is true', () => {
      process.env.LOAD_MOCK_DATA = 'true';
      expect(service['shouldLoadMockData']()).toBe(true);
    });

    it('should return true when mock flag is in process.argv', () => {
      process.env.LOAD_MOCK_DATA = 'false';
      process.argv = ['node', 'app.js', 'mock'];
      expect(service['shouldLoadMockData']()).toBe(true);
    });

    it('should return false when neither condition is met', () => {
      process.env.LOAD_MOCK_DATA = 'false';
      process.argv = ['node', 'app.js'];
      expect(service['shouldLoadMockData']()).toBe(false);
    });
  });

  describe('isMockDataEnabled', () => {
    it('should return true when mock data should be loaded', () => {
      jest
        .spyOn(service as unknown as { shouldLoadMockData: () => boolean }, 'shouldLoadMockData')
        .mockReturnValue(true);
      expect(service.isMockDataEnabled()).toBe(true);
    });

    it('should return false when mock data should not be loaded', () => {
      jest
        .spyOn(service as unknown as { shouldLoadMockData: () => boolean }, 'shouldLoadMockData')
        .mockReturnValue(false);
      expect(service.isMockDataEnabled()).toBe(false);
    });
  });

  describe('loadMockData', () => {
    it('should load and process transactions successfully', async () => {
      const mockTransactions = [mockTransaction];
      jest
        .spyOn(service as unknown as { loadJsonData: () => Promise<Transaction[]> }, 'loadJsonData')
        .mockResolvedValue(mockTransactions);
      jest
        .spyOn(
          service as unknown as {
            processLoadedTransactions: (transactions: Transaction[]) => void;
          },
          'processLoadedTransactions',
        )
        .mockImplementation();

      await service['loadMockData']();

      expect(service['loadJsonData']).toHaveBeenCalled();
      expect(service['processLoadedTransactions']).toHaveBeenCalledWith(mockTransactions);
      expect(logService.log).toHaveBeenCalledWith('Loading mock data from JSON file...');
    });

    it('should handle errors when loading fails', async () => {
      const error = new Error('Loading failed');
      jest
        .spyOn(service as unknown as { loadJsonData: () => Promise<Transaction[]> }, 'loadJsonData')
        .mockRejectedValue(error);

      await service['loadMockData']();

      expect(logService.log).toHaveBeenCalledWith('Failed to load JSON data:', error);
    });
  });

  describe('processLoadedTransactions', () => {
    it('should process transactions and store them', () => {
      const transactions = [mockTransaction];
      jest.spyOn(storage, 'set').mockImplementation();

      service['processLoadedTransactions'](transactions);

      expect(storage.set).toHaveBeenCalledWith(mockTransaction.transactionId, mockTransaction);
      expect(logService.log).toHaveBeenCalledWith(
        `Successfully loaded ${transactions.length} transactions from JSON`,
      );
    });

    it('should handle empty transactions array', () => {
      service['processLoadedTransactions']([]);

      expect(storage.set).not.toHaveBeenCalled();
      expect(logService.log).toHaveBeenCalledWith('JSON loader returned 0 transactions');
    });
  });

  describe('loadMockDataManually', () => {
    it('should call loadMockData', async () => {
      jest
        .spyOn(service as unknown as { loadMockData: () => Promise<void> }, 'loadMockData')
        .mockResolvedValue(undefined);

      await service.loadMockDataManually();

      expect(service['loadMockData']).toHaveBeenCalled();
    });
  });

  describe('loadJsonData', () => {
    // Mock data representing individual status updates (new format)
    const mockStatusUpdates = [
      {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: 'Initiated',
      },
      {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: 'Processing',
      },
      {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: 'Complete',
      },
      {
        transactionId: '0xtest456',
        fromAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        toAddress: '0xB2904FDB92cEa03FEb4bDD40dCB70dB2DF5682A8',
        tokenName: 'ETH',
        amount: '2.5',
        status: 'Initiated',
      },
      {
        transactionId: '0xtest456',
        fromAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        toAddress: '0xB2904FDB92cEa03FEb4bDD40dCB70dB2DF5682A8',
        tokenName: 'ETH',
        amount: '2.5',
        status: 'Failed',
      },
    ];

    beforeEach(() => {
      // Mock fs and path modules
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockStatusUpdates));
    });

    it('should load and process JSON data successfully', async () => {
      const result = await service['loadJsonData']();

      expect(result).toHaveLength(2);

      // Test first transaction (0xtest123)
      expect(result[0].transactionId).toBe('0xtest123');
      expect(result[0].status).toBe(TransactionStatus.COMPLETE); // Highest priority
      expect(result[0].statusHistory).toHaveLength(3);
      expect(result[0].statusHistory[0].status).toBe(TransactionStatus.INITIATED);
      expect(result[0].statusHistory[1].status).toBe(TransactionStatus.PROCESSING);
      expect(result[0].statusHistory[2].status).toBe(TransactionStatus.COMPLETE);

      // Test second transaction (0xtest456)
      expect(result[1].transactionId).toBe('0xtest456');
      expect(result[1].status).toBe(TransactionStatus.INITIATED); // Failed has priority 0, Initiated has priority 1
      expect(result[1].statusHistory).toHaveLength(2);
      expect(result[1].statusHistory[0].status).toBe(TransactionStatus.FAILED); // Sorted by priority (Failed=0, Initiated=1)
      expect(result[1].statusHistory[1].status).toBe(TransactionStatus.INITIATED);
    });

    it('should handle unsorted status updates correctly', async () => {
      const unsortedStatusUpdates = [
        {
          transactionId: '0xtest789',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '50.0',
          status: 'Complete',
        },
        {
          transactionId: '0xtest789',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '50.0',
          status: 'Initiated',
        },
        {
          transactionId: '0xtest789',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '50.0',
          status: 'Processing',
        },
      ];

      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(unsortedStatusUpdates));

      const result = await service['loadJsonData']();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TransactionStatus.COMPLETE); // Highest priority
      expect(result[0].statusHistory[0].status).toBe(TransactionStatus.INITIATED); // Sorted by priority
      expect(result[0].statusHistory[1].status).toBe(TransactionStatus.PROCESSING);
      expect(result[0].statusHistory[2].status).toBe(TransactionStatus.COMPLETE);
    });

    it('should handle single status update', async () => {
      const singleStatusData = [
        {
          transactionId: '0xtest999',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '25.0',
          status: 'Initiated',
        },
      ];

      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(singleStatusData));

      const result = await service['loadJsonData']();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TransactionStatus.INITIATED);
      expect(result[0].statusHistory).toHaveLength(1);
      expect(result[0].statusHistory[0].status).toBe(TransactionStatus.INITIATED);
    });

    it('should return empty array when JSON file does not exist', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await service['loadJsonData']();

      expect(result).toEqual([]);
      expect(logService.log).toHaveBeenCalledWith(
        expect.stringContaining('JSON file not found at'),
      );
    });

    it('should return empty array when JSON parsing fails', async () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue('invalid json');

      const result = await service['loadJsonData']();

      expect(result).toEqual([]);
      expect(logService.log).toHaveBeenCalledWith('Error reading JSON file:', expect.any(Error));
    });

    it('should handle empty JSON array', async () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue('[]');

      const result = await service['loadJsonData']();

      expect(result).toEqual([]);
      expect(logService.log).toHaveBeenCalledWith('Loading 0 status updates from JSON');
    });

    it('should handle unknown status values gracefully', async () => {
      const unknownStatusData = [
        {
          transactionId: '0xtestunknown',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '10.0',
          status: 'UnknownStatus',
        },
      ];

      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(unknownStatusData));

      const result = await service['loadJsonData']();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('UnknownStatus' as TransactionStatus);
      expect(result[0].statusHistory[0].status).toBe('UnknownStatus' as TransactionStatus);
    });

    it('should generate unique IDs for status updates', async () => {
      const result = await service['loadJsonData']();

      expect(result[0].statusHistory[0].id).toMatch(/^update-\d+-0xtest123-0$/);
      expect(result[0].statusHistory[1].id).toMatch(/^update-\d+-0xtest123-1$/);
      expect(result[0].statusHistory[2].id).toMatch(/^update-\d+-0xtest123-2$/);
    });

    it('should set correct timestamps and createdAt values', async () => {
      const result = await service['loadJsonData']();

      // Check that timestamps are Date objects
      expect(result[0].statusHistory[0].timestamp).toBeInstanceOf(Date);
      expect(result[0].statusHistory[1].timestamp).toBeInstanceOf(Date);
      expect(result[0].statusHistory[2].timestamp).toBeInstanceOf(Date);

      // Check that createdAt values are numbers (timestamps)
      expect(typeof result[0].statusHistory[0].createdAt).toBe('number');
      expect(typeof result[0].statusHistory[1].createdAt).toBe('number');
      expect(typeof result[0].statusHistory[2].createdAt).toBe('number');
    });

    it('should set correct transaction timestamps', async () => {
      const result = await service['loadJsonData']();

      // Check that createdAt and updatedAt are Date objects
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should group status updates by transactionId correctly', async () => {
      const mixedStatusUpdates = [
        {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
          status: 'Initiated',
        },
        {
          transactionId: '0xtest456',
          fromAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          toAddress: '0xB2904FDB92cEa03FEb4bDD40dCB70dB2DF5682A8',
          tokenName: 'ETH',
          amount: '2.5',
          status: 'Processing',
        },
        {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
          status: 'Complete',
        },
      ];

      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mixedStatusUpdates));

      const result = await service['loadJsonData']();

      expect(result).toHaveLength(2);

      // First transaction should have 2 status updates
      const tx123 = result.find(tx => tx.transactionId === '0xtest123');
      expect(tx123).toBeDefined();
      expect(tx123!.statusHistory).toHaveLength(2);
      expect(tx123!.status).toBe(TransactionStatus.COMPLETE); // Highest priority

      // Second transaction should have 1 status update
      const tx456 = result.find(tx => tx.transactionId === '0xtest456');
      expect(tx456).toBeDefined();
      expect(tx456!.statusHistory).toHaveLength(1);
      expect(tx456!.status).toBe(TransactionStatus.PROCESSING);
    });

    it('should handle priority mapping correctly', async () => {
      const priorityTestData = [
        {
          transactionId: '0xtestpriority',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.0',
          status: 'Failed', // Priority 0
        },
        {
          transactionId: '0xtestpriority',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.0',
          status: 'InMemPool', // Priority 2
        },
        {
          transactionId: '0xtestpriority',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.0',
          status: 'Initiated', // Priority 1
        },
      ];

      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(priorityTestData));

      const result = await service['loadJsonData']();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TransactionStatus.IN_MEM_POOL); // Highest priority (2)
      expect(result[0].statusHistory).toHaveLength(3);
      // Should be sorted by priority: Failed (0), Initiated (1), InMemPool (2)
      expect(result[0].statusHistory[0].status).toBe(TransactionStatus.FAILED);
      expect(result[0].statusHistory[1].status).toBe(TransactionStatus.INITIATED);
      expect(result[0].statusHistory[2].status).toBe(TransactionStatus.IN_MEM_POOL);
    });

    it('should log correct information about loaded data', async () => {
      await service['loadJsonData']();

      expect(logService.log).toHaveBeenCalledWith('Loading 5 status updates from JSON');
      expect(logService.log).toHaveBeenCalledWith(
        'Successfully loaded 2 transactions from 5 status updates',
      );
    });
  });

  describe('onModuleInit', () => {
    it('should load mock data when shouldLoadMockData returns true', async () => {
      jest
        .spyOn(service as unknown as { shouldLoadMockData: () => boolean }, 'shouldLoadMockData')
        .mockReturnValue(true);
      jest
        .spyOn(service as unknown as { loadMockData: () => Promise<void> }, 'loadMockData')
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(service['shouldLoadMockData']).toHaveBeenCalled();
      expect(service['loadMockData']).toHaveBeenCalled();
    });

    it('should not load mock data when shouldLoadMockData returns false', async () => {
      jest
        .spyOn(service as unknown as { shouldLoadMockData: () => boolean }, 'shouldLoadMockData')
        .mockReturnValue(false);
      jest
        .spyOn(service as unknown as { loadMockData: () => Promise<void> }, 'loadMockData')
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(service['shouldLoadMockData']).toHaveBeenCalled();
      expect(service['loadMockData']).not.toHaveBeenCalled();
    });
  });
});
