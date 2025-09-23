import { Injectable } from '@nestjs/common';
import {
  TRANSACTION_STATUS_CONFIG,
  TransactionStatusConfig,
  StatusConfig,
} from '../../../config/transaction-status.config';

@Injectable()
export class TransactionConfigService {
  private static instance: TransactionConfigService;
  private readonly _config: TransactionStatusConfig = TRANSACTION_STATUS_CONFIG;

  public static getInstance(): TransactionConfigService {
    if (!TransactionConfigService.instance) {
      TransactionConfigService.instance = new TransactionConfigService();
    }
    return TransactionConfigService.instance;
  }

  public get config(): TransactionStatusConfig {
    return this._config;
  }

  public getStatusConfig(status: string): StatusConfig | undefined {
    return this._config.statuses[status];
  }

  public getStatusPriority(status: string): number {
    return this._config.statuses[status]?.priority ?? 0;
  }

  public isTerminalStatus(status: string): boolean {
    return this._config.statuses[status]?.isTerminal ?? false;
  }

  public getAllowedTransitions(status: string): string[] {
    return this._config.statuses[status]?.allowedTransitions ?? [];
  }

  public isValidTransition(from: string, to: string): boolean {
    if (from === to) return true; // Same status is always allowed (idempotent)
    const allowedTransitions = this.getAllowedTransitions(from);
    return allowedTransitions.includes(to);
  }

  public getStatuses(): Record<string, StatusConfig> {
    return this._config.statuses;
  }
}
