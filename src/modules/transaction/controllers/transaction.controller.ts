/*
RS > BCB:  endpoints might be in diff files - transaction.controller.get, transaction.controller.put ...
- future - if used in a CQRS pattern (running with different needs )
*/

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionService } from '@services/transaction.service';
import {
  CreateTransactionDto,
  TransactionDetailDto,
  TransactionListItemDto,
  TransactionListResponseDto,
} from '@dto/index';
// Future: potential need to track the "referrer" (user || system) for audit purposes
// import { UpdateSource } from '@/common/enums/transaction-status.enum';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { TRANSACTION_MESSAGES } from './transaction.controller.messages';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // CREATE/UPDATE

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: TRANSACTION_MESSAGES.CREATE_OR_UPDATE_SUMMARY,
    description: TRANSACTION_MESSAGES.CREATE_OR_UPDATE_DESCRIPTION,
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: TRANSACTION_MESSAGES.CREATED_SUCCESS,
    type: TransactionDetailDto,
  })
  @ApiResponse({
    status: 400,
    description: TRANSACTION_MESSAGES.INVALID_INPUT,
  })
  @ApiResponse({
    status: 401,
    description: TRANSACTION_MESSAGES.UNAUTHORIZED,
  })
  createOrUpdateTransaction(
    @Body(ValidationPipe) createTransactionDto: CreateTransactionDto,
  ): TransactionDetailDto {
    return this.transactionService.createOrUpdate(createTransactionDto);
  }

  // UPDATE

  /*

    // RS > BCB : In REST, the expected pattern would be to enable an Update at this endpoint. 
    // Keeping this simople for the tech test (as a post at / handles the case currently )
    
    @Put(':id')
    @ApiOperation({
      summary: TRANSACTION_MESSAGES.UPDATE_BY_ID_SUMMARY,
      description: TRANSACTION_MESSAGES.UPDATE_BY_ID_DESCRIPTION,
    })
      ...

  */

  // READ

  @Get()
  @ApiOperation({
    summary: TRANSACTION_MESSAGES.GET_ALL_SUMMARY,
    description: TRANSACTION_MESSAGES.GET_ALL_DESCRIPTION,
  })
  @ApiResponse({
    status: 200,
    description: TRANSACTION_MESSAGES.LIST_WITH_HATEOAS,
    type: TransactionListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: TRANSACTION_MESSAGES.UNAUTHORIZED,
  })
  getAllTransactions(): { transactions: TransactionListItemDto[]; total: number } {
    const transactions = this.transactionService.getAllSummaries();
    return {
      transactions,
      total: transactions.length,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: TRANSACTION_MESSAGES.GET_BY_ID_SUMMARY,
    description: TRANSACTION_MESSAGES.GET_BY_ID_DESCRIPTION,
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    example: '0xc817643232e94aec05b910aaa536dc5718299a089d6ec517a2706715b8f148a8',
  })
  @ApiResponse({
    status: 200,
    description: TRANSACTION_MESSAGES.TRANSACTION_FOUND,
    type: TransactionDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: TRANSACTION_MESSAGES.TRANSACTION_NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: TRANSACTION_MESSAGES.UNAUTHORIZED,
  })
  getTransaction(@Param('id') id: string): TransactionDetailDto {
    return this.transactionService.getById(id);
  }

  @Get(':id/history')
  @ApiOperation({
    summary: TRANSACTION_MESSAGES.GET_HISTORY_SUMMARY,
    description: TRANSACTION_MESSAGES.GET_HISTORY_DESCRIPTION,
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    example: '0xc817643232e94aec05b910aaa536dc5718299a089d6ec517a2706715b8f148a8',
  })
  @ApiResponse({
    status: 200,
    description: TRANSACTION_MESSAGES.TRANSACTION_STATUS_HISTORY,
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          createdAt: { type: 'number' },
          metadata: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: TRANSACTION_MESSAGES.TRANSACTION_NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: TRANSACTION_MESSAGES.UNAUTHORIZED,
  })
  getTransactionHistory(@Param('id') id: string) {
    return this.transactionService.getHistory(id);
  }
}
