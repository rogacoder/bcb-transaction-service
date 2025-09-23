export const TRANSACTION_MESSAGES = {
  // Descriptions
  CREATE_OR_UPDATE_SUMMARY: 'Create or update a transaction',
  CREATE_OR_UPDATE_DESCRIPTION:
    'Creates a new transaction or updates an existing one with new status information',
  GET_ALL_SUMMARY: 'Get all transactions',
  GET_ALL_DESCRIPTION:
    'Retrieves a summary list of all transactions with HATEOAS links. Use the history link to get full status details.',
  GET_BY_ID_SUMMARY: 'Get transaction by ID',
  GET_BY_ID_DESCRIPTION: 'Retrieves a specific transaction by its transaction ID',
  GET_HISTORY_SUMMARY: 'Get transaction status history',
  GET_HISTORY_DESCRIPTION: 'Retrieves the complete status history for a specific transaction',

  // Response
  CREATED_SUCCESS: 'Transaction created or updated successfully',
  INVALID_INPUT: 'Invalid input data',
  UNAUTHORIZED: 'Authorization header is required',
  INVALID_TOKEN: 'Bearer token is required',
  TRANSACTION_FOUND: 'Transaction found',
  TRANSACTION_NOT_FOUND: 'Transaction not found',
  LIST_WITH_HATEOAS: 'List of all transactions with HATEOAS links',
  TRANSACTION_STATUS_HISTORY: 'Transaction status history',
} as const;

export type TransactionMessageKey = keyof typeof TRANSACTION_MESSAGES;
