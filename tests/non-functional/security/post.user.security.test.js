const protobuf = require('protobufjs');
const { sendProtobufRequest, decodeProtobufResponse } = require('../../../api/axios');
const { faker } = require('@faker-js/faker');
const { Endpoints } = require('../../../config/endpoints');

const protoPath = './proto/bank.proto';

let bankPackage;
let CreateUserRequest, CreateUserResponse;

beforeAll(async () => {
    const root = await protobuf.load(protoPath);
    bankPackage = root.lookup('bank');

    CreateUserRequest = bankPackage.lookupType('bank.CreateUserRequest');
    CreateUserResponse = bankPackage.lookupType('bank.CreateUserResponse');
});

describe('POST user security', () => {
    afterAll(async () => {
        // clean up users for real application
    });

    it('Create a user with SQL injection attempt', async () => {
        const name = faker.person.fullName();
        const response = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ 'DROP TABLE users;': name }));
        expect(response.status).toEqual(400);
    });

    it('Create a user with script injection attempt\t', async () => {
        const name = faker.person.fullName();
        const response = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ '\'<script>alert(\'XSS\')</script>\'': name }));
        expect(response.status).toEqual(400);
    });
});
