/**
 * User-facing validation messages for DTOs
 * These messages are sent directly to API clients when validation fails
 */

import { TransactionStatus } from '@/common/enums/transaction-status.enum';

/**
 * Helper function to get all valid status values for dynamic error messages
 */
export const getValidStatusValues = (): string => {
  return Object.values(TransactionStatus).join(', ');
};

export const DTO_MESSAGES = {
  // Transaction ID validation
  TRANSACTION_ID: {
    REQUIRED: 'transactionId is required',
    MIN_LENGTH: 'transactionId must be longer than or equal to 1 characters',
    MAX_LENGTH: 'transactionId must be shorter than or equal to 100 characters',
    NOT_EMPTY: 'transactionId should not be empty',
  },

  // From Address validation
  FROM_ADDRESS: {
    REQUIRED: 'fromAddress is required',
    LENGTH: 'fromAddress must be exactly 42 characters',
    ETHEREUM_FORMAT: 'fromAddress must be a valid Ethereum address',
    NOT_EMPTY: 'fromAddress should not be empty',
  },

  // To Address validation
  TO_ADDRESS: {
    REQUIRED: 'toAddress is required',
    LENGTH: 'toAddress must be exactly 42 characters',
    ETHEREUM_FORMAT: 'toAddress must be a valid Ethereum address',
    NOT_EMPTY: 'toAddress should not be empty',
  },

  // Token Name validation
  TOKEN_NAME: {
    REQUIRED: 'tokenName is required',
    MIN_LENGTH: 'tokenName must be longer than or equal to 1 characters',
    MAX_LENGTH: 'tokenName must be shorter than or equal to 20 characters',
    NOT_EMPTY: 'tokenName should not be empty',
  },

  // Amount validation
  AMOUNT: {
    REQUIRED: 'amount is required',
    DECIMAL_FORMAT: 'amount must be a decimal with up to 18 decimal places',
    NOT_EMPTY: 'amount should not be empty',
  },

  // Status validation
  STATUS: {
    INVALID_ENUM: `status must be one of: ${getValidStatusValues()}`,
  },
} as const;
