#!/bin/sh

if [ -n "$COVERAGE" ]; then
    echo "Running tests with coverage..."
    nyc="nyc --clean -r lcov -t coverage/unittests --report-dir coverage/unittests"
else
    echo "Running tests without coverage..."
fi

npx $nyc mocha --config .mochatest.json
