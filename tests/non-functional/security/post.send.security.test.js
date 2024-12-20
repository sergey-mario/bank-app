const protobuf = require('protobufjs');
const { sendProtobufRequest, decodeProtobufResponse } = require('../../../api/axios');
const { faker } = require('@faker-js/faker');
const { Endpoints } = require('../../../config/endpoints');

const protoPath = './proto/bank.proto';

let bankPackage;
let CreateUserRequest, CreateUserResponse;
let DepositRequest, DepositResponse;
let WithdrawRequest, WithdrawResponse;
let SendRequest, SendResponse;

beforeAll(async () => {
    const root = await protobuf.load(protoPath);
    bankPackage = root.lookup('bank');

    CreateUserRequest = bankPackage.lookupType('bank.CreateUserRequest');
    CreateUserResponse = bankPackage.lookupType('bank.CreateUserResponse');
    DepositRequest = bankPackage.lookupType('bank.DepositRequest');
    DepositResponse = bankPackage.lookupType('bank.DepositResponse');
    WithdrawRequest = bankPackage.lookupType('bank.WithdrawRequest');
    WithdrawResponse = bankPackage.lookupType('bank.WithdrawResponse');
    SendRequest = bankPackage.lookupType('bank.SendRequest');
    SendResponse = bankPackage.lookupType('bank.SendResponse');
});

describe('POST send security', () => {
    let userIdFrom, userIdTo;
    const intiAmount = faker.number.int({ min: 100, max: 1000 });

    beforeAll(async () => {
        const userFromRes = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ name: faker.person.fullName() }));
        userIdFrom = decodeProtobufResponse(CreateUserResponse, userFromRes).id;
        expect(userIdFrom).toBeDefined();

        const userToRes = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ name: faker.person.fullName() }));
        userIdTo = decodeProtobufResponse(CreateUserResponse, userToRes).id;
        expect(userIdTo).toBeDefined();

        await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest,
            DepositRequest.create({ userId: userIdFrom, amount: intiAmount }));
    });

    afterAll(async () => {
        // clean up users for real application
    });

    it('SQL injection attempt on fromUserId', async () => {
        const payload = SendRequest.create({
            'fromUserId': `${userIdFrom}'; DROP TABLE users;`,
            'toUserId': `${userIdTo}`,
            'amount': faker.number.int({ min: 1, max: 10 }) });
        const sendRes = await sendProtobufRequest(Endpoints.SEND, SendRequest, payload);
        expect(sendRes.status).toEqual(404);
    });

    it('Script injection attempt on toUserId', async () => {
        const payload = SendRequest.create({
            'fromUserId': `${userIdFrom}`,
            'toUserId': '<script>alert(\'XSS\')</script>',
            'amount': faker.number.int({ min: 1, max: 10 }) });
        const sendRes = await sendProtobufRequest(Endpoints.SEND, SendRequest, payload);
        expect(sendRes.status).toEqual(404);
    });
});
