import { TRANSACTION_STATUS_CONFIG, StatusConfig } from './transaction-status.config';

describe('TransactionStatusConfig', () => {
  it('should be defined', () => {
    expect(TRANSACTION_STATUS_CONFIG).toBeDefined();
  });

  it('should have the correct structure', () => {
    expect(TRANSACTION_STATUS_CONFIG).toHaveProperty('statuses');
    expect(typeof TRANSACTION_STATUS_CONFIG.statuses).toBe('object');
  });

  it('should have all required statuses', () => {
    const expectedStatuses = [
      'Initiated',
      'InMemPool',
      'Processing',
      'InCompliance',
      'Complete',
      'Failed',
    ];
    const actualStatuses = Object.keys(TRANSACTION_STATUS_CONFIG.statuses);

    expectedStatuses.forEach(status => {
      expect(actualStatuses).toContain(status);
    });
  });

  it('should have valid status configurations', () => {
    Object.values(TRANSACTION_STATUS_CONFIG.statuses).forEach((config: StatusConfig) => {
      expect(config).toHaveProperty('priority');
      expect(config).toHaveProperty('isTerminal');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('allowedTransitions');

      expect(typeof config.priority).toBe('number');
      expect(typeof config.isTerminal).toBe('boolean');
      expect(typeof config.description).toBe('string');
      expect(Array.isArray(config.allowedTransitions)).toBe(true);
    });
  });

  it('should have terminal statuses marked correctly', () => {
    const terminalStatuses = Object.entries(TRANSACTION_STATUS_CONFIG.statuses)
      .filter(([, config]) => config.isTerminal)
      .map(([status]) => status);

    expect(terminalStatuses).toContain('Complete');
    expect(terminalStatuses).toContain('Failed');
  });

  it('should have non-terminal statuses marked correctly', () => {
    const nonTerminalStatuses = Object.entries(TRANSACTION_STATUS_CONFIG.statuses)
      .filter(([, config]) => !config.isTerminal)
      .map(([status]) => status);

    expect(nonTerminalStatuses).toContain('Initiated');
    expect(nonTerminalStatuses).toContain('InMemPool');
    expect(nonTerminalStatuses).toContain('Processing');
    expect(nonTerminalStatuses).toContain('InCompliance');
  });
});
