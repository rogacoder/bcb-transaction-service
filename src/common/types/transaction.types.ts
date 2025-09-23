// Import enums from common location
import { TransactionStatus } from '../enums/transaction-status.enum';

export interface Transaction {
  id: string;
  transactionId: string;
  fromAddress: string;
  toAddress: string;
  tokenName: string;
  amount: string;
  status: TransactionStatus;
  statusHistory: StatusUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusUpdate {
  id: string;
  status: TransactionStatus;
  timestamp: Date;
  createdAt: number;
  // RS > BCB: Future: potential need to track the "referrer" (user || system) for audit purposes
  // Future: metadata?: Record<string, unknown>; // For future blockchain-specific data
}

// Re-export for convenience
export { TransactionStatus };
