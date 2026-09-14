import { expect } from 'chai';
import nock from 'nock';

import { handler } from '../../index.js';
import { apiResponse, mandate } from '../fixtures.js';
import { intentRequest, launchRequest, resolvedSlot, sessionEndedRequest, speech } from '../helpers/alexa.js';

const ORIGIN = 'https://www.abgeordnetenwatch.de';
const context = { getRemainingTimeInMillis: () => 10_000 };

function mockMandate() {
    return nock(ORIGIN)
        .get('/api/v2/candidacies-mandates/68737')
        .query({ related_data: 'politician' })
        .reply(200, apiResponse(mandate));
}

function deputySlot(id = '68737') {
    return resolvedSlot('deputy', 'Friedrich Merz', [{ id, name: 'Friedrich Merz' }]);
}

describe('Alexa skill', () => {
    it('handles launch, help, fallback, stop, and session end', async () => {
        const launch = await handler(launchRequest(), context);
        expect(speech(launch)).to.include('Mitglied des Bundestags');
        expect(launch.response.reprompt).to.exist;

        const help = await handler(intentRequest('AMAZON.HelpIntent'), context);
        expect(speech(help)).to.include('Über wen möchtest du etwas wissen?');
        const fallback = await handler(intentRequest('AMAZON.FallbackIntent'), context);
        expect(speech(fallback)).to.include('verstehe ich nicht');
        const stop = await handler(intentRequest('AMAZON.StopIntent'), context);
        expect(stop.response.shouldEndSession).to.equal(true);
        const ended = await handler(sessionEndedRequest('ERROR'), context);
        expect(ended.response.shouldEndSession).to.equal(true);
    });

    it('handles missing, unknown, ambiguous, and invalid deputy slots', async () => {
        const delegated = await handler(intentRequest('DeputyIntent', {}, 'STARTED'), context);
        expect(delegated.response.directives[0].type).to.equal('Dialog.Delegate');

        const elicited = await handler(intentRequest('DeputyIntent'), context);
        expect(elicited.response.directives[0]).to.include({ type: 'Dialog.ElicitSlot', slotToElicit: 'deputy' });

        const unknownSlot = resolvedSlot('deputy', 'Niemand', [], 'ER_SUCCESS_NO_MATCH');
        const unknown = await handler(intentRequest('DeputyIntent', { deputy: unknownSlot }), context);
        expect(speech(unknown)).to.equal('Ich kann diese Person leider nicht finden.');

        const ambiguousSlot = resolvedSlot('deputy', 'Müller', [
            { id: '1', name: 'Alexander Müller' },
            { id: '2', name: 'Claudia Müller' },
        ]);
        const ambiguous = await handler(intentRequest('DeputyIntent', { deputy: ambiguousSlot }), context);
        expect(speech(ambiguous)).to.equal('Welche Person, Alexander Müller oder Claudia Müller?');

        const invalid = await handler(intentRequest('DeputyIntent', { deputy: deputySlot('not-an-id') }), context);
        expect(speech(invalid)).to.include('Fehler beim Ermitteln');
    });

    it('renders profile and question intents from an embedded politician', async () => {
        mockMandate();
        const profile = await handler(intentRequest('DeputyIntent', { deputy: deputySlot() }), context);
        expect(speech(profile)).to.include('Mitglied der CDU');
        expect(profile.response.card).to.include({ type: 'Simple', title: 'Friedrich Merz' });

        mockMandate();
        const answers = await handler(intentRequest('AnswersIntent', { deputy: deputySlot() }), context);
        expect(speech(answers)).to.include('438 Fragen');
    });

    it('renders votes, committees, and side jobs from v2 entity lists', async () => {
        mockMandate();
        nock(ORIGIN)
            .get('/api/v2/votes')
            .query({ mandate: 68737, range_end: 1000 })
            .reply(200, apiResponse([{ vote: 'yes' }, { vote: 'no' }]));
        const votes = await handler(intentRequest('VotesIntent', { deputy: deputySlot() }), context);
        expect(speech(votes)).to.include('2 Abstimmungen');

        mockMandate();
        nock(ORIGIN)
            .get('/api/v2/committee-memberships')
            .query({ candidacy_mandate: 68737, range_end: 1000 })
            .reply(200, apiResponse([{ committee: { label: 'Haushaltsausschuss' } }]));
        const committees = await handler(intentRequest('CommitteesIntent', { deputy: deputySlot() }), context);
        expect(speech(committees)).to.include('Haushaltsausschuss');

        mockMandate();
        nock(ORIGIN)
            .get('/api/v2/sidejobs')
            .query({ mandates: 68737, range_end: 1000 })
            .reply(200, apiResponse([{ label: 'Mitglied', income: null }]));
        const sidejobs = await handler(intentRequest('SidejobsIntent', { deputy: deputySlot() }), context);
        expect(speech(sidejobs)).to.include('eine Nebentätigkeit');
    });

    it('returns a bounded error response when the API fails', async () => {
        nock(ORIGIN)
            .get('/api/v2/candidacies-mandates/68737')
            .query(true)
            .reply(503, { error: 'unavailable' });
        const response = await handler(intentRequest('DeputyIntent', { deputy: deputySlot() }), context);
        expect(speech(response)).to.include('Fehler beim Ermitteln');
    });
});
