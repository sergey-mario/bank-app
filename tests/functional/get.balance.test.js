const protobuf = require('protobufjs');
const { sendProtobufRequest, decodeProtobufResponse } = require('../../api/axios');
const { faker } = require('@faker-js/faker');
const { Endpoints } = require('../../config/endpoints');

const protoPath = './proto/bank.proto';

let bankPackage;
let CreateUserRequest, CreateUserResponse;
let DepositRequest, DepositResponse;
let WithdrawRequest, WithdrawResponse;
let GetBalanceRequest, GetBalanceResponse;

beforeAll(async () => {
    const root = await protobuf.load(protoPath);
    bankPackage = root.lookup('bank');

    CreateUserRequest = bankPackage.lookupType('bank.CreateUserRequest');
    CreateUserResponse = bankPackage.lookupType('bank.CreateUserResponse');
    DepositRequest = bankPackage.lookupType('bank.DepositRequest');
    DepositResponse = bankPackage.lookupType('bank.DepositResponse');
    WithdrawRequest = bankPackage.lookupType('bank.WithdrawRequest');
    WithdrawResponse = bankPackage.lookupType('bank.WithdrawResponse');
    GetBalanceRequest = bankPackage.lookupType('bank.GetBalanceRequest');
    GetBalanceResponse = bankPackage.lookupType('bank.GetBalanceResponse');
});

describe('GET balance', () => {
    let userNewId, userBalanceId, userWithdrawId;
    const amount = faker.number.int({ min: 100, max: 1000 });

    beforeAll(async () => {
        const userNewRes = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ name: faker.person.fullName() }));
        userNewId = decodeProtobufResponse(CreateUserResponse, userNewRes).id;
        expect(userNewId).toBeDefined();

        const userBalanceRes = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ name: faker.person.fullName() }));
        userBalanceId = decodeProtobufResponse(CreateUserResponse, userBalanceRes).id;
        expect(userBalanceId).toBeDefined();

        const userWithdrawRes = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ name: faker.person.fullName() }));
        userWithdrawId = decodeProtobufResponse(CreateUserResponse, userWithdrawRes).id;
        expect(userWithdrawId).toBeDefined();
    });

    afterAll(async () => {
        // clean up users for real application
    });

    it('Get balance for new user', async () => {
        const response =
            await sendProtobufRequest(Endpoints.BALANCE, GetBalanceRequest, { userId: userNewId });
        const decodedResponse = decodeProtobufResponse(GetBalanceResponse, response);
        expect(decodedResponse.balance).toEqual(0);
    });

    it('Get balance after increase deposit', async () => {
        await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest,
            DepositRequest.create({ userId: userBalanceId, amount }));
        const response =
            await sendProtobufRequest(Endpoints.BALANCE, GetBalanceRequest, { userId: userBalanceId });
        const decodedResponse = decodeProtobufResponse(GetBalanceResponse, response);
        expect(decodedResponse.balance).toEqual(amount);
    });

    it('Get balance after increase deposit and withdraw', async () => {
        const withdrawAmount = faker.number.int({ min: 0, max: amount });
        await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest,
            DepositRequest.create({ userId: userWithdrawId, amount }));
        await sendProtobufRequest(Endpoints.WITHDRAW, WithdrawRequest,
            WithdrawRequest.create({ userId: userWithdrawId, amount: withdrawAmount }));
        const response =
            await sendProtobufRequest(Endpoints.BALANCE, GetBalanceRequest, { userId: userWithdrawId });
        expect(decodeProtobufResponse(GetBalanceResponse, response).balance).toEqual(amount - withdrawAmount);
    });
});
