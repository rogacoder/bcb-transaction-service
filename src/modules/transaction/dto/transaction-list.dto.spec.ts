import { TransactionListItemDto, LinkDto } from './transaction-list.dto';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';

describe('TransactionListItemDto', () => {
  it('should be defined', () => {
    expect(TransactionListItemDto).toBeDefined();
  });

  it('should create a valid instance', () => {
    const dto = new TransactionListItemDto();
    expect(dto).toBeDefined();
    expect(dto).toBeInstanceOf(TransactionListItemDto);
  });

  it('should accept valid transaction list item data', () => {
    const dto = new TransactionListItemDto();
    dto.id = 'tx-123';
    dto.transactionId = '0x123';
    dto.fromAddress = '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2';
    dto.toAddress = '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e';
    dto.tokenName = 'USDC';
    dto.amount = '100.50';
    dto.status = TransactionStatus.INITIATED;
    dto.statusHistoryCount = 1;
    dto.createdAt = '2025-01-01T10:00:00.000Z';
    dto.updatedAt = '2025-01-01T10:00:00.000Z';
    dto._links = {
      self: { href: '/transactions/123', method: 'GET', description: 'Get transaction' },
      history: { href: '/transactions/123/history', method: 'GET', description: 'Get history' },
      update: { href: '/transactions/123/status', method: 'POST', description: 'Update status' },
    };

    expect(dto.id).toBe('tx-123');
    expect(dto.transactionId).toBe('0x123');
    expect(dto.status).toBe('Initiated');
  });
});

describe('LinkDto', () => {
  it('should be defined', () => {
    expect(LinkDto).toBeDefined();
  });

  it('should create a valid instance', () => {
    const dto = new LinkDto();
    expect(dto).toBeDefined();
    expect(dto).toBeInstanceOf(LinkDto);
  });

  it('should accept valid link data', () => {
    const dto = new LinkDto();
    dto.href = '/transactions/123';
    dto.method = 'GET';
    dto.description = 'Get transaction details';

    expect(dto.href).toBe('/transactions/123');
    expect(dto.method).toBe('GET');
    expect(dto.description).toBe('Get transaction details');
  });
});
