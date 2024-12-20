import { check } from 'k6';
import http from 'k6/http';
import { Endpoints } from '../../../config/endpoints.js';
import { encodeCreateUserRequest } from '../../../proto/messages.js';
import { baseUrl, headers } from '../../../utils/constants.js';
import { generateUniqueName } from '../../../utils/random.js';

export const options = {
    vus: 50,
    duration: '1h'
};

export default function () {
    const res = http.post(
        `${baseUrl}${Endpoints.USER}`,
        encodeCreateUserRequest({ name: generateUniqueName() }),
        { headers }
    );

    check(res, {
        'Response status is 200': (r) => r.status === 200,
        'Response time < 500ms': (r) => r.timings.duration < 500
    });
}
