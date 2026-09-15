import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from 'chai';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDirectory, '../../..');

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(projectRoot, relativePath), 'utf8'));
}

describe('deployment configuration', function () {
    it('targets the existing parliamentWatch Lambda everywhere', function () {
        const askResources = readJson('ask-resources.json');
        const skillManifest = readJson('skill-package/skill.json');
        const packageJson = readJson('lambda/package.json');
        const lambdaArn = askResources.profiles.default.skillInfrastructure.userConfig.sourceLambda.arn;

        expect(lambdaArn).to.equal(
            'arn:aws:lambda:eu-west-1:467353799488:function:parliamentWatch',
        );
        expect(skillManifest.manifest.apis.custom.endpoint.uri).to.equal(lambdaArn);
        expect(packageJson.scripts['lambda:deploy']).to.include('--function-name parliamentWatch');
    });
});
