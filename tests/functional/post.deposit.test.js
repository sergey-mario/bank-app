const protobuf = require('protobufjs');
const { sendProtobufRequest, decodeProtobufResponse } = require('../../api/axios');
const { faker } = require('@faker-js/faker');
const { Endpoints } = require('../../config/endpoints');

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

describe('POST deposit', () => {
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

    it('Increase deposit', async () => {
        const amount = faker.number.int({ min: 100, max: 1000 });
        const payload = DepositRequest.create({ userId: userId, amount });
        const response = await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest, payload);
        const decodedResponse = decodeProtobufResponse(DepositResponse, response);
        expect(decodedResponse.newBalance).toEqual(amount);
        expect(decodedResponse.message).toEqual(`Deposited $${amount} successfully`);
    });

    it('Error if userId missed', async () => {
        const response =
            await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest,
                { amount: faker.number.float({ min: 100, max: 1000 }) });
        expect(response.status).toEqual(404);
    });
});
