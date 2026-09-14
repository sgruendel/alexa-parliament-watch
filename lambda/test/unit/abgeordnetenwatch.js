import { expect } from 'chai';
import nock from 'nock';

import * as api from '../../abgeordnetenwatch.js';
import { apiResponse, mandate } from '../fixtures.js';

const ORIGIN = 'https://www.abgeordnetenwatch.de';

async function expectRejection(promise, ErrorType, message) {
    try {
        await promise;
        throw new Error('Expected promise to reject');
    } catch (error) {
        expect(error).to.be.instanceOf(ErrorType);
        if (message) expect(error.message).to.include(message);
    }
}

describe('Abgeordnetenwatch API v2', () => {
    it('finds the current legislature', () => {
        const periods = [
            { id: 132, type: 'legislature', start_date_period: '2021-10-26', end_date_period: '2025-03-24' },
            { id: 161, type: 'legislature', start_date_period: '2025-03-25', end_date_period: '2029-02-22' },
            { id: 160, type: 'election', start_date_period: '2025-01-29', end_date_period: '2025-02-23' },
        ];
        expect(api.currentLegislature(periods, new Date('2026-09-13T00:00:00Z')).id).to.equal(161);
        expect(() => api.currentLegislature(periods, new Date('2030-01-01T00:00:00Z'))).to.throw(api.ApiError);
    });

    it('loads periods, mandates, one mandate, and related lists', async () => {
        nock(ORIGIN)
            .get('/api/v2/parliament-periods')
            .query({ parliament: 5, range_end: 100 })
            .reply(200, apiResponse([{ id: 161 }]))
            .get('/api/v2/candidacies-mandates')
            .query({ parliament_period: 161, type: 'mandate', range_end: 1000 })
            .reply(200, apiResponse([{ id: 68737 }]))
            .get('/api/v2/candidacies-mandates/68737')
            .query({ related_data: 'politician' })
            .reply(200, apiResponse(mandate))
            .get('/api/v2/votes')
            .query({ mandate: 68737, range_end: 1000 })
            .reply(200, apiResponse([{ vote: 'yes' }]))
            .get('/api/v2/committee-memberships')
            .query({ candidacy_mandate: 68737, range_end: 1000 })
            .reply(200, apiResponse([{ committee: { label: 'Haushaltsausschuss' } }]))
            .get('/api/v2/sidejobs')
            .query({ mandates: 68737, range_end: 1000 })
            .reply(200, apiResponse([{ label: 'Mitglied' }]));

        expect(await api.getParliamentPeriods()).to.deep.equal([{ id: 161 }]);
        expect(await api.getMandates(161)).to.deep.equal([{ id: 68737 }]);
        expect((await api.getMandate('68737')).id).to.equal(68737);
        expect(await api.getVotes(68737)).to.deep.equal([{ vote: 'yes' }]);
        expect(await api.getCommitteeMemberships(68737)).to.have.length(1);
        expect(await api.getSidejobs(68737)).to.have.length(1);
    });

    it('encodes entity IDs and rejects HTTP and API errors', async () => {
        nock(ORIGIN)
            .get('/api/v2/candidacies-mandates/bad%2Fid')
            .query({ related_data: 'politician' })
            .reply(404, apiResponse([]))
            .get('/api/v2/politicians')
            .reply(200, { meta: { status: 'error', status_message: 'bad filter' }, data: [] });

        await expectRejection(api.getMandate('bad/id'), api.HttpError, 'status 404');
        await expectRejection(api.getJson('politicians'), api.ApiError, 'bad filter');
    });

    it('rejects invalid entity shapes', async () => {
        nock(ORIGIN)
            .get('/api/v2/parliament-periods')
            .query(true)
            .reply(200, apiResponse({ id: 161 }))
            .get('/api/v2/candidacies-mandates')
            .query(true)
            .reply(200, apiResponse({ id: 1 }))
            .get('/api/v2/candidacies-mandates/1')
            .query(true)
            .reply(200, apiResponse([]))
            .get('/api/v2/votes')
            .query(true)
            .reply(200, apiResponse({ vote: 'yes' }));
        await expectRejection(api.getParliamentPeriods(), api.ApiError);
        await expectRejection(api.getMandates(161), api.ApiError);
        await expectRejection(api.getMandate(1), api.ApiError);
        await expectRejection(api.getVotes(1), api.ApiError);
    });
});
