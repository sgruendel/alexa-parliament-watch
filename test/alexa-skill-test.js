'use strict';

// include the testing framework
const alexaTest = require('alexa-skill-test-framework');
alexaTest.setExtraFeature('questionMarkCheck', false);

// custom slot types
const LIST_OF_PARLIAMENTS = 'LIST_OF_PARLIAMENTS';
const LIST_OF_CANDIDATES = 'LIST_OF_CANDIDATES';

// initialize the testing framework
alexaTest.initialize(
    require('../src/index'),
    'amzn1.ask.skill.f63fec31-1d6c-4c66-87cb-c73d7d44729d',
    'amzn1.ask.account.VOID');
alexaTest.setLocale('de-DE');

describe('Abgeordneten Watch Skill', () => {
    describe('LaunchRequest', () => {
        alexaTest.test([
            {
                request: alexaTest.getLaunchRequest(),
                says: 'Du kannst sagen, „Frag Pegel Online nach dem Wasserstand an einer Messstelle, oder du kannst „Beenden“ sagen. Wie kann ich dir helfen?',
                reprompts: 'Wie kann ich dir helfen?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('HelpIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.HelpIntent'),
                says: 'Du kannst sagen, „Frag Pegel Online nach dem Wasserstand an einer Messstelle, oder du kannst „Beenden“ sagen. Wie kann ich dir helfen?',
                reprompts: 'Wie kann ich dir helfen?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('CancelIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.CancelIntent'),
                says: 'Auf Wiedersehen!',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('StopIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.StopIntent'),
                says: 'Auf Wiedersehen!',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('SessionEndedRequest', () => {
        alexaTest.test([
            {
                request: alexaTest.getSessionEndedRequest(),
                saysNothing: true, repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('CandidateIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('CandidateIntent', { candidate: 'carsten warnke' }),
                    'candidate', LIST_OF_CANDIDATES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke ist Mitglied der Die PARTEI im Bundestag. Er wurde 1977 geboren, besitzt eine Ausbildung als bei der Konkurrenz? Unnötig und ist tätig als Turbopolitiker.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('CandidateIntent', { candidate: 'Merkel' }),
                    [
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'candidate',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('CandidateIntent'), 'candidate', LIST_OF_CANDIDATES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('AnswersIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('AnswersIntent', { candidate: 'carsten warnke' }),
                    'candidate', LIST_OF_CANDIDATES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke hat eine Frage erhalten und keine davon beantwortet.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('AnswersIntent', { candidate: 'Merkel' }),
                    [
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'candidate',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('AnswersIntent'), 'candidate', LIST_OF_CANDIDATES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('VotesIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('VotesIntent', { candidate: 'carsten warnke' }),
                    'candidate', LIST_OF_CANDIDATES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke hat an keiner Abstimmung teilgenommen.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('VotesIntent', { candidate: 'Merkel' }),
                    [
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'candidate',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('VotesIntent'), 'candidate', LIST_OF_CANDIDATES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('CommitteesIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('CommitteesIntent', { candidate: 'carsten warnke' }),
                    'candidate', LIST_OF_CANDIDATES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke ist in keinem Ausschuss vertreten.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('CommitteesIntent', { candidate: 'Merkel' }),
                    [
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'candidate',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('CommitteesIntent'), 'candidate', LIST_OF_CANDIDATES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('SidejobsIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('SidejobsIntent', { candidate: 'carsten warnke' }),
                    'candidate', LIST_OF_CANDIDATES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke geht keiner Nebentätigkeit nach.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('SidejobsIntent', { candidate: 'Merkel' }),
                    [
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'candidate', slotType: LIST_OF_CANDIDATES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'candidate',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('SidejobsIntent'), 'candidate', LIST_OF_CANDIDATES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('ErrorHandler', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest(''),
                says: 'Entschuldigung, das verstehe ich nicht. Bitte wiederholen Sie das?',
                reprompts: 'Entschuldigung, das verstehe ich nicht. Bitte wiederholen Sie das?',
                shouldEndSession: false,
            },
        ]);
    });
});
