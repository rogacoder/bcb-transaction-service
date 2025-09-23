import { TransactionStatus } from '../common/enums/transaction-status.enum';

export interface StatusConfig {
  priority: number;
  isTerminal: boolean;
  description: string;
  allowedTransitions: TransactionStatus[];
}

export interface TransactionStatusConfig {
  statuses: Record<TransactionStatus, StatusConfig>;
}

export const TRANSACTION_STATUS_CONFIG: TransactionStatusConfig = {
  statuses: {
    [TransactionStatus.INITIATED]: {
      priority: 1,
      isTerminal: false,
      description: 'Transaction created and waiting to be processed',
      allowedTransitions: [TransactionStatus.IN_MEM_POOL, TransactionStatus.FAILED],
    },
    [TransactionStatus.IN_MEM_POOL]: {
      priority: 2,
      isTerminal: false,
      description: 'Transaction is in blockchain memory pool',
      allowedTransitions: [TransactionStatus.PROCESSING, TransactionStatus.FAILED],
    },
    [TransactionStatus.PROCESSING]: {
      priority: 3,
      isTerminal: false,
      description: 'Transaction is being processed by miners',
      allowedTransitions: [TransactionStatus.IN_COMPLIANCE, TransactionStatus.FAILED],
    },
    [TransactionStatus.IN_COMPLIANCE]: {
      priority: 4,
      isTerminal: false,
      description: 'Transaction passed compliance checks',
      allowedTransitions: [TransactionStatus.COMPLETE, TransactionStatus.FAILED],
    },
    [TransactionStatus.COMPLETE]: {
      priority: 5,
      isTerminal: true,
      description: 'Transaction successfully completed',
      allowedTransitions: [],
    },
    [TransactionStatus.FAILED]: {
      priority: 0,
      isTerminal: true,
      description: 'Transaction failed',
      allowedTransitions: [],
    },
  },
};
