import {
  TransactionDetailDto,
  StatusUpdateDetailDto,
  TransactionListResponseDto,
} from './transaction-detail.dto';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';

describe('TransactionDetailDto', () => {
  it('should be defined', () => {
    expect(TransactionDetailDto).toBeDefined();
  });

  it('should create a valid instance', () => {
    const dto = new TransactionDetailDto();
    expect(dto).toBeDefined();
    expect(dto).toBeInstanceOf(TransactionDetailDto);
  });

  it('should accept valid transaction detail data', () => {
    const dto = new TransactionDetailDto();
    dto.id = 'tx-123';
    dto.transactionId = '0x123';
    dto.fromAddress = '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2';
    dto.toAddress = '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e';
    dto.tokenName = 'USDC';
    dto.amount = '100.50';
    dto.status = TransactionStatus.INITIATED;
    dto.statusHistory = [];
    dto.createdAt = new Date();
    dto.updatedAt = new Date();

    expect(dto.id).toBe('tx-123');
    expect(dto.transactionId).toBe('0x123');
    expect(dto.status).toBe('Initiated');
  });
});

describe('StatusUpdateDetailDto', () => {
  it('should be defined', () => {
    expect(StatusUpdateDetailDto).toBeDefined();
  });

  it('should create a valid instance', () => {
    const dto = new StatusUpdateDetailDto();
    expect(dto).toBeDefined();
    expect(dto).toBeInstanceOf(StatusUpdateDetailDto);
  });

  it('should accept valid status update data', () => {
    const dto = new StatusUpdateDetailDto();
    dto.id = 'status-123';
    dto.status = TransactionStatus.INITIATED;
    dto.timestamp = new Date();
    dto.createdAt = 1234567890;

    expect(dto.id).toBe('status-123');
    expect(dto.status).toBe('Initiated');
  });
});

describe('TransactionListResponseDto', () => {
  it('should be defined', () => {
    expect(TransactionListResponseDto).toBeDefined();
  });

  it('should create a valid instance', () => {
    const dto = new TransactionListResponseDto();
    expect(dto).toBeDefined();
    expect(dto).toBeInstanceOf(TransactionListResponseDto);
  });

  it('should accept valid list response data', () => {
    const dto = new TransactionListResponseDto();
    dto.transactions = [];
    dto.total = 0;

    expect(dto.transactions).toEqual([]);
    expect(dto.total).toBe(0);
  });
});
