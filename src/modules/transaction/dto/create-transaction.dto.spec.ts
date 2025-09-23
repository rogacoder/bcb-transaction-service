import { CreateTransactionDto } from './create-transaction.dto';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';

describe('CreateTransactionDto', () => {
  it('should be defined', () => {
    expect(CreateTransactionDto).toBeDefined();
  });

  it('should create a valid instance', () => {
    const dto = new CreateTransactionDto();
    expect(dto).toBeInstanceOf(CreateTransactionDto);
  });

  it('should accept valid transaction data', () => {
    const validData = {
      transactionId: '0xtest123',
      fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
      toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
      tokenName: 'USDC',
      amount: '100.50',
      status: TransactionStatus.INITIATED,
    };

    const dto = Object.assign(new CreateTransactionDto(), validData);

    expect(dto.transactionId).toBe(validData.transactionId);
    expect(dto.fromAddress).toBe(validData.fromAddress);
    expect(dto.toAddress).toBe(validData.toAddress);
    expect(dto.tokenName).toBe(validData.tokenName);
    expect(dto.amount).toBe(validData.amount);
    expect(dto.status).toBe(validData.status);
  });

  it('should handle optional fields', () => {
    const minimalData = {
      transactionId: '0xtest123',
      fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
      toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
      tokenName: 'USDC',
      amount: '100.50',
    };

    const dto = Object.assign(new CreateTransactionDto(), minimalData);

    expect(dto.transactionId).toBe(minimalData.transactionId);
    expect(dto.status).toBeUndefined();
  });
});
