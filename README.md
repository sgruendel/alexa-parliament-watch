# alexa-parliament-watch

[![CI](https://github.com/sgruendel/alexa-parliament-watch/actions/workflows/node.js.yaml/badge.svg?branch=master)](https://github.com/sgruendel/alexa-parliament-watch/actions/workflows/node.js.yaml)
[![Node.js 24](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)](mise.toml)
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)

An Alexa skill for profile data, questions and answers, votes, committee memberships, and side jobs of members of
the current German Bundestag. Data comes from the
[Abgeordnetenwatch API v2](https://www.abgeordnetenwatch.de/api) under CC0 1.0.

## Project layout

- `lambda/` contains the Node.js Lambda application, scripts, and tests.
- `skill-package/` contains the Alexa manifest, interaction model, and assets.
- `ask-resources.json` configures ASK CLI deployment with the Node.js 24 Lambda runtime.

## Configuration

Install Node.js 24 and ASK CLI with `mise install`. With Mise activated in your shell, commands are run from
`lambda/`; otherwise prefix them with `mise exec --`.
Copy `.env.example` to `.env` and set `SKILL_ID` for model deployment. The deployed Lambda function must provide the
same environment variable. Offline tests inject a dummy value.

Regenerate the deputy catalog from the current Bundestag legislature before deploying the interaction model:

```bash
cd lambda
npm ci
npm run create-model
npm run model:deploy
```

Before the first deployment, run `ask configure` to authenticate the ASK CLI `default` profile. Without an activated
Mise shell, use `mise exec -- ask configure` and `mise exec -- npm run model:deploy`.

## Testing

Run commands from `lambda/`:

```bash
npm test                 # offline unit and integration tests with coverage
npm run test:contract    # live Abgeordnetenwatch API v2 checks
npm run lint
```

See [TESTING.md](TESTING.md) for details.
