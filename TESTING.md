# Testing Abgeordneten Watch

Run `mise install` from the repository root to install Node.js 24, matching the Lambda runtime in
`ask-resources.json`. Run the commands below from `lambda/` after `npm ci`.

| Command | Scope | External access |
| --- | --- | --- |
| `npm test` | Unit and local integration tests, with runtime coverage thresholds | None |
| `npm run test:unit` | API adapter, presentation, slot resolution, and request budgets | None |
| `npm run test:integration` | Actual Lambda handler and ASK SDK with Nock fixtures | None |
| `npm run test:contract` | Current legislature and representative v2 entity contracts | Abgeordnetenwatch |
| `npm run lint` | ESLint checks | None |

Offline commands preload `test/env.js`, which sets a dummy skill ID. `test/setup.js` blocks external HTTP access,
cleans up mocks after every test, and reports unconsumed expectations. `npm test` includes unexecuted runtime files
and enforces the coverage thresholds defined in `lambda/package.json`.

GitHub Actions runs lint and the offline suites on Node.js 24. The API contract workflow runs separately each week
or on demand, so an upstream outage does not fail ordinary pull requests.

The Lambda gives all API calls within one Alexa request a shared six-second budget. Before release, regenerate the
interaction model and verify launch, help, stop, ambiguous names, unknown names, and every data intent on a real
voice device or in the Alexa developer console.
