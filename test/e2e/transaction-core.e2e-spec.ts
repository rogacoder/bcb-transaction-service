import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TransactionService } from '../../src/modules/transaction/services/transaction.service';

describe('Transaction Core E2E Tests', () => {
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

  describe('Key Requirements', () => {
    it('should be able to take input of crypto transactions and set their current state', () => {
      const createTransactionDto = {
        transactionId: '0xtest123',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '100.50',
        status: 'Initiated',
      };

      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', 'Bearer test-token')
        .send(createTransactionDto)
        .expect(201)
        .expect(res => {
          expect(res.body.transactionId).toBe(createTransactionDto.transactionId);
          expect(res.body.status).toBe(createTransactionDto.status);
          expect(res.body.fromAddress).toBe(createTransactionDto.fromAddress);
          expect(res.body.toAddress).toBe(createTransactionDto.toAddress);
          expect(res.body.tokenName).toBe(createTransactionDto.tokenName);
          expect(res.body.amount).toBe(createTransactionDto.amount);
        });
    });

    it('should be able to retrieve the current state of a transaction using the transaction id', () => {
      const createTransactionDto = {
        transactionId: '0xtest456',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '200.75',
        status: 'Processing',
      };

      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', 'Bearer test-token')
        .send(createTransactionDto)
        .expect(201)
        .then(() => {
          return request(app.getHttpServer())
            .get(`/transactions/${createTransactionDto.transactionId}`)
            .set('Authorization', 'Bearer test-token')
            .expect(200)
            .expect(res => {
              expect(res.body.transactionId).toBe(createTransactionDto.transactionId);
              expect(res.body.status).toBe(createTransactionDto.status);
            });
        });
    });

    it('should be able to list the state history of each transaction', () => {
      const createTransactionDto = {
        transactionId: '0xtest789',
        fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
        toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
        tokenName: 'USDC',
        amount: '300.25',
        status: 'Initiated',
      };

      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', 'Bearer test-token')
        .send(createTransactionDto)
        .expect(201)
        .then(() => {
          const updateDto = {
            ...createTransactionDto,
            status: 'Processing',
          };

          return request(app.getHttpServer())
            .post('/transactions')
            .set('Authorization', 'Bearer test-token')
            .send(updateDto)
            .expect(201);
        })
        .then(() => {
          return request(app.getHttpServer())
            .get(`/transactions/${createTransactionDto.transactionId}/history`)
            .set('Authorization', 'Bearer test-token')
            .expect(200)
            .expect(res => {
              expect(res.body).toHaveLength(2);
              expect(res.body[0].status).toBe('Initiated');
              expect(res.body[1].status).toBe('Processing');
            });
        });
    });

    it('should be able to list the status of all transactions in a single call', () => {
      const transactions = [
        {
          transactionId: '0xtest111',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.00',
          status: 'Initiated',
        },
        {
          transactionId: '0xtest222',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '200.00',
          status: 'Processing',
        },
      ];

      // Create multiple transactions
      return Promise.all(
        transactions.map(tx =>
          request(app.getHttpServer())
            .post('/transactions')
            .set('Authorization', 'Bearer test-token')
            .send(tx)
            .expect(201),
        ),
      ).then(() => {
        return request(app.getHttpServer())
          .get('/transactions')
          .set('Authorization', 'Bearer test-token')
          .expect(200)
          .expect(res => {
            expect(res.body.transactions).toHaveLength(2);
            expect(res.body.total).toBe(2);
            expect(res.body.transactions[0].transactionId).toBe('0xtest111');
            expect(res.body.transactions[1].transactionId).toBe('0xtest222');
          });
      });
    });
  });

  describe('Core Test Cases', () => {
    describe('POST /transactions - Core Functionality', () => {
      it('should create a new transaction', () => {
        const createTransactionDto = {
          transactionId: '0xtest123',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '100.50',
          status: 'Initiated',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(createTransactionDto)
          .expect(201)
          .expect(res => {
            expect(res.body.transactionId).toBe(createTransactionDto.transactionId);
            expect(res.body.status).toBe(createTransactionDto.status);
            expect(res.body.fromAddress).toBe(createTransactionDto.fromAddress);
            expect(res.body.toAddress).toBe(createTransactionDto.toAddress);
            expect(res.body.tokenName).toBe(createTransactionDto.tokenName);
            expect(res.body.amount).toBe(createTransactionDto.amount);
            expect(res.body.statusHistory).toHaveLength(1);
            expect(res.body.statusHistory[0].status).toBe('Initiated');
          });
      });

      it('should update an existing transaction', () => {
        const createTransactionDto = {
          transactionId: '0xtest456',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '200.75',
          status: 'Initiated',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(createTransactionDto)
          .expect(201)
          .then(() => {
            const updateDto = {
              ...createTransactionDto,
              status: 'Processing',
            };

            return request(app.getHttpServer())
              .post('/transactions')
              .set('Authorization', 'Bearer test-token')
              .send(updateDto)
              .expect(201)
              .expect(res => {
                expect(res.body.transactionId).toBe(createTransactionDto.transactionId);
                expect(res.body.status).toBe('Processing');
                expect(res.body.statusHistory).toHaveLength(2);
                expect(res.body.statusHistory[0].status).toBe('Initiated');
                expect(res.body.statusHistory[1].status).toBe('Processing');
              });
          });
      });

      it('should handle out-of-order updates (key requirement)', () => {
        const transactionId = '0xtest789';
        const createTransactionDto = {
          transactionId,
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '300.25',
          status: 'Initiated',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(createTransactionDto)
          .expect(201)
          .then(() => {
            // Send Processing status (higher priority)
            const processingDto = {
              ...createTransactionDto,
              status: 'Processing',
            };

            return request(app.getHttpServer())
              .post('/transactions')
              .set('Authorization', 'Bearer test-token')
              .send(processingDto)
              .expect(201);
          })
          .then(() => {
            // Send InMemPool status (lower priority) out of order
            const inMemPoolDto = {
              ...createTransactionDto,
              status: 'InMemPool',
            };

            return request(app.getHttpServer())
              .post('/transactions')
              .set('Authorization', 'Bearer test-token')
              .send(inMemPoolDto)
              .expect(201);
          })
          .then(() => {
            // Verify current status is still Processing (higher priority)
            return request(app.getHttpServer())
              .get(`/transactions/${transactionId}`)
              .set('Authorization', 'Bearer test-token')
              .expect(200)
              .expect(res => {
                expect(res.body.status).toBe('Processing');
                expect(res.body.statusHistory).toHaveLength(3);
                expect(res.body.statusHistory[0].status).toBe('Initiated');
                expect(res.body.statusHistory[1].status).toBe('Processing');
                expect(res.body.statusHistory[2].status).toBe('InMemPool');
              });
          });
      });
    });

    describe('GET /transactions - Data Retrieval', () => {
      it('should return all transactions', () => {
        const transactions = [
          {
            transactionId: '0xtest111',
            fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
            toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
            tokenName: 'USDC',
            amount: '100.00',
            status: 'Initiated',
          },
          {
            transactionId: '0xtest222',
            fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
            toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
            tokenName: 'USDC',
            amount: '200.00',
            status: 'Processing',
          },
        ];

        return Promise.all(
          transactions.map(tx =>
            request(app.getHttpServer())
              .post('/transactions')
              .set('Authorization', 'Bearer test-token')
              .send(tx)
              .expect(201),
          ),
        ).then(() => {
          return request(app.getHttpServer())
            .get('/transactions')
            .set('Authorization', 'Bearer test-token')
            .expect(200)
            .expect(res => {
              expect(res.body.transactions).toHaveLength(2);
              expect(res.body.total).toBe(2);
              expect(res.body.transactions[0].transactionId).toBe('0xtest111');
              expect(res.body.transactions[1].transactionId).toBe('0xtest222');
            });
        });
      });

      it('should return a specific transaction by ID', () => {
        const createTransactionDto = {
          transactionId: '0xtest333',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '300.00',
          status: 'Complete',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(createTransactionDto)
          .expect(201)
          .then(() => {
            return request(app.getHttpServer())
              .get(`/transactions/${createTransactionDto.transactionId}`)
              .set('Authorization', 'Bearer test-token')
              .expect(200)
              .expect(res => {
                expect(res.body.transactionId).toBe(createTransactionDto.transactionId);
                expect(res.body.status).toBe(createTransactionDto.status);
                expect(res.body.fromAddress).toBe(createTransactionDto.fromAddress);
                expect(res.body.toAddress).toBe(createTransactionDto.toAddress);
                expect(res.body.tokenName).toBe(createTransactionDto.tokenName);
                expect(res.body.amount).toBe(createTransactionDto.amount);
              });
          });
      });

      it('should return transaction status history', () => {
        const createTransactionDto = {
          transactionId: '0xtest444',
          fromAddress: '0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2',
          toAddress: '0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e',
          tokenName: 'USDC',
          amount: '400.00',
          status: 'Initiated',
        };

        return request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', 'Bearer test-token')
          .send(createTransactionDto)
          .expect(201)
          .then(() => {
            const updateDto = {
              ...createTransactionDto,
              status: 'Processing',
            };

            return request(app.getHttpServer())
              .post('/transactions')
              .set('Authorization', 'Bearer test-token')
              .send(updateDto)
              .expect(201);
          })
          .then(() => {
            return request(app.getHttpServer())
              .get(`/transactions/${createTransactionDto.transactionId}/history`)
              .set('Authorization', 'Bearer test-token')
              .expect(200)
              .expect(res => {
                expect(res.body).toHaveLength(2);
                expect(res.body[0].status).toBe('Initiated');
                expect(res.body[1].status).toBe('Processing');
              });
          });
      });
    });
  });
});
