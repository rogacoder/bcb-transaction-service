# BCB Transaction Management Service

Crypto transaction state management service built with NestJS

## Demo

[https://bcb-wip-production.up.railway.app/api/docs#/](https://bcb-wip-production.up.railway.app/api/docs#/)

## Requirements

This service must:

1. **Take input of crypto transactions and set their current state**
   - Accept transaction payloads via POST /transactions
   - Validate required fields (transactionId, fromAddress, toAddress, tokenName,
     amount)
   - Set initial or update existing transaction status

2. **Retrieve the current state of a transaction using the transaction id**
   - GET /transactions/:id returns transaction details
   - Returns current status and complete transaction information

3. **List the state history of each transaction**
   - GET /transactions/:id/history returns chronological status history
   - Preserves complete audit trail of all status changes

4. **List the status of all transactions in a single call**
   - GET /transactions returns paginated list of all transactions
   - Includes transaction summaries with current status

5. **Handle out-of-order status updates gracefully**
   - Maintains highest priority status as current
   - Records all status updates in chronological history
   - Handles complex out-of-order scenarios

## API Endpoints

### Transaction Management

- `POST /transactions` - Create or update transaction
- `GET /transactions` - Get all transactions
- `GET /transactions/:id` - Get specific transaction
- `GET /transactions/:id/history` - Get transaction status history

### Health (not requested ...)

- `GET /health` - Health check

## Tech Stack - Core

- **NestJS**
- **TypeScript**
- **Jest**
- **Swagger/OpenAPI**
- **In-memory storage**

## Tech Stack - 3rd Parties /libs

- None

## Prerequisites

- **Node.js** 18+

## Approach

### General Development Process for the exercise

1. **Create stub endpoints** - (quick/ AI generated ) Required for the tests -
   simple response
2. **Create E2E tests** (quick/ AI generated with expected reposnses ) of the
   core requirements (confirm requirments before starting any work )
3. **Create DTOs / types and interfaces**
4. **Logic / Services**
5. **Wire up to the e2e tests**

### Post-Development

- **Lock down with Unit tests**
- **Static code checks / linting / Quality**

### Service Layer Setup (create/update)

```
TransactionController
    ↓
TransactionService (Business Logic)
    ↓
TransactionValidationService (Contract)
    ↓
TransactionPriorityService (State Priority Rules - handeling "out of order" updates)
```

## Development

### Installation

`npm install`

````
### Running the Application

```bash
# Development mode (empty store)
npm run start:dev

# Development mode with mock data (as given from data.csv)
npm run start:dev:mock
````

### Production

```bash
# Build first
npm run build

# Production without mock data

npm run start:prod

# Production with mock data

npm run start:prod:mock
```

## Testing

### Unit Tests

```bash
# Run with coverage
npm run test:cov


# Run with HTML coverage report
npm run test:cov:html
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e
```

# Some Manual Tests (AI generated)

## 1. Health Check (No Auth Required)

```bash
curl -s http://localhost:3000/health
```

### 2. Test Authentication - Missing Auth (Should Fail)

```bash
curl -s -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d '{"transactionId":"0xtest123","fromAddress":"0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2","toAddress":"0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e","tokenName":"USDC","amount":"100.50"}'
```

### 3. Test Valid Transaction Creation

```bash
curl -s -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -H "Authorization: Bearer test-token" -d '{"transactionId":"0xtest123","fromAddress":"0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2","toAddress":"0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e","tokenName":"USDC","amount":"100.50","status":"Initiated"}'
```

### 4. Test Get Transaction by ID

```bash
curl -s -X GET http://localhost:3000/transactions/0xtest123 -H "Authorization: Bearer test-token"
```

### 5. Test Get All Transactions

```bash
curl -s -X GET http://localhost:3000/transactions -H "Authorization: Bearer test-token"
```

### 6. Test Invalid Data - Missing Required Fields

```bash
curl -s -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -H "Authorization: Bearer test-token" -d '{"transactionId":"0xtest456"}'
```

### 7. Test Invalid Ethereum Address

```bash
curl -s -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -H "Authorization: Bearer test-token" -d '{"transactionId":"0xtest789","fromAddress":"invalid-address","toAddress":"0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e","tokenName":"USDC","amount":"100.50"}'
```

### 8. Test Invalid Status

```bash
curl -s -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -H "Authorization: Bearer test-token" -d '{"transactionId":"0xtest999","fromAddress":"0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2","toAddress":"0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e","tokenName":"USDC","amount":"100.50","status":"InvalidStatus"}'
```

### 9. Test Invalid Amount Format

```bash
curl -s -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -H "Authorization: Bearer test-token" -d '{"transactionId":"0xtest888","fromAddress":"0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2","toAddress":"0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e","tokenName":"USDC","amount":"not-a-number"}'
```

### 10. Test Status Update (Out-of-Order Scenario)

```bash
curl -s -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -H "Authorization: Bearer test-token" -d '{"transactionId":"0xtest123","fromAddress":"0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2","toAddress":"0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e","tokenName":"USDC","amount":"100.50","status":"Processing"}'
```

### 11. Test Status History

```bash
curl -s -X GET http://localhost:3000/transactions/0xtest123/history -H "Authorization: Bearer test-token"
```

### 12. Test Out-of-Order Update (Lower Priority After Higher)

```bash
curl -s -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -H "Authorization: Bearer test-token" -d '{"transactionId":"0xtest123","fromAddress":"0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2","toAddress":"0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e","tokenName":"USDC","amount":"100.50","status":"InMemPool"}'
```

### 13. Test 404 - Non-existent Transaction

```bash
curl -s -X GET http://localhost:3000/transactions/nonexistent -H "Authorization: Bearer test-token"
```

### 14. Test Invalid Auth Token Format

```bash
curl -s -X GET http://localhost:3000/transactions -H "Authorization: InvalidFormat test-token"
```

## Static Analysis (SonarQube with default quality gate for Typescript)

### **PASSED** ✅

| Metric                | Rating    | Details             |
| --------------------- | --------- | ------------------- |
| **Security**          | **A**     | 0 Open issues       |
| **Reliability**       | **A**     | 0 Open issues       |
| **Maintainability**   | **A**     | 0 Open issues       |
| **Coverage**          | **92.6%** | Unit Tests          |
| **Duplications**      | **0.0%**  | No code duplication |
| **Security Hotspots** | **A**     | 0 Security hotspots |
