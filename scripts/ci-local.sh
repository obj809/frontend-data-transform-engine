#!/bin/bash

echo "Running tests before push..."
echo "=============================="

echo "Running linting..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Push aborted."
    exit 1
fi

echo "Checking formatting..."
npm run format:check
if [ $? -ne 0 ]; then
    echo "❌ Formatting check failed. Push aborted."
    exit 1
fi

echo "Running type checking..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ Type checking failed. Push aborted."
    exit 1
fi

echo "Running unit tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Push aborted."
    exit 1
fi

echo "Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Push aborted."
    exit 1
fi

echo "Running E2E tests..."
npm run test:e2e
if [ $? -ne 0 ]; then
    echo "❌ E2E tests failed. Push aborted."
    exit 1
fi

echo "=============================="
echo "✅ All checks passed. Ready to push!"
