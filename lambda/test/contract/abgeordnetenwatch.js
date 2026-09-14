import { expect } from 'chai';

import * as api from '../../abgeordnetenwatch.js';

describe('Abgeordnetenwatch API v2 contract', () => {
    it('provides current Bundestag mandates and their related entities', async () => {
        const options = { signal: AbortSignal.timeout(25_000) };
        const period = api.currentLegislature(await api.getParliamentPeriods(api.BUNDESTAG_ID, options));
        expect(period.parliament.id).to.equal(api.BUNDESTAG_ID);
        const mandates = await api.getMandates(period.id, options);
        expect(mandates.length).to.be.at.least(500);
        const current = mandates.find((mandate) => mandate.end_date == null);
        expect(current.politician.id).to.be.a('number');

        const [mandate, votes, committees, sidejobs] = await Promise.all([
            api.getMandate(current.id, options),
            api.getVotes(current.id, options),
            api.getCommitteeMemberships(current.id, options),
            api.getSidejobs(current.id, options),
        ]);
        expect(mandate.related_data.politician.label).to.be.a('string');
        expect(votes).to.be.an('array');
        expect(committees).to.be.an('array');
        expect(sidejobs).to.be.an('array');
    });
});
