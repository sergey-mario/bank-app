const protobuf = require('protobufjs');
const { sendProtobufRequest, decodeProtobufResponse } = require('../../../api/axios');
const { faker } = require('@faker-js/faker');
const { Endpoints } = require('../../../config/endpoints');

const protoPath = './proto/bank.proto';

let bankPackage;
let CreateUserRequest, CreateUserResponse;
let GetBalanceRequest;

beforeAll(async () => {
    const root = await protobuf.load(protoPath);
    bankPackage = root.lookup('bank');

    CreateUserRequest = bankPackage.lookupType('bank.CreateUserRequest');
    CreateUserResponse = bankPackage.lookupType('bank.CreateUserResponse');
    GetBalanceRequest = bankPackage.lookupType('bank.GetBalanceRequest');
});

describe('GET balance security', () => {
    let userNewId;

    beforeAll(async () => {
        const userNewRes = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ name: faker.person.fullName() }));
        userNewId = decodeProtobufResponse(CreateUserResponse, userNewRes).id;
        expect(userNewId).toBeDefined();
    });

    afterAll(async () => {
        // clean up users for real application
    });

    it('SQL injection attempt on userId', async () => {
        const response = await sendProtobufRequest(
            Endpoints.BALANCE, GetBalanceRequest,
            { 'userId': `${userNewId}'; DROP TABLE users;` });
        expect(response.status).toEqual(404);
    });

    it('Script injection attempt on userId', async () => {
        const response = await sendProtobufRequest(
            Endpoints.BALANCE, GetBalanceRequest,
            { 'userId': '<script>alert(\'XSS\')</script>' });
        expect(response.status).toEqual(404);
    });
});
