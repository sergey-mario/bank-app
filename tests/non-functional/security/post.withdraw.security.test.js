const protobuf = require('protobufjs');
const { sendProtobufRequest, decodeProtobufResponse } = require('../../../api/axios');
const { faker } = require('@faker-js/faker');
const { Endpoints } = require('../../../config/endpoints');

const protoPath = './proto/bank.proto';

let bankPackage;
let CreateUserRequest, CreateUserResponse;
let DepositRequest, DepositResponse;
let WithdrawRequest, WithdrawResponse;

beforeAll(async () => {
    const root = await protobuf.load(protoPath);
    bankPackage = root.lookup('bank');

    CreateUserRequest = bankPackage.lookupType('bank.CreateUserRequest');
    CreateUserResponse = bankPackage.lookupType('bank.CreateUserResponse');
    DepositRequest = bankPackage.lookupType('bank.DepositRequest');
    DepositResponse = bankPackage.lookupType('bank.DepositResponse');
    WithdrawRequest = bankPackage.lookupType('bank.WithdrawRequest');
    WithdrawResponse = bankPackage.lookupType('bank.WithdrawResponse');
});

describe('POST withdraw security', () => {
    let userId;
    const amount = faker.number.int({ min: 100, max: 1000 });

    beforeAll(async () => {
        const userRes = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ name: faker.person.fullName() }));
        userId = decodeProtobufResponse(CreateUserResponse, userRes).id;
        expect(userId).toBeDefined();

        const depositRes =
            await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest, DepositRequest.create({ userId, amount }));
        expect(decodeProtobufResponse(DepositResponse, depositRes).newBalance).toBeDefined();
    });

    afterAll(async () => {
        // clean up users for real application
    });

    it('SQL injection attempt on userId or amount', async () => {
        const withdrawAmount = faker.number.int({ min: 0, max: 100 });
        const payload = WithdrawRequest.create({ 'userId': `${userId}'; DROP TABLE users;`, 'amount': withdrawAmount });
        const response = await sendProtobufRequest(Endpoints.WITHDRAW, WithdrawRequest, payload);
        expect(response.status).toEqual(404);
    });

    it('Script injection attempt on userId or amount', async () => {
        const withdrawAmount = faker.number.int({ min: 0, max: 100 });
        const payload = WithdrawRequest.create({
            'userId': '<script>alert(\'XSS\')</script>',
            'amount': withdrawAmount });
        const response = await sendProtobufRequest(Endpoints.WITHDRAW, WithdrawRequest, payload);
        expect(response.status).toEqual(404);
    });
});
