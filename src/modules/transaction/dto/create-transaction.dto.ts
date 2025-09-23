import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches, Length, IsEnum } from 'class-validator';
import { TransactionStatus } from '@/common/enums/transaction-status.enum';
import { DTO_MESSAGES } from './dto.messages';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Unique transaction identifier',
    example: '0xc817643232e94aec05b910aaa536dc5718299a089d6ec517a2706715b8f148a8',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: DTO_MESSAGES.TRANSACTION_ID.REQUIRED })
  @IsNotEmpty({ message: DTO_MESSAGES.TRANSACTION_ID.NOT_EMPTY })
  @Length(1, 100, { message: DTO_MESSAGES.TRANSACTION_ID.MIN_LENGTH })
  transactionId: string;

  /* RS > BCB - import { isAddress } from 'ethers'; for validation ..(?)  */
  @ApiProperty({
    description: 'Sender wallet address',
    example: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
    minLength: 42,
    maxLength: 42,
  })
  @IsString({ message: DTO_MESSAGES.FROM_ADDRESS.REQUIRED })
  @IsNotEmpty({ message: DTO_MESSAGES.FROM_ADDRESS.NOT_EMPTY })
  @Length(42, 42, { message: DTO_MESSAGES.FROM_ADDRESS.LENGTH })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: DTO_MESSAGES.FROM_ADDRESS.ETHEREUM_FORMAT,
  })
  fromAddress: string;

  /* RS > BCB - import { isAddress } from 'ethers'; for validation ..(?)  */
  @ApiProperty({
    description: 'Recipient wallet address',
    example: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
    minLength: 42,
    maxLength: 42,
  })
  @IsString({ message: DTO_MESSAGES.TO_ADDRESS.REQUIRED })
  @IsNotEmpty({ message: DTO_MESSAGES.TO_ADDRESS.NOT_EMPTY })
  @Length(42, 42, { message: DTO_MESSAGES.TO_ADDRESS.LENGTH })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: DTO_MESSAGES.TO_ADDRESS.ETHEREUM_FORMAT,
  })
  toAddress: string;

  @ApiProperty({
    description: 'Token name or symbol',
    example: 'USDC',
    minLength: 1,
    maxLength: 20,
  })
  @IsString({ message: DTO_MESSAGES.TOKEN_NAME.REQUIRED })
  @IsNotEmpty({ message: DTO_MESSAGES.TOKEN_NAME.NOT_EMPTY })
  @Length(1, 20, { message: DTO_MESSAGES.TOKEN_NAME.MIN_LENGTH })
  tokenName: string;

  @ApiProperty({
    description: 'Transaction amount with up to 18 decimal places',
    example: '1000.11',
    pattern: '^\\d+\\.\\d{1,18}$',
  })
  @IsString({ message: DTO_MESSAGES.AMOUNT.REQUIRED })
  @IsNotEmpty({ message: DTO_MESSAGES.AMOUNT.NOT_EMPTY })
  @Matches(/^\d+\.\d{1,18}$/, {
    message: DTO_MESSAGES.AMOUNT.DECIMAL_FORMAT,
  })
  amount: string;

  @ApiPropertyOptional({
    description: 'Initial transaction status (optional, defaults to Initiated)',
    enum: TransactionStatus,
    example: TransactionStatus.INITIATED,
  })
  @IsOptional()
  @IsEnum(TransactionStatus, {
    message: DTO_MESSAGES.STATUS.INVALID_ENUM,
  })
  status?: TransactionStatus;
}
