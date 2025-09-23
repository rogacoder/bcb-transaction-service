# BCB Tech Test - API Test Cases (* AI generated file based on the e2e tests assertions )

**Note**: For testing against the production environment, replace
`localhost:3000` with
`https://bcb-transaction-service-production.up.railway.app/` in all curl
commands below.

### **Authentication**

All endpoints require Bearer token authentication:

```
Authorization: Bearer demo-token-123 (or anything)
```

---

## 📝 **POST /transactions - Create/Update Transaction**

### **Test Case 1: Create New Transaction (User)**

```json
{
    "transactionId": "0xdemo123456789abcdef",
    "fromAddress": "0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2",
    "toAddress": "0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e",
    "tokenName": "USDC",
    "amount": "100.50",
    "status": "Initiated"
}
```

### **Test Case 2: Update Transaction Status (Monitoring System)**

```json
{
    "transactionId": "0xdemo123456789abcdef",
    "fromAddress": "0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2",
    "toAddress": "0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e",
    "tokenName": "USDC",
    "amount": "100.50",
    "status": "Processing"
}
```

### **Test Case 3: Out-of-Order Update Demo**

```json
{
    "transactionId": "0xdemo123456789abcdef",
    "fromAddress": "0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2",
    "toAddress": "0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e",
    "tokenName": "USDC",
    "amount": "100.50",
    "status": "Complete"
}
```

### **Test Case 4: Different Token (ETH)**

```json
{
    "transactionId": "0xdemo987654321fedcba",
    "fromAddress": "0xB2904FDB92cEa03FEb4bDD40dCB70dB2DF5682A8",
    "toAddress": "0xD532c5F1BDb0a69823Fb19AE358B3490aEE8849d",
    "tokenName": "ETH",
    "amount": "2.5",
    "status": "Initiated"
}
```

### **Test Case 5: Large Amount (18 Decimal Places)**

```json
{
    "transactionId": "0xdemo555666777888999",
    "fromAddress": "0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e",
    "toAddress": "0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2",
    "tokenName": "USDC",
    "amount": "999999.123456789012345678",
    "status": "Initiated"
}
```

---

## 🔄 **POST /transactions/{id}/status - Update Status Only**

### **Test Case 6: Update to InMemPool**

```json
{
    "status": "InMemPool",
    "source": "monitoring-system",
    "metadata": {
        "blockNumber": "12345",
        "gasUsed": "21000"
    }
}
```

### **Test Case 7: Update to Processing**

```json
{
    "status": "Processing",
    "source": "monitoring-system",
    "metadata": {
        "minerAddress": "0x742d35Cc6634C0532925a3b8D0C0C4C4C4C4C4C4",
        "gasPrice": "20000000000"
    }
}
```

### **Test Case 8: Update to InCompliance**

```json
{
    "status": "InCompliance",
    "source": "monitoring-system",
    "metadata": {
        "complianceCheck": "passed",
        "riskScore": "low"
    }
}
```

### **Test Case 9: Update to Complete**

```json
{
    "status": "Complete",
    "source": "monitoring-system",
    "metadata": {
        "confirmationBlocks": 12,
        "finalGasUsed": "21000"
    }
}
```

### **Test Case 10: Update to Failed**

```json
{
    "status": "Failed",
    "source": "monitoring-system",
    "metadata": {
        "errorCode": "INSUFFICIENT_GAS",
        "errorMessage": "Transaction failed due to insufficient gas"
    }
}
```

---

## 🚫 **Error Test Cases (Validation)**

### **Test Case 11: Missing Required Fields**

```json
{
    "transactionId": "0xdemo123456789abcdef"
}
```

### **Test Case 12: Invalid Ethereum Address**

```json
{
    "transactionId": "0xdemo123456789abcdef",
    "fromAddress": "invalid-address",
    "toAddress": "0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e",
    "tokenName": "USDC",
    "amount": "100.50",
    "status": "Initiated"
}
```

### **Test Case 13: Invalid Amount Format**

```json
{
    "transactionId": "0xdemo123456789abcdef",
    "fromAddress": "0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2",
    "toAddress": "0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e",
    "tokenName": "USDC",
    "amount": "invalid-amount",
    "status": "Initiated"
}
```

### **Test Case 14: Invalid Status**

```json
{
    "transactionId": "0xdemo123456789abcdef",
    "fromAddress": "0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2",
    "toAddress": "0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e",
    "tokenName": "USDC",
    "amount": "100.50",
    "status": "InvalidStatus"
}
```

### **Test Case 15: Too Many Decimal Places**

```json
{
    "transactionId": "0xdemo123456789abcdef",
    "fromAddress": "0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2",
    "toAddress": "0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e",
    "tokenName": "USDC",
    "amount": "100.1234567890123456789",
    "status": "Initiated"
}
```

---

## 🔍 **GET Endpoints - Test Transaction IDs**

### **Existing Mock Data IDs (for testing):**

```
0xc817643232e94aec05b910aaa536dc5718299a089d6ec517a2706715b8f148a8
0x0667ee5e2a87af2a72cffd59693f7f8cccaa7a38c751bc56f0d6b43db7cbda04
0x1a8842aad7099e35fe1aaf2f69b8e6f03dd7b55dfde06cca251e42fb0a7b4789
0x6b47a98e8c0a930596bd4abece164c47f32db28f1b84ea1f169be9d3820e0cba
0xf6b2d6b1f9c72cd1be1b5148f0a759c22e71f30b5f636801fc3b141ed15ac07b
```

### **GET /transactions** (HATEOAS Summary)

Returns transaction summaries with HATEOAS links instead of full status history:

```json
{
    "transactions": [
        {
            "id": "tx-0xc817643232e94aec05b910aaa536dc5718299a089d6ec517a2706715b8f148a8",
            "transactionId": "0xc817643232e94aec05b910aaa536dc5718299a089d6ec517a2706715b8f148a8",
            "fromAddress": "0xEf6aE5F5108d210CB45fc8d50c07689374B3b2b2",
            "toAddress": "0xaB51d4a8DA4d981dfca0Bf64aEE96054B0D7C23e",
            "tokenName": "USDC",
            "amount": "1000.11",
            "currentStatus": "Complete",
            "statusHistoryCount": 5,
            "createdAt": "2025-09-21T10:00:00.000Z",
            "updatedAt": "2025-09-21T10:04:00.000Z",
            "_links": {
                "self": {
                    "href": "http://localhost:3000/transactions/0xc817643232e94aec05b910aaa536dc5718299a089d6ec517a2706715b8f148a8",
                    "method": "GET",
                    "description": "Get detailed information about this transaction"
                },
                "history": {
                    "href": "http://localhost:3000/transactions/0xc817643232e94aec05b910aaa536dc5718299a089d6ec517a2706715b8f148a8/history",
                    "method": "GET",
                    "description": "Get the complete status history for this transaction"
                },
                "update": {
                    "href": "http://localhost:3000/transactions/0xc817643232e94aec05b910aaa536dc5718299a089d6ec517a2706715b8f148a8/status",
                    "method": "POST",
                    "description": "Update the status of this transaction"
                }
            }
        }
    ],
    "total": 5
}
```

### **GET /transactions/{id}**

Use any of the above IDs to test individual transaction retrieval (returns full
details).

### **GET /transactions/{id}/history**

Use any of the above IDs to test status history retrieval (returns full status
history array).

### **GET /transactions/status/{status}**

Test with these status values:

```
Initiated
InMemPool
Processing
InCompliance
Complete
Failed
```

### **GET /transactions/token/{tokenName}**

Test with these token names:

```
USDC
ETH
BTC
```

---
