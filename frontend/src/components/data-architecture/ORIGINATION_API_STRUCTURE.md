# Temenos Origination API - Current Account Opening Structure

## Endpoint
`POST /v1.0.0/origination/accounts/currentAccounts`

## Swagger Documentation Analysis

### From Swagger (origination-currentAccountOpeningPurpose-service-v1.0.0-swagger.json):

**Required Parameters:**
- `payload` (body parameter) - **REQUIRED: true**

**Payload Schema Structure:**
```json
{
  "header": {
    "type": "object"  // Optional - no required fields specified
  },
  "body": {
    "type": "array",  // Array of formlet objects
    "items": {
      "type": "object",
      "properties": {
        "caOpening": { ... },
        "caOpeningR": { ... }
      }
    }
  }
}
```

### Actual API Requirements (from error messages):

**Required Top-Level Fields:**
1. `purposes` - **REQUIRED** (not in swagger, but API requires it)
   - Array with `purposeId` field
   - Example: `[{ "purposeId": "CURRENT.ACCOUNT.OPENING" }]`

2. `body` - **REQUIRED** (array of formlets)
   - Each item contains `caOpening` and `caOpeningR` objects

3. `header` - Optional (object)

## Body Array Structure

Each item in the `body` array contains:

### 1. `caOpening` Object:
- `aboutYou` (object):
  - `firstName` (string, max 35)
  - `surname` (string, max 35)
  - `dateOfBirth` (date format)
  - `gender` (string, max 6)
  - `language` (string, max 35)
  - `residentialStatus` (string, max 20)
  - `transactionStatus` (string)
  - Other optional fields...

- `homeAddress` (object):
  - `addressLine1` (string, max 35)
  - `townCity` (string, max 35)
  - `country` (string, max 35)
  - `transactionStatus` (string)
  - Other optional fields...

- `employmentDetails` (object):
  - `employmentStatus` (string, max 35)
  - `transactionStatus` (string)
  - Other optional fields...

- `income` (object):
  - `currency` (string, max 10)
  - `annualIncome` (number)
  - `transactionStatus` (string)
  - Other optional fields...

- `action` (string, enum: ["submit"])
- `uniqueIdentifier` (string)

### 2. `caOpeningR` Object:
- `caOpeningR` (nested object):
  - `productSelected` (string, max 35) - e.g., "CURRENT.ACCOUNT"
  - `currency` (string, max 3)
  - `transactionStatus` (string)
  - Reserved fields (reserved2-9)

- `action` (string, enum: ["submit"])
- `uniqueIdentifier` (string)

## Complete Payload Example

```json
{
  "header": {},
  "purposes": [
    {
      "purposeId": "CURRENT.ACCOUNT.OPENING"
    }
  ],
  "body": [
    {
      "caOpening": {
        "aboutYou": {
          "firstName": "John",
          "surname": "Doe",
          "dateOfBirth": "1998-01-15",
          "gender": "MALE",
          "language": "1",
          "residentialStatus": "OWNER",
          "transactionStatus": "LIVE"
        },
        "homeAddress": {
          "addressLine1": "123 Main Street",
          "townCity": "City",
          "country": "US",
          "transactionStatus": "LIVE"
        },
        "employmentDetails": {
          "employmentStatus": "EMPLOYED",
          "transactionStatus": "LIVE"
        },
        "income": {
          "currency": "USD",
          "annualIncome": 50000,
          "transactionStatus": "LIVE"
        },
        "action": "submit",
        "uniqueIdentifier": "ACC_1234567890"
      },
      "caOpeningR": {
        "caOpeningR": {
          "productSelected": "CURRENT.ACCOUNT",
          "currency": "USD",
          "transactionStatus": "LIVE"
        },
        "action": "submit",
        "uniqueIdentifier": "ACC_1234567890"
      }
    }
  ]
}
```

## Notes

- The `purposes` field is **required by the API** but **not documented in the swagger**
- All `transactionStatus` fields should be set to `"LIVE"` for active transactions
- The `action` field must be `"submit"` to actually submit the form
- `uniqueIdentifier` should be unique for each request

