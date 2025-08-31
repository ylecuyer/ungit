#!/bin/sh

export COVERAGE=1

rm -rf coverage

npm run test

mkdir coverage/merged
lcov-result-merger 'coverage/clicktests.*/lcov.info' coverage/merged/clicktests.info
cp coverage/unittests/lcov.info coverage/merged/unittests.info
lcov-result-merger 'coverage/merged/*.info' coverage/merged.info

genhtml coverage/merged.info -o coverage/html
