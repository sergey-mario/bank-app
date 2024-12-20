import { check } from 'k6';
import http from 'k6/http';
import { Endpoints } from '../../../config/endpoints.js';
import { encodeCreateUserRequest } from '../../../proto/messages.js';
import { baseUrl, headers } from '../../../utils/constants.js';
import { generateUniqueName } from '../../../utils/random.js';

export const options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '5s', target: 100 },
        { duration: '10s', target: 0 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01']
    }
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
