const protobuf = require('protobufjs');
const { sendProtobufRequest, decodeProtobufResponse } = require('../../../api/axios');
const { faker } = require('@faker-js/faker');
const { Endpoints } = require('../../../config/endpoints');

const protoPath = './proto/bank.proto';

let bankPackage;
let CreateUserRequest, CreateUserResponse;
let DepositRequest, DepositResponse;

beforeAll(async () => {
    const root = await protobuf.load(protoPath);
    bankPackage = root.lookup('bank');

    CreateUserRequest = bankPackage.lookupType('bank.CreateUserRequest');
    CreateUserResponse = bankPackage.lookupType('bank.CreateUserResponse');
    DepositRequest = bankPackage.lookupType('bank.DepositRequest');
    DepositResponse = bankPackage.lookupType('bank.DepositResponse');
});

describe('POST deposit security', () => {
    let userId;

    beforeAll(async () => {
        const response = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ name: faker.person.fullName() }));

        userId = decodeProtobufResponse(CreateUserResponse, response).id;
        expect(userId).toBeDefined();
    });

    afterAll(async () => {
        // clean up users for real application
    });

    it('SQL injection attempt on userId', async () => {
        const payload = DepositRequest.create({ 'userId': `${userId}'; DROP TABLE users;`,
            'amount': faker.number.int({ min: 1, max: 10 }) }
        );
        const response = await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest, payload);
        expect(response.status).toEqual(404);
    });

    it('Script injection attempt on userId or amount', async () => {
        const payload = DepositRequest.create(
            { 'userId': '<script>alert(\'XSS\')</script>',
                'amount': faker.number.int({ min: 1, max: 10 }) }
        );
        const response = await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest, payload);
        expect(response.status).toEqual(404);
    });
});
