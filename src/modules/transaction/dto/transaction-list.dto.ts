import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';

export class LinkDto {
  @ApiProperty({
    description: 'The URL of the linked resource',
    example: '/transactions/0xdemo123456789abcdef/history',
  })
  href: string;

  @ApiProperty({
    description: 'The HTTP method for the linked resource',
    example: 'GET',
  })
  method: string;

  @ApiProperty({
    description: 'A description of what the link represents',
    example: 'Get the complete status history for this transaction',
  })
  description: string;
}

export class TransactionListItemDto {
  @ApiProperty({
    description: 'Unique transaction identifier',
    example: 'tx-0xdemo123456789abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Blockchain transaction ID',
    example: '0xdemo123456789abcdef',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Source wallet address',
    example: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
  })
  fromAddress: string;

  @ApiProperty({
    description: 'Destination wallet address',
    example: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
  })
  toAddress: string;

  @ApiProperty({
    description: 'Token name',
    example: 'USDC',
  })
  tokenName: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: '100.50',
  })
  amount: string;

  @ApiProperty({
    description: 'Current transaction status',
    enum: TransactionStatus,
    example: TransactionStatus.INITIATED,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'Number of status updates in history',
    example: 3,
  })
  statusHistoryCount: number;

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2025-01-01T10:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-01T10:05:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'HATEOAS links for related resources',
    type: [LinkDto],
  })
  _links: {
    self: LinkDto;
    history: LinkDto;
    update: LinkDto;
  };
}
