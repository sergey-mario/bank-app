const protobuf = require('protobufjs');
const { sendProtobufRequest, decodeProtobufResponse } = require('../../api/axios');
const { faker } = require('@faker-js/faker');
const { Endpoints } = require('../../config/endpoints');

const protoPath = './proto/bank.proto';

let bankPackage;
let CreateUserRequest, CreateUserResponse;

beforeAll(async () => {
    const root = await protobuf.load(protoPath);
    bankPackage = root.lookup('bank');

    CreateUserRequest = bankPackage.lookupType('bank.CreateUserRequest');
    CreateUserResponse = bankPackage.lookupType('bank.CreateUserResponse');
});

describe('POST user', () => {
    let userId;

    afterAll(async () => {
        // clean up users for real application
    });

    it('Create user', async () => {
        const name = faker.person.fullName();
        const response =
            await sendProtobufRequest(Endpoints.USER, CreateUserRequest, CreateUserRequest.create({ name }));
        const decodedResponse = decodeProtobufResponse(CreateUserResponse, response);
        userId = decodedResponse.id;
        expect(userId.length).toBeGreaterThan(0);
        expect(decodedResponse.message).toEqual(`User ${name} created successfully!`);
    });

    it('Error if pass empty name', async () => {
        const response =
            await sendProtobufRequest(Endpoints.USER, CreateUserRequest, CreateUserRequest.create({ name: '' }));
        expect(response.status).toEqual(400);
    });
});
