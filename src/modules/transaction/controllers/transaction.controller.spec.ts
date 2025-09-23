import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from '@services/transaction.service';
import { TransactionValidationService } from '@services/transaction.validation.service';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';
import { CreateTransactionDto } from '@dto/index';
import { NotFoundException } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: TransactionService;
  let _stateValidationService: TransactionValidationService;

  const mockTransaction = {
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
        timestamp: '2025-01-01T10:00:00.000Z',
        createdAt: 1640995200000,
      },
    ],
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  };

  const mockTransactionSummary = {
    id: 'tx-123',
    transactionId: '0xtest123',
    fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
    toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
    tokenName: 'USDC',
    amount: '100.50',
    status: TransactionStatus.INITIATED,
    statusHistoryCount: 1,
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
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
  };

  const mockTransactionService = {
    createOrUpdate: jest.fn(),
    getById: jest.fn(),
    getAll: jest.fn(),
    getAllSummaries: jest.fn(),
    createSummary: jest.fn(),
    getHistory: jest.fn(),
  };

  const mockStateValidationService = {
    validateStateTransition: jest.fn(),
    isNewStatusHigherPriority: jest.fn(),
    getHighestPriorityStatus: jest.fn(),
    getValidNextStates: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
        {
          provide: TransactionValidationService,
          useValue: mockStateValidationService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get<TransactionService>(TransactionService);
    _stateValidationService = module.get<TransactionValidationService>(
      TransactionValidationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrUpdateTransaction', () => {
    it('should create a new transaction', () => {
      const createDto: CreateTransactionDto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.INITIATED,
      };

      mockTransactionService.createOrUpdate.mockReturnValue(mockTransaction);

      const result = controller.createOrUpdateTransaction(createDto);

      expect(transactionService.createOrUpdate).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockTransaction);
    });

    it('should update an existing transaction', () => {
      const updateDto: CreateTransactionDto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: TransactionStatus.PROCESSING,
      };

      const updatedTransaction = {
        ...mockTransaction,
        status: TransactionStatus.PROCESSING,
        statusHistory: [
          ...mockTransaction.statusHistory,
          {
            id: 'update-2',
            status: TransactionStatus.PROCESSING,
            timestamp: '2025-01-01T10:01:00.000Z',
            createdAt: 1640995260000,
          },
        ],
      };

      mockTransactionService.createOrUpdate.mockReturnValue(updatedTransaction);

      const result = controller.createOrUpdateTransaction(updateDto);

      expect(transactionService.createOrUpdate).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual(updatedTransaction);
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions as summaries', () => {
      const mockSummaries = [mockTransactionSummary];
      mockTransactionService.getAllSummaries.mockReturnValue(mockSummaries);

      const result = controller.getAllTransactions();

      expect(transactionService.getAllSummaries).toHaveBeenCalled();
      expect(result).toEqual({
        transactions: mockSummaries,
        total: 1,
      });
    });

    it('should return empty array when no transactions exist', () => {
      mockTransactionService.getAllSummaries.mockReturnValue([]);

      const result = controller.getAllTransactions();

      expect(transactionService.getAllSummaries).toHaveBeenCalled();
      expect(result).toEqual({
        transactions: [],
        total: 0,
      });
    });
  });

  describe('getTransaction', () => {
    it('should return a specific transaction by ID', () => {
      const transactionId = '0xtest123';
      mockTransactionService.getById.mockReturnValue(mockTransaction);

      const result = controller.getTransaction(transactionId);

      expect(transactionService.getById).toHaveBeenCalledWith(transactionId);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction not found', () => {
      const transactionId = 'nonexistent';
      mockTransactionService.getById.mockImplementation(() => {
        throw new NotFoundException(`Transaction with ID ${transactionId} not found.`);
      });

      expect(() => controller.getTransaction(transactionId)).toThrow(NotFoundException);
      expect(transactionService.getById).toHaveBeenCalledWith(transactionId);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction status history', () => {
      const transactionId = '0xtest123';
      const mockHistory = [
        {
          id: 'update-1',
          status: TransactionStatus.INITIATED,
          timestamp: '2025-01-01T10:00:00.000Z',
          createdAt: 1640995200000,
        },
        {
          id: 'update-2',
          status: TransactionStatus.PROCESSING,
          timestamp: '2025-01-01T10:01:00.000Z',
          sequence: 1640995260000,
        },
      ];

      mockTransactionService.getHistory.mockReturnValue(mockHistory);

      const result = controller.getTransactionHistory(transactionId);

      expect(transactionService.getHistory).toHaveBeenCalledWith(transactionId);
      expect(result).toEqual(mockHistory);
    });

    it('should throw NotFoundException when transaction not found', () => {
      const transactionId = 'nonexistent';
      mockTransactionService.getHistory.mockImplementation(() => {
        throw new NotFoundException(`Transaction with ID ${transactionId} not found.`);
      });

      expect(() => controller.getTransactionHistory(transactionId)).toThrow(NotFoundException);
      expect(transactionService.getHistory).toHaveBeenCalledWith(transactionId);
    });
  });
});
