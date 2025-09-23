import { Test, TestingModule } from '@nestjs/testing';
import { TransactionModule } from './transaction.module';

describe('TransactionModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TransactionModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should be an instance of TransactionModule', () => {
    const transactionModule = module.get<TransactionModule>(TransactionModule);
    expect(transactionModule).toBeInstanceOf(TransactionModule);
  });
});
