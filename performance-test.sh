#!/bin/sh
k6 run tests/non-functional/performance/post.user.load.js &
k6 run tests/non-functional/performance/post.user.rampup.js &
k6 run tests/non-functional/performance/post.user.stress.js &
k6 run tests/non-functional/performance/post.user.soak.js &
k6 run tests/non-functional/performance/get.user.spike.js
