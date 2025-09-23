import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TransactionService } from '../../src/modules/transaction/services/transaction.service';
import { DTO_MESSAGES } from '../../src/modules/transaction/dto/dto.messages';
import { TRANSACTION_MESSAGES } from '../../src/modules/transaction/controllers/transaction.controller.messages';

describe('Transaction Errors E2E Tests', () => {
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

  describe('Error Cases', () => {
    describe('POST /transactions - Validation Errors', () => {
      it('should validate required fields', () => {
        const invalidDto = {
          // Missing required fields
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(invalidDto)
          .expect(400)
          .expect(res => {
            expect(res.body.message).toContain(DTO_MESSAGES.TRANSACTION_ID.NOT_EMPTY);
            expect(res.body.message).toContain(DTO_MESSAGES.FROM_ADDRESS.NOT_EMPTY);
            expect(res.body.message).toContain(DTO_MESSAGES.TO_ADDRESS.NOT_EMPTY);
            expect(res.body.message).toContain(DTO_MESSAGES.TOKEN_NAME.NOT_EMPTY);
            expect(res.body.message).toContain(DTO_MESSAGES.AMOUNT.NOT_EMPTY);
          });
      });

      it('should validate amount format', () => {
        const invalidDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: 'invalid-amount',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(invalidDto)
          .expect(400)
          .expect(res => {
            expect(res.body.message).toContain(DTO_MESSAGES.AMOUNT.DECIMAL_FORMAT);
          });
      });

      it('should validate empty transactionId', () => {
        const invalidDto = {
          transactionId: '',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(invalidDto)
          .expect(400)
          .expect(res => {
            expect(res.body.message).toContain(DTO_MESSAGES.TRANSACTION_ID.NOT_EMPTY);
          });
      });

      it('should validate invalid Ethereum addresses', () => {
        const invalidDto = {
          transactionId: '0xtest123',
          fromAddress: 'invalid-address',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(invalidDto)
          .expect(400)
          .expect(res => {
            expect(res.body.message).toContain(DTO_MESSAGES.FROM_ADDRESS.ETHEREUM_FORMAT);
          });
      });

      it('should validate invalid token name type', () => {
        const invalidDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 123, // Should be string
          amount: '100.50',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(invalidDto)
          .expect(400)
          .expect(res => {
            expect(res.body.message).toContain(DTO_MESSAGES.TOKEN_NAME.REQUIRED);
          });
      });

      it('should validate invalid status enum', () => {
        const invalidDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
          status: 'InvalidStatus',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(invalidDto)
          .expect(400)
          .expect(res => {
            expect(res.body.message).toContain(DTO_MESSAGES.STATUS.INVALID_ENUM);
          });
      });

      it('should validate amount with too many decimal places', () => {
        const invalidDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.1234567890123456789', // Too many decimal places
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(invalidDto)
          .expect(400)
          .expect(res => {
            expect(res.body.message).toContain(DTO_MESSAGES.AMOUNT.DECIMAL_FORMAT);
          });
      });

      it('should validate negative amounts', () => {
        const invalidDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '-100.50',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(invalidDto)
          .expect(400)
          .expect(res => {
            expect(res.body.message).toContain(DTO_MESSAGES.AMOUNT.DECIMAL_FORMAT);
          });
      });
    });

    describe('GET /transactions/:id - Not Found Errors', () => {
      it('should return 404 for non-existent transaction', () => {
        return request(app.getHttpServer())
          .get('/transactions/nonexistent')
          .set('Authorization', 'Bearer test-token')
          .expect(404)
          .expect(res => {
            expect(res.body.message).toContain('Transaction');
            expect(res.body.message).toContain('not found');
          });
      });
    });
  });

  describe('Authentication Error Cases', () => {
    describe('Missing Authorization Header', () => {
      it('should return 401 for POST /transactions without auth', () => {
        const createTransactionDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .send(createTransactionDto)
          .expect(401)
          .expect(res => {
            expect(res.body.message).toBe(TRANSACTION_MESSAGES.UNAUTHORIZED);
            expect(res.body.error).toBe('Unauthorized');
            expect(res.body.statusCode).toBe(401);
          });
      });

      it('should return 401 for GET /transactions without auth', () => {
        return request(app.getHttpServer())
          .get('/transactions')
          .expect(401)
          .expect(res => {
            expect(res.body.message).toBe(TRANSACTION_MESSAGES.UNAUTHORIZED);
            expect(res.body.error).toBe('Unauthorized');
            expect(res.body.statusCode).toBe(401);
          });
      });

      it('should return 401 for GET /transactions/:id without auth', () => {
        return request(app.getHttpServer())
          .get('/transactions/0xtest123')
          .expect(401)
          .expect(res => {
            expect(res.body.message).toBe(TRANSACTION_MESSAGES.UNAUTHORIZED);
            expect(res.body.error).toBe('Unauthorized');
            expect(res.body.statusCode).toBe(401);
          });
      });

      it('should return 401 for GET /transactions/:id/history without auth', () => {
        return request(app.getHttpServer())
          .get('/transactions/0xtest123/history')
          .expect(401)
          .expect(res => {
            expect(res.body.message).toBe(TRANSACTION_MESSAGES.UNAUTHORIZED);
            expect(res.body.error).toBe('Unauthorized');
            expect(res.body.statusCode).toBe(401);
          });
      });
    });

    describe('Invalid Authorization Header Format', () => {
      it('should return 401 for invalid Bearer token format', () => {
        const createTransactionDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'InvalidFormat token-123')
          .send(createTransactionDto)
          .expect(401)
          .expect(res => {
            expect(res.body.message).toBe(TRANSACTION_MESSAGES.INVALID_TOKEN);
            expect(res.body.error).toBe('Unauthorized');
            expect(res.body.statusCode).toBe(401);
          });
      });

      it('should return 401 for empty Bearer token', () => {
        const createTransactionDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer ')
          .send(createTransactionDto)
          .expect(401)
          .expect(res => {
            expect(res.body.message).toBe(TRANSACTION_MESSAGES.INVALID_TOKEN);
            expect(res.body.error).toBe('Unauthorized');
            expect(res.body.statusCode).toBe(401);
          });
      });

      it('should return 401 for Bearer token with only spaces', () => {
        const createTransactionDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer    ')
          .send(createTransactionDto)
          .expect(401)
          .expect(res => {
            expect(res.body.message).toBe(TRANSACTION_MESSAGES.INVALID_TOKEN);
            expect(res.body.error).toBe('Unauthorized');
            expect(res.body.statusCode).toBe(401);
          });
      });
    });

    describe('Valid Authentication', () => {
      it('should allow access with valid Bearer token', () => {
        const createTransactionDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer valid-token-123')
          .send(createTransactionDto)
          .expect(201)
          .expect(res => {
            expect(res.body.transactionId).toBe(createTransactionDto.transactionId);
            expect(res.body.status).toBe('Initiated');
          });
      });

      it('should allow access to GET endpoints with valid Bearer token', () => {
        return request(app.getHttpServer())
          .get('/transactions')
          .set('Authorization', 'Bearer valid-token-123')
          .expect(200)
          .expect(res => {
            expect(res.body.transactions).toBeDefined();
            expect(res.body.total).toBeDefined();
          });
      });
    });
  });
});
