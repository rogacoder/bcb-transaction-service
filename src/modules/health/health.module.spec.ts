import { Test, TestingModule } from '@nestjs/testing';
import { HealthModule } from './health.module';
import { HealthController } from './health.controller';

describe('HealthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have HealthController registered', () => {
    const controller = module.get<HealthController>(HealthController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(HealthController);
  });
});
