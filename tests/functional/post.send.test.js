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
    GetBalanceRequest = bankPackage.lookupType('bank.GetBalanceRequest');
    GetBalanceResponse = bankPackage.lookupType('bank.GetBalanceResponse');
    SendRequest = bankPackage.lookupType('bank.SendRequest');
    SendResponse = bankPackage.lookupType('bank.SendResponse');
});

describe('POST send', () => {
    let userIdFrom, userIdTo, userIdForNonExisted;
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

        const userForNonExistedRes = await sendProtobufRequest(Endpoints.USER, CreateUserRequest,
            CreateUserRequest.create({ name: faker.person.fullName() }));
        userIdForNonExisted = decodeProtobufResponse(CreateUserResponse, userForNonExistedRes).id;
        expect(userIdForNonExisted).toBeDefined();

        await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest,
            DepositRequest.create({ userId: userIdFrom, amount: intiAmount }));
        await sendProtobufRequest(Endpoints.DEPOSIT, DepositRequest,
            DepositRequest.create({ userId: userIdForNonExisted, amount: intiAmount }));
    });

    afterAll(async () => {
        // clean up users for real application
    });

    it('Send money to existed user', async () => {
        const sendAmount = faker.number.int({ min: 0, max: intiAmount });
        const payload = SendRequest.create({ fromUserId: userIdFrom, toUserId: userIdTo, amount: sendAmount });
        const sendRes = await sendProtobufRequest(Endpoints.SEND, SendRequest, payload);
        const decodedSendRes = decodeProtobufResponse(SendResponse, sendRes);
        expect(decodedSendRes.fromUserNewBalance).toEqual(intiAmount - sendAmount);

        const balanceRes =
            await sendProtobufRequest(Endpoints.BALANCE, GetBalanceRequest, { userId: userIdTo });
        const decodedBalanceRes = decodeProtobufResponse(GetBalanceResponse, balanceRes);
        expect(decodedBalanceRes.balance).toEqual(sendAmount);
    });

    it('Send money to non-existed user', async () => {
        const sendAmount = faker.number.int({ min: 0, max: intiAmount });
        const payload = SendRequest.create({
            fromUserId: userIdForNonExisted,
            toUserId: faker.string.alpha({ length: 5 }),
            amount: sendAmount
        });
        const sendRes = await sendProtobufRequest(Endpoints.SEND, SendRequest, payload);
        expect(sendRes.status).toEqual(404);

        const balanceRes =
            await sendProtobufRequest(Endpoints.BALANCE, GetBalanceRequest, { userId: userIdForNonExisted });
        const decodedBalanceRes = decodeProtobufResponse(GetBalanceResponse, balanceRes);
        expect(decodedBalanceRes.balance).toEqual(intiAmount);
    });
});
