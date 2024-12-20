# Bank Service API

A banking application service that allows users to perform basic banking operations such as creating a user, checking
balance, adding deposits, sending money, and withdrawing funds.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js:** This project requires Node.js. [Download and install Node.js](https://nodejs.org/).

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Setup and Installation](#setup-and-installation)
4. [Testing](#testing)
    - [Functional Tests](#functional-tests)
    - [Non-Functional Tests](#non-functional-tests)
        - [Security Tests](#security-tests)
        - [Performance Testing with k6](#performance-testing-with-k6)
5. [Linting and Code Formatting](#linting-and-code-formatting)
6. [Example Test Cases](#test-cases)

---

## Features

This service offers the following banking functionalities:

- **User Creation**: Create new bank users.
- **Get Balance**: Retrieve the balance of a user.
- **Add Deposit**: Deposit money into a user's account.
- **Send Money**: Transfer money from one user to another.
- **Withdraw Funds**: Withdraw money from a user's account.

---

## Tech Stack

### Service

- **JavaScript (Node.js)**
- **Express.js**
- **Protocol Buffers (Protobuf)**

### Testing tools

- **Jest**
- **Axios**
- **k6** (for performance testing)

### Development Tools

- **ESLint**: For maintaining code quality.
- **Prettier**: For code formatting.
- **Husky**: For Git hooks to ensure code standards.

---

## Setup and Installation

1. **Clone the repository:**
```bash
git clone https://github.com/sergey-mario/bank-app.git
cd https://github.com/sergey-mario/bank-app.git
```

2. **Install dependencies:**
```bash
npm install
 ```

3. **Run service:**
```bash
  npm start
  ```

4. **Run tests:**
```bash
  npm test
  ```

## Testing

## Functional Tests

Functional tests verify that the service works as expected for various use cases.

See all functional test cases in the [Test cases](#Test-cases) section.

## Non-Functional Tests

Non-functional tests include performance tests using k6 and security tests.

### Performance Testing with k6

#### Prerequisites

Install k6 by following the instructions [here](https://grafana.com/docs/k6/latest/set-up/install-k6/).

#### Running Tests

Run a specific performance test file:

```bash
k6 run tests/performance/${file-name}.js
```

Run all performance tests using the script:

```bash
npm run test:performance
```
### Security Tests

Security tests include checks for common vulnerabilities like SQL injection and Script injection.

Security tests are executed as part of the functional tests.

#### OWASP Dependency Check

To ensure the project dependencies are secure and free from known vulnerabilities, run the OWASP Dependency Check:
    
```bash
npm run owasp
```

## Linting and Code Formatting

This project uses ESLint and Prettier to maintain code quality and formatting standards.

To run linting and formatting checks, use:

```bash
npm run lint
```

## Test cases

### API Test Cases for `create_user` Endpoint

#### Endpoint POST `/user`

```
message CreateUserRequest {
  string name = 1;
}

message CreateUserResponse {
  string id = 1;
  string message = 2;
}
```

#### Functional test cases

| **ID**    | **Description**                             | **Input Payload**                | **Expected Response**                                              | **Status Code**             |
|-----------|---------------------------------------------|----------------------------------|--------------------------------------------------------------------|-----------------------------|
| **TC-1**  | Create a user with a valid name             | `{ "name": "Hello World" }`      | `{ "id": "<valid-uuid>", "message": "User created successfully" }` | `201 Created`               |
| **TC-2**  | Create a user with the minimum name length  | `{ "name": "A" }`                | `{ "id": "<valid-uuid>", "message": "User created successfully" }` | `201 Created`               |
| **TC-3**  | Create a user with the maximum name length  | `{ "name": "<256 characters>" }` | `{ "id": "<valid-uuid>", "message": "User created successfully" }` | `201 Created`               |
| **TC-4**  | Missing `name` field                        | `{ }`                            | `{ "message": "Name field is required" }`                          | `400 Bad Request`           |
| **TC-5**  | `name` field is `null`                      | `{ "name": null }`               | `{ "message": "Name cannot be null" }`                             | `400 Bad Request`           |
| **TC-6**  | `name` is an empty string                   | `{ "name": "" }`                 | `{ "message": "Name cannot be empty" }`                            | `400 Bad Request`           |
| **TC-7**  | `name` is too long (exceeds 256 characters) | `{ "name": "<257 characters>" }` | `{ "message": "Name exceeds maximum length of 256 characters" }`   | `400 Bad Request`           |
| **TC-8**  | `name` contains special characters          | `{ "name": "Hello@World!" }`     | `{ "message": "Name contains invalid characters" }`                | `400 Bad Request`           |
| **TC-9**  | `name` is an integer instead of string      | `{ "name": 12345 }`              | `{ "message": "Name must be a string" }`                           | `400 Bad Request`           |
| **TC-10** | Create a user with a duplicate name         | `{ "name": "Hello World" }`      | `{ "message": "User with this name already exists" }`              | `400 Bad Request`           |
| **TC-11** | Server error during user creation           | `{ "name": "Hello World" }`      | `{ "message": "Internal Server Error" }`                           | `500 Internal Server Error` |
| **TC-12** | Service unavailable                         | `{ "name": "Hello World" }`      | `{ "message": "Service Unavailable" }`                             | `503 Service Unavailable`   |

#### Non-functional test cases

#### Security test cases

| **ID**    | **Description**                             | **Input Payload**                             | **Expected Response**            | **Status Code**   |
|-----------|---------------------------------------------|-----------------------------------------------|----------------------------------|-------------------|
| **TC-13** | Create a user with SQL injection attempt    | `{ "name": "Robert'); DROP TABLE users;" }`   | `{ "message": "Invalid input" }` | `400 Bad Request` |
| **TC-14** | Create a user with script injection attempt | `{ "name": "<script>alert('XSS')</script>" }` | `{ "message": "Invalid input" }` | `400 Bad Request` |

#### Performance test cases

| **ID**    | **Description**                                                  | **Input Payload**           | **Expected Response**                                       | **Status Code**                          |
|-----------|------------------------------------------------------------------|-----------------------------|-------------------------------------------------------------|------------------------------------------|
| **TC-15** | Create a user with high request load (1000+ concurrent requests) | `{ "name": "Hello World" }` | Responses should be processed correctly without degradation | `201 Created` or appropriate error codes |

### API Test Cases for `deposit` Endpoint

#### Endpoint POST `/deposit`

```
message DepositRequest {
  string userId = 1;
  float amount = 2;
}

message DepositResponse {
  float newBalance = 1;
  string message = 2;
}
```

#### Functional test cases

| **ID**    | **Description**                                   | **Input Payload**                              | **Expected Response**                                           | **Status Code**             |
|-----------|---------------------------------------------------|------------------------------------------------|-----------------------------------------------------------------|-----------------------------|
| **TC-1**  | Deposit a valid amount for a valid user           | `{ "userId": "123", "amount": 100.50 }`        | `{ "newBalance": 150.50, "message": "Deposit successful" }`     | `200 OK`                    |
| **TC-2**  | Deposit the minimum valid amount for a valid user | `{ "userId": "456", "amount": 0.01 }`          | `{ "newBalance": 100.01, "message": "Deposit successful" }`     | `200 OK`                    |
| **TC-3**  | Deposit the maximum valid amount for a valid user | `{ "userId": "789", "amount": 1000000.00 }`    | `{ "newBalance": 1001000.00, "message": "Deposit successful" }` | `200 OK`                    |
| **TC-4**  | Missing `userId` field                            | `{ "amount": 100.00 }`                         | `{ "message": "UserId is required" }`                           | `400 Bad Request`           |
| **TC-5**  | Missing `amount` field                            | `{ "userId": "123" }`                          | `{ "message": "Amount is required" }`                           | `400 Bad Request`           |
| **TC-6**  | `amount` is negative                              | `{ "userId": "123", "amount": -50.00 }`        | `{ "message": "Amount cannot be negative" }`                    | `400 Bad Request`           |
| **TC-7**  | `amount` is zero                                  | `{ "userId": "123", "amount": 0.00 }`          | `{ "message": "Amount must be greater than zero" }`             | `400 Bad Request`           |
| **TC-8**  | `userId` is an invalid type (not a string)        | `{ "userId": 12345, "amount": 100.00 }`        | `{ "message": "UserId must be a string" }`                      | `400 Bad Request`           |
| **TC-9**  | `amount` is not a number                          | `{ "userId": "123", "amount": "abc" }`         | `{ "message": "Amount must be a number" }`                      | `400 Bad Request`           |
| **TC-10** | Deposit to a non-existent user                    | `{ "userId": "nonexistent", "amount": 50.00 }` | `{ "message": "User not found" }`                               | `404 Not Found`             |
| **TC-11** | Server error during deposit processing            | `{ "userId": "123", "amount": 100.00 }`        | `{ "message": "Internal Server Error" }`                        | `500 Internal Server Error` |
| **TC-12** | Service unavailable                               | `{ "userId": "123", "amount": 100.00 }`        | `{ "message": "Service Unavailable" }`                          | `503 Service Unavailable`   |

#### Non-functional test cases

#### Security test cases

| **ID**    | **Description**                                  | **Input Payload**                                                 | **Expected Response**            | **Status Code**   |
|-----------|--------------------------------------------------|-------------------------------------------------------------------|----------------------------------|-------------------|
| **TC-13** | SQL injection attempt on `userId` or `amount`    | `{ "userId": "123'; DROP TABLE users;", "amount": 100.00 }`       | `{ "message": "Invalid input" }` | `404 Bad Request` |
| **TC-14** | Script injection attempt on `userId` or `amount` | `{ "userId": "<script>alert('XSS')</script>", "amount": 100.00 }` | `{ "message": "Invalid input" }` | `404 Bad Request` |

#### Performance test cases

| **ID**    | **Description**                                                                | **Input Payload**                                                                 | **Expected Response**                                       | **Status Code**                     |
|-----------|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-------------------------------------------------------------|-------------------------------------|
| **TC-15** | Deposit with high request load (1000+ concurrent requests) for different users | `{ "userId": "0001", "amount": 100.00 }...{ "userId": "1000", "amount": 100.00 }` | Responses should be processed correctly without degradation | `200 OK` or appropriate error codes |

### API Test Cases for `withdraw` Endpoint

#### Endpoint POST `/withdraw`

```
message WithdrawRequest {
  string userId = 1;
  float amount = 2;
}

message WithdrawResponse {
  float newBalance = 1;
  string message = 2;
}
```

#### Functional test cases

| **ID**    | **Description**                                    | **Input Payload**                              | **Expected Response**                                             | **Status Code**             |
|-----------|----------------------------------------------------|------------------------------------------------|-------------------------------------------------------------------|-----------------------------|
| **TC-1**  | Withdraw a valid amount for a valid user           | `{ "userId": "123", "amount": 50.00 }`         | `{ "newBalance": 50.00, "message": "Withdrawal successful" }`     | `200 OK`                    |
| **TC-2**  | Withdraw the minimum valid amount for a valid user | `{ "userId": "456", "amount": 0.01 }`          | `{ "newBalance": 99.99, "message": "Withdrawal successful" }`     | `200 OK`                    |
| **TC-3**  | Withdraw a large valid amount for a valid user     | `{ "userId": "789", "amount": 500000.00 }`     | `{ "newBalance": 499500.00, "message": "Withdrawal successful" }` | `200 OK`                    |
| **TC-4**  | Missing `userId` field                             | `{ "amount": 100.00 }`                         | `{ "message": "UserId is required" }`                             | `400 Bad Request`           |
| **TC-5**  | Missing `amount` field                             | `{ "userId": "123" }`                          | `{ "message": "Amount is required" }`                             | `400 Bad Request`           |
| **TC-6**  | `amount` is negative                               | `{ "userId": "123", "amount": -50.00 }`        | `{ "message": "Amount cannot be negative" }`                      | `400 Bad Request`           |
| **TC-7**  | `amount` is zero                                   | `{ "userId": "123", "amount": 0.00 }`          | `{ "message": "Amount must be greater than zero" }`               | `400 Bad Request`           |
| **TC-8**  | `userId` is an invalid type (not a string)         | `{ "userId": 12345, "amount": 100.00 }`        | `{ "message": "UserId must be a string" }`                        | `400 Bad Request`           |
| **TC-9**  | `amount` is not a number                           | `{ "userId": "123", "amount": "abc" }`         | `{ "message": "Amount must be a number" }`                        | `400 Bad Request`           |
| **TC-10** | Withdraw more than the available balance           | `{ "userId": "123", "amount": 1000.00 }`       | `{ "message": "Insufficient funds" }`                             | `400 Bad Request`           |
| **TC-11** | Withdraw from a non-existent user                  | `{ "userId": "nonexistent", "amount": 50.00 }` | `{ "message": "User not found" }`                                 | `404 Not Found`             |
| **TC-12** | Server error during withdrawal processing          | `{ "userId": "123", "amount": 50.00 }`         | `{ "message": "Internal Server Error" }`                          | `500 Internal Server Error` |
| **TC-13** | Service unavailable                                | `{ "userId": "123", "amount": 50.00 }`         | `{ "message": "Service Unavailable" }`                            | `503 Service Unavailable`   |

#### Non-functional test cases

#### Security test cases

| **ID**    | **Description**                                  | **Input Payload**                                                 | **Expected Response**            | **Status Code**   |
|-----------|--------------------------------------------------|-------------------------------------------------------------------|----------------------------------|-------------------|
| **TC-14** | SQL injection attempt on `userId` or `amount`    | `{ "userId": "123'; DROP TABLE users;", "amount": 100.00 }`       | `{ "message": "Invalid input" }` | `404 Bad Request` |
| **TC-15** | Script injection attempt on `userId` or `amount` | `{ "userId": "<script>alert('XSS')</script>", "amount": 100.00 }` | `{ "message": "Invalid input" }` | `404 Bad Request` |

#### Performance test cases

| **ID**    | **Description**                                             | **Input Payload**                                                                 | **Expected Response**                                       | **Status Code**                     |
|-----------|-------------------------------------------------------------|-----------------------------------------------------------------------------------|-------------------------------------------------------------|-------------------------------------|
| **TC-16** | Withdraw with high request load (1000+ concurrent requests) | `{ "userId": "0001", "amount": 100.00 }...{ "userId": "1000", "amount": 100.00 }` | Responses should be processed correctly without degradation | `200 OK` or appropriate error codes |

### API Test Cases for `get_balance` Endpoint

#### Endpoint POST `/balance`

```
message GetBalanceRequest {
  string userId = 1;
}

message GetBalanceResponse {
  float balance = 1;
}
```

#### Functional test cases

| **ID**   | **Description**                            | **Input Payload**             | **Expected Response**                      | **Status Code**             |
|----------|--------------------------------------------|-------------------------------|--------------------------------------------|-----------------------------|
| **TC-1** | Get balance for a valid user               | `{ "userId": "123" }`         | `{ "balance": 100.50 }`                    | `200 OK`                    |
| **TC-2** | Get balance for a user with zero balance   | `{ "userId": "789" }`         | `{ "balance": 0.00 }`                      | `200 OK`                    |
| **TC-3** | Missing `userId` field                     | `{ }`                         | `{ "message": "UserId is required" }`      | `400 Bad Request`           |
| **TC-4** | `userId` is an invalid type (not a string) | `{ "userId": 12345 }`         | `{ "message": "UserId must be a string" }` | `400 Bad Request`           |
| **TC-5** | `userId` is empty                          | `{ "userId": "" }`            | `{ "message": "UserId cannot be empty" }`  | `400 Bad Request`           |
| **TC-6** | Get balance for a non-existent user        | `{ "userId": "nonexistent" }` | `{ "message": "User not found" }`          | `404 Not Found`             |
| **TC-7** | Server error during balance retrieval      | `{ "userId": "123" }`         | `{ "message": "Internal Server Error" }`   | `500 Internal Server Error` |
| **TC-8** | Service unavailable                        | `{ "userId": "123" }`         | `{ "message": "Service Unavailable" }`     | `503 Service Unavailable`   |

#### Non-functional test cases

#### Security test cases

| **ID**    | **Description**                      | **Input Payload**                                 | **Expected Response**            | **Status Code**   |
|-----------|--------------------------------------|---------------------------------------------------|----------------------------------|-------------------|
| **TC-9**  | SQL injection attempt on `userId`    | `{ 'DROP TABLE users;': name }`                   | `{ "message": "Invalid input" }` | `400 Bad Request` |
| **TC-10** | Script injection attempt on `userId` | `{ '\'<script>alert(\'XSS\')</script>\'': name }` | `{ "message": "Invalid input" }` | `400 Bad Request` |

#### Performance test cases

| **ID**    | **Description**                                                | **Input Payload**     | **Expected Response**                                       | **Status Code**                     |
|-----------|----------------------------------------------------------------|-----------------------|-------------------------------------------------------------|-------------------------------------|
| **TC-11** | Get balance with high request load (1000+ concurrent requests) | `{ "userId": "123" }` | Responses should be processed correctly without degradation | `200 OK` or appropriate error codes |

### API Test Cases for `send` Endpoint

#### Endpoint POST `/send`

```
message SendRequest {
  string fromUserId = 1;
  string toUserId = 2;
  float amount = 3;
}

message SendResponse {
  string message = 1;
  float fromUserNewBalance = 2;
}
```

#### Functional test cases

| **ID**    | **Description**                                            | **Input Payload**                                                     | **Expected Response**                                                 | **Status Code**             |
|-----------|------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------|
| **TC-1**  | Send a valid amount between two valid users                | `{ "fromUserId": "123", "toUserId": "456", "amount": 50.00 }`         | `{ "message": "Transfer successful", "fromUserNewBalance": 50.00 }`   | `200 OK`                    |
| **TC-2**  | Send the minimum valid amount between users                | `{ "fromUserId": "123", "toUserId": "456", "amount": 0.01 }`          | `{ "message": "Transfer successful", "fromUserNewBalance": 99.99 }`   | `200 OK`                    |
| **TC-3**  | Send a large valid amount between users                    | `{ "fromUserId": "789", "toUserId": "456", "amount": 1000.00 }`       | `{ "message": "Transfer successful", "fromUserNewBalance": 4000.00 }` | `200 OK`                    |
| **TC-4**  | Missing `fromUserId` field                                 | `{ "toUserId": "456", "amount": 50.00 }`                              | `{ "message": "fromUserId is required" }`                             | `400 Bad Request`           |
| **TC-5**  | Missing `toUserId` field                                   | `{ "fromUserId": "123", "amount": 50.00 }`                            | `{ "message": "toUserId is required" }`                               | `400 Bad Request`           |
| **TC-6**  | Missing `amount` field                                     | `{ "fromUserId": "123", "toUserId": "456" }`                          | `{ "message": "Amount is required" }`                                 | `400 Bad Request`           |
| **TC-7**  | `amount` is negative                                       | `{ "fromUserId": "123", "toUserId": "456", "amount": -50.00 }`        | `{ "message": "Amount cannot be negative" }`                          | `400 Bad Request`           |
| **TC-8**  | `amount` is zero                                           | `{ "fromUserId": "123", "toUserId": "456", "amount": 0.00 }`          | `{ "message": "Amount must be greater than zero" }`                   | `400 Bad Request`           |
| **TC-9**  | `fromUserId` is an invalid type (not a string)             | `{ "fromUserId": 12345, "toUserId": "456", "amount": 50.00 }`         | `{ "message": "fromUserId must be a string" }`                        | `400 Bad Request`           |
| **TC-10** | `toUserId` is an invalid type (not a string)               | `{ "fromUserId": "123", "toUserId": 45678, "amount": 50.00 }`         | `{ "message": "toUserId must be a string" }`                          | `400 Bad Request`           |
| **TC-11** | `amount` is not a number                                   | `{ "fromUserId": "123", "toUserId": "456", "amount": "abc" }`         | `{ "message": "Amount must be a number" }`                            | `400 Bad Request`           |
| **TC-12** | Transfer to the same user (`fromUserId` equals `toUserId`) | `{ "fromUserId": "123", "toUserId": "123", "amount": 50.00 }`         | `{ "message": "Cannot transfer to the same user" }`                   | `400 Bad Request`           |
| **TC-13** | Insufficient balance for the transfer                      | `{ "fromUserId": "123", "toUserId": "456", "amount": 1000.00 }`       | `{ "message": "Insufficient funds" }`                                 | `400 Bad Request`           |
| **TC-14** | Transfer from a non-existent user                          | `{ "fromUserId": "nonexistent", "toUserId": "456", "amount": 50.00 }` | `{ "message": "Sender not found" }`                                   | `404 Not Found`             |
| **TC-15** | Transfer to a non-existent user                            | `{ "fromUserId": "123", "toUserId": "nonexistent", "amount": 50.00 }` | `{ "message": "Recipient not found" }`                                | `404 Not Found`             |
| **TC-16** | Server error during transfer processing                    | `{ "fromUserId": "123", "toUserId": "456", "amount": 50.00 }`         | `{ "message": "Internal Server Error" }`                              | `500 Internal Server Error` |
| **TC-17** | Service unavailable                                        | `{ "fromUserId": "123", "toUserId": "456", "amount": 50.00 }`         | `{ "message": "Service Unavailable" }`                                | `503 Service Unavailable`   |

#### Non-functional test cases

#### Security test cases

| **ID**    | **Description**                        | **Input Payload**                                                                       | **Expected Response**            | **Status Code**   |
|-----------|----------------------------------------|-----------------------------------------------------------------------------------------|----------------------------------|-------------------|
| **TC-18** | SQL injection attempt on `fromUserId`  | `{ "fromUserId": "123'; DROP TABLE users;", "toUserId": "456", "amount": 50.00 }`       | `{ "message": "Invalid input" }` | `404 Bad Request` |
| **TC-19** | Script injection attempt on `toUserId` | `{ "fromUserId": "123", "toUserId": "<script>alert('XSS')</script>", "amount": 50.00 }` | `{ "message": "Invalid input" }` | `404 Bad Request` |

Performance test cases

| **ID**    | **Description**                                             | **Input Payload**                                                                                                               | **Expected Response**                                       | **Status Code**                     |
|-----------|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|-------------------------------------|
| **TC-20** | Transfer with high request load (1000+ concurrent requests) | `{ "fromUserId": "0001", "toUserId": "0002", "amount": 10.00 }...{ "fromUserId": "1000", "toUserId": "1001", "amount": 10.00 }` | Responses should be processed correctly without degradation | `200 OK` or appropriate error codes |

