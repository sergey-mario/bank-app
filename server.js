const express = require('express');
const protobuf = require('protobufjs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.raw({ type: 'application/x-protobuf' }));

const users = {};
let idCounter = 1;

let bankPackage;

protobuf.load('./proto/bank.proto').then(root => {
    bankPackage = root.lookup('bank');

    app.post('/user', (req, res) => {
        const CreateUserRequest = bankPackage.lookupType('bank.CreateUserRequest');
        const CreateUserResponse = bankPackage.lookupType('bank.CreateUserResponse');

        try {
            const message = CreateUserRequest.decode(req.body);

            if (!message.name) {
                return res.status(400).send('Name is required');
            }

            const userId = `user-${idCounter++}`;
            users[userId] = { name: message.name, balance: 0 };

            const response = CreateUserResponse.create({
                id: userId,
                message: `User ${message.name} created successfully!`
            });

            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(CreateUserResponse.encode(response).finish());
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(400).send('Invalid request');
        }
    });

    app.post('/deposit', (req, res) => {
        const DepositRequest = bankPackage.lookupType('bank.DepositRequest');
        const DepositResponse = bankPackage.lookupType('bank.DepositResponse');

        try {
            const message = DepositRequest.decode(req.body);

            if (!users[message.userId]) {
                return res.status(404).send('User not found');
            }

            users[message.userId].balance += message.amount;

            const response = DepositResponse.create({
                newBalance: users[message.userId].balance,
                message: `Deposited $${message.amount} successfully`
            });

            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(DepositResponse.encode(response).finish());
        } catch (error) {
            console.error('Error processing deposit:', error);
            res.status(400).send('Invalid request');
        }
    });

    app.post('/withdraw', (req, res) => {
        const WithdrawRequest = bankPackage.lookupType('bank.WithdrawRequest');
        const WithdrawResponse = bankPackage.lookupType('bank.WithdrawResponse');

        try {
            const message = WithdrawRequest.decode(req.body);

            if (!users[message.userId]) {
                return res.status(404).send('User not found');
            }

            if (users[message.userId].balance >= message.amount) {
                users[message.userId].balance -= message.amount;

                const response = WithdrawResponse.create({
                    newBalance: users[message.userId].balance,
                    message: `Withdraw $${message.amount} successfully`
                });

                res.setHeader('Content-Type', 'application/octet-stream');
                res.send(WithdrawResponse.encode(response).finish());
            } else {
                res.status(400).send('Insufficient funds');
            }
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            res.status(400).send('Invalid request');
        }
    });

    app.post('/balance', (req, res) => {
        const GetBalanceRequest = bankPackage.lookupType('bank.GetBalanceRequest');
        const GetBalanceResponse = bankPackage.lookupType('bank.GetBalanceResponse');

        try {
            const message = GetBalanceRequest.decode(req.body);

            if (!users[message.userId]) {
                return res.status(404).send('User not found');
            }

            const response = GetBalanceResponse.create({
                balance: users[message.userId].balance
            });

            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(GetBalanceResponse.encode(response).finish());
        } catch (error) {
            console.error('Error getting balance:', error);
            res.status(400).send('Invalid request');
        }
    });

    app.post('/send', (req, res) => {
        const SendRequest = bankPackage.lookupType('bank.SendRequest');
        const SendResponse = bankPackage.lookupType('bank.SendResponse');

        try {
            const message = SendRequest.decode(req.body);

            if (!users[message.fromUserId] || !users[message.toUserId]) {
                return res.status(404).send('One or both users not found');
            }

            if (users[message.fromUserId].balance >= message.amount) {
                users[message.fromUserId].balance -= message.amount;
                users[message.toUserId].balance += message.amount;

                const response = SendResponse.create({
                    message: `Sent $${message.amount} from ${users[message.fromUserId].name} 
                    to ${users[message.toUserId].name}`,
                    fromUserNewBalance: users[message.fromUserId].balance
                });

                res.setHeader('Content-Type', 'application/octet-stream');
                res.send(SendResponse.encode(response).finish());
            } else {
                res.status(400).send('Insufficient funds');
            }
        } catch (error) {
            console.error('Error processing send transaction:', error);
            res.status(400).send('Invalid request');
        }
    });

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
