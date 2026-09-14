import { expect } from 'chai';

import { createRequestSignal, REQUEST_BUDGET_MS } from '../../request-budget.js';

describe('request budget', () => {
    it('uses the default budget and reserves Lambda response time', () => {
        const defaultSignal = createRequestSignal();
        const shortSignal = createRequestSignal({ getRemainingTimeInMillis: () => 1000 });
        expect(REQUEST_BUDGET_MS).to.equal(6000);
        expect(defaultSignal).to.be.instanceOf(AbortSignal);
        expect(shortSignal).to.be.instanceOf(AbortSignal);
    });
});
