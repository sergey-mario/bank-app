const axios = require('axios');
const { baseUrl, headers } = require('../utils/constants');

const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: headers,
    responseType: 'arraybuffer'
});

async function sendProtobufRequest(endpoint, messageType, payload) {
    const encodedPayload = messageType.encode(payload).finish();
    try {
        const response = await axiosInstance.post(endpoint, encodedPayload);
        return response.data;
    } catch (error) {
        return error;
    }
}

function decodeProtobufResponse(messageType, response) {
    return messageType.decode(new Uint8Array(response));
}

module.exports = {
    sendProtobufRequest,
    decodeProtobufResponse
};
