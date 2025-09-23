import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingService],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a log method', () => {
    expect(typeof service.log).toBe('function');
  });

  it('should call log method without errors', () => {
    expect(() => {
      service.log('Test message');
      service.log('Test message with data', { key: 'value' });
      service.log('Test message with null', null);
      service.log('Test message with undefined', undefined);
    }).not.toThrow();
  });
});
