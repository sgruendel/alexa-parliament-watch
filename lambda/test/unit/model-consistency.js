import { readFileSync } from 'node:fs';
import { expect } from 'chai';

const model = JSON.parse(
    readFileSync(new URL('../../../skill-package/interactionModels/custom/de-DE.json', import.meta.url), 'utf8'),
);

describe('interaction model', () => {
    it('contains a numeric, unique mandate ID for every current member', () => {
        const type = model.interactionModel.languageModel.types.find((value) => value.name === 'LIST_OF_DEPUTIES');
        expect(type.values.length).to.be.at.least(500);
        expect(new Set(type.values.map((value) => value.id)).size).to.equal(type.values.length);
        for (const value of type.values) {
            expect(value.id).to.match(/^\d+$/);
            expect(value.name.value).to.be.a('string').and.not.be.empty;
        }
    });
});
