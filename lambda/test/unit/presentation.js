import { expect } from 'chai';

import {
    answersResponse,
    committeesResponse,
    deputyResponse,
    renderResponse,
    sidejobsResponse,
    votesResponse,
} from '../../presentation.js';
import { mandate } from '../fixtures.js';

describe('presentation', () => {
    it('renders a profile and tolerates missing optional details', () => {
        expect(deputyResponse(mandate).speechOutput).to.equal(
            'Friedrich Merz ist Mitglied der CDU im Bundestag. Er wurde 1955 geboren, besitzt eine Ausbildung als ' +
                'Rechtsanwalt und ist tätig als MdB.',
        );
        const sparse = structuredClone(mandate);
        sparse.related_data.politician = {
            label: 'Erika Muster',
            sex: 'f',
            party: null,
            abgeordnetenwatch_url: 'https://example.test',
        };
        sparse.parliament_period = {};
        expect(deputyResponse(sparse).speechOutput).to.equal('Erika Muster ist parteilos im Bundestag.');
    });

    it('renders question statistics including zero and singular', () => {
        expect(answersResponse(mandate).speechOutput).to.equal(
            'Friedrich Merz hat 438 Fragen erhalten und keine davon beantwortet.',
        );
        const one = structuredClone(mandate);
        one.related_data.politician.statistic_questions = 1;
        one.related_data.politician.statistic_questions_answered = 1;
        expect(answersResponse(one).speechOutput).to.equal(
            'Friedrich Merz hat eine Frage erhalten und eine davon beantwortet.',
        );
        one.related_data.politician.statistic_questions = null;
        expect(answersResponse(one).speechOutput).to.equal('Friedrich Merz hat keine Fragen erhalten.');
    });

    it('renders vote statistics and ignores non-participation values', () => {
        const votes = [{ vote: 'yes' }, { vote: 'yes' }, { vote: 'no' }, { vote: 'abstain' }, { vote: 'no_show' }];
        expect(votesResponse(mandate, votes).speechOutput).to.equal(
            'Friedrich Merz hat an 4 Abstimmungen teilgenommen, bei 2 mit Ja gestimmt, bei einer mit Nein gestimmt ' +
                'und sich bei einer enthalten.',
        );
        expect(votesResponse(mandate, [{ vote: 'no_show' }]).speechOutput).to.equal(
            'Friedrich Merz hat an keiner Abstimmung teilgenommen.',
        );
    });

    it('renders sorted, unique committee memberships', () => {
        const memberships = [
            { committee: { label: 'Verkehrsausschuss' } },
            { committee: { label: 'Haushaltsausschuss' } },
            { committee: { label: 'Verkehrsausschuss' } },
            {},
        ];
        expect(committeesResponse(mandate, memberships).speechOutput).to.equal(
            'Friedrich Merz ist in folgenden Ausschüssen vertreten: Haushaltsausschuss und Verkehrsausschuss.',
        );
        expect(committeesResponse(mandate, []).speechOutput).to.equal(
            'Friedrich Merz ist in keinem Ausschuss vertreten.',
        );
    });

    it('renders side-job counts and card details', () => {
        const sidejobs = [
            { label: 'Vorstand', income: 3000, sidejob_organization: { label: 'Stiftung' } },
            { label: 'Mitglied', income: null },
        ];
        const response = sidejobsResponse(mandate, sidejobs);
        expect(response.speechOutput).to.equal(
            'Friedrich Merz hat 2 Nebentätigkeiten. Bei einer sind Einkünfte ausgewiesen.',
        );
        expect(response.cardContent).to.include('• Vorstand – Stiftung\n• Mitglied');
        expect(sidejobsResponse(mandate, []).speechOutput).to.equal(
            'Friedrich Merz geht keiner Nebentätigkeit nach.',
        );
    });

    it('builds a simple Alexa card and rejects invalid input', () => {
        const builder = {
            speak(value) {
                this.speech = value;
                return this;
            },
            withSimpleCard(title, content) {
                this.title = title;
                this.content = content;
                return this;
            },
            withShouldEndSession(value) {
                this.end = value;
                return this;
            },
            getResponse() {
                return this;
            },
        };
        const result = renderResponse({ responseBuilder: builder }, 'deputy', mandate);
        expect(result.content).to.include('Quelle: abgeordnetenwatch.de');
        expect(result.end).to.equal(true);
        expect(() => renderResponse({ responseBuilder: builder }, 'bad', mandate)).to.throw('Unknown response type');
        expect(() => deputyResponse({})).to.throw('Missing politician data');
    });
});
