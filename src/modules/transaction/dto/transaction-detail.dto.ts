import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';
import { TransactionListItemDto } from './transaction-list.dto';

export class StatusUpdateDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    enum: TransactionStatus,
    example: TransactionStatus.INITIATED,
  })
  status: TransactionStatus;

  @ApiProperty()
  timestamp: Date;

  // Future: potential need to track the "referrer" (user || system) for audit purposes
  // @ApiProperty()
  // source: string;

  @ApiProperty()
  createdAt: number;

  @ApiProperty({ required: false })
  metadata?: Record<string, unknown>;
}

export class TransactionDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  fromAddress: string;

  @ApiProperty()
  toAddress: string;

  @ApiProperty()
  tokenName: string;

  @ApiProperty()
  amount: string;

  @ApiProperty({
    enum: TransactionStatus,
    example: TransactionStatus.INITIATED,
  })
  status: TransactionStatus;

  @ApiProperty({ type: [StatusUpdateDetailDto] })
  statusHistory: StatusUpdateDetailDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TransactionListResponseDto {
  @ApiProperty({ type: [TransactionListItemDto] })
  transactions: TransactionListItemDto[];

  @ApiProperty()
  total: number;
}
