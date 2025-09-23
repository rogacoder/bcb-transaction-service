import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TransactionService } from '../../src/modules/transaction/services/transaction.service';

describe('Transaction Out of Order E2E Tests', () => {
  let app: INestApplication;
  let transactionService: TransactionService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    transactionService = moduleFixture.get<TransactionService>(TransactionService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Clear all transactions before each test
    transactionService.clearAll();
  });

  describe('Out of Order Handling', () => {
    it('should maintain higher priority status when lower priority status arrives out of order', () => {
      const transactionId = '0xoutoforder1';

      // First: Create transaction with "Processing" status (higher priority)
      const processingDto = {
        transactionId,
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.00',
        status: 'Processing',
      };

      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', 'Bearer test-token')
        .send(processingDto)
        .expect(201)
        .then(() => {
          // Second: Send "InMemPool" status (lower priority) out of order
          const inMemPoolDto = {
            ...processingDto,
            status: 'InMemPool',
          };

          return request(app.getHttpServer())
            .post('/transactions')
            .set('Authorization', 'Bearer test-token')
            .send(inMemPoolDto)
            .expect(201);
        })
        .then(() => {
          // Verify current status is still "Processing" (higher priority)
          return request(app.getHttpServer())
            .get(`/transactions/${transactionId}`)
            .set('Authorization', 'Bearer test-token')
            .expect(200)
            .expect(res => {
              expect(res.body.status).toBe('Processing');
            });
        })
        .then(() => {
          // Verify history contains both statuses
          return request(app.getHttpServer())
            .get(`/transactions/${transactionId}/history`)
            .set('Authorization', 'Bearer test-token')
            .expect(200)
            .expect(res => {
              expect(res.body).toHaveLength(2);
              expect(res.body[0].status).toBe('Processing');
              expect(res.body[1].status).toBe('InMemPool');
            });
        });
    });

    it('should update to higher priority status when it arrives after lower priority status', () => {
      const transactionId = '0xoutoforder2';

      // First: Create transaction with "InMemPool" status (lower priority)
      const inMemPoolDto = {
        transactionId,
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '200.00',
        status: 'InMemPool',
      };

      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', 'Bearer test-token')
        .send(inMemPoolDto)
        .expect(201)
        .then(() => {
          // Second: Send "Processing" status (higher priority) out of order
          const processingDto = {
            ...inMemPoolDto,
            status: 'Processing',
          };

          return request(app.getHttpServer())
            .post('/transactions')
            .set('Authorization', 'Bearer test-token')
            .send(processingDto)
            .expect(201);
        })
        .then(() => {
          // Verify current status is now "Processing" (higher priority)
          return request(app.getHttpServer())
            .get(`/transactions/${transactionId}`)
            .set('Authorization', 'Bearer test-token')
            .expect(200)
            .expect(res => {
              expect(res.body.status).toBe('Processing');
            });
        })
        .then(() => {
          // Verify history contains both statuses in chronological order
          return request(app.getHttpServer())
            .get(`/transactions/${transactionId}/history`)
            .set('Authorization', 'Bearer test-token')
            .expect(200)
            .expect(res => {
              expect(res.body).toHaveLength(2);
              expect(res.body[0].status).toBe('InMemPool');
              expect(res.body[1].status).toBe('Processing');
            });
        });
    });

    it('should handle complex out-of-order scenario with multiple status updates', () => {
      const transactionId = '0xoutoforder3';

      // Create initial transaction
      const initialDto = {
        transactionId,
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '300.00',
        status: 'Initiated',
      };

      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', 'Bearer test-token')
        .send(initialDto)
        .expect(201)
        .then(() => {
          // Send statuses out of order: Complete -> InMemPool -> Processing
          const statuses = ['Complete', 'InMemPool', 'Processing'];

          return Promise.all(
            statuses.map(status => {
              const dto = { ...initialDto, status };
              return request(app.getHttpServer())
                .post('/transactions')
                .set('Authorization', 'Bearer test-token')
                .send(dto)
                .expect(201);
            }),
          );
        })
        .then(() => {
          // Verify current status is "Complete" (highest priority)
          return request(app.getHttpServer())
            .get(`/transactions/${transactionId}`)
            .set('Authorization', 'Bearer test-token')
            .expect(200)
            .expect(res => {
              expect(res.body.status).toBe('Complete');
            });
        })
        .then(() => {
          // Verify history contains all 4 statuses in chronological order
          return request(app.getHttpServer())
            .get(`/transactions/${transactionId}/history`)
            .set('Authorization', 'Bearer test-token')
            .expect(200)
            .expect(res => {
              expect(res.body).toHaveLength(4);
              expect(res.body[0].status).toBe('Initiated');
              expect(res.body[1].status).toBe('Complete');
              expect(res.body[2].status).toBe('InMemPool');
              expect(res.body[3].status).toBe('Processing');
            });
        });
    });
  });
});
