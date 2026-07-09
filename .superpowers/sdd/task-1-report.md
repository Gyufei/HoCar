# Task 1 Report

## Summary
- Added clipboard constants and payload helpers.
- Added a focused test for the clipboard payload contract.
- Added the `test` script to `package.json`.

## Verification
- `./node_modules/.bin/tsx tests/*.test.ts`
- `./node_modules/.bin/eslint lib/clipboard/constants.ts lib/clipboard/payload.ts tests/clipboard-payload.test.ts`

## Notes
- `pnpm test` attempted a noninteractive modules-directory check in this sandbox and was not usable without risking the symlinked install state, so verification used the direct `tsx` binary instead.
