'use strict';

// include the testing framework
const alexaTest = require('alexa-skill-test-framework');
alexaTest.setExtraFeature('questionMarkCheck', false);

// custom slot types
const LIST_OF_PARLIAMENTS = 'LIST_OF_PARLIAMENTS';
const LIST_OF_DEPUTIES = 'LIST_OF_DEPUTIES';

// initialize the testing framework
alexaTest.initialize(
    require('../src/index'),
    'amzn1.ask.skill.f63fec31-1d6c-4c66-87cb-c73d7d44729d',
    'amzn1.ask.account.VOID');
alexaTest.setLocale('de-DE');

describe('Abgeordneten Watch Skill', () => {

    describe('ErrorHandler', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest(''),
                says: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
                reprompts: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('HelpIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.HelpIntent'),
                says: 'Ich kann dir mehr zu einem Abgeordneten im Bundestag sagen, oder du fragst mich nach „Nebentätigkeiten von“, „Ausschüsse von“, „Abstimmungen von“ oder „Fragen an“ einen bestimmten Abgeordneten. Über welchen Abgeordneten möchtest du etwas wissen?',
                reprompts: 'Wie lautet der Name des Abgeordneten, über den oder die du etwas wissen möchtest?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('FallbackIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.FallbackIntent'),
                says: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
                reprompts: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('CancelIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.CancelIntent'),
                says: '<say-as interpret-as="interjection">bis dann</say-as>.',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('StopIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.StopIntent'),
                says: '<say-as interpret-as="interjection">bis dann</say-as>.',
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

    describe('LaunchRequest', () => {
        alexaTest.test([
            {
                request: alexaTest.getLaunchRequest(),
                says: 'Über welchen Abgeordneten möchtest du etwas wissen?',
                reprompts: 'Wie lautet der Name des Abgeordneten, über den oder die du etwas wissen möchtest?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('DeputyIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('DeputyIntent', { deputy: 'carsten warnke' }),
                    'deputy', LIST_OF_DEPUTIES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke ist Mitglied der Die PARTEI im Bundestag. Er wurde 1977 geboren, besitzt eine Ausbildung als bei der Konkurrenz? Unnötig und ist tätig als Turbopolitiker.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('DeputyIntent', { deputy: 'Merkel' }),
                    [
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'deputy',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('DeputyIntent'), 'deputy', LIST_OF_DEPUTIES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('AnswersIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('AnswersIntent', { deputy: 'carsten warnke' }),
                    'deputy', LIST_OF_DEPUTIES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke hat eine Frage erhalten und keine davon beantwortet.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('AnswersIntent', { deputy: 'Merkel' }),
                    [
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'deputy',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('AnswersIntent'), 'deputy', LIST_OF_DEPUTIES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('VotesIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('VotesIntent', { deputy: 'carsten warnke' }),
                    'deputy', LIST_OF_DEPUTIES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke hat an keiner Abstimmung teilgenommen.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('VotesIntent', { deputy: 'Merkel' }),
                    [
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'deputy',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('VotesIntent'), 'deputy', LIST_OF_DEPUTIES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('CommitteesIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('CommitteesIntent', { deputy: 'carsten warnke' }),
                    'deputy', LIST_OF_DEPUTIES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke ist in keinem Ausschuss vertreten.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('CommitteesIntent', { deputy: 'Merkel' }),
                    [
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'deputy',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('CommitteesIntent'), 'deputy', LIST_OF_DEPUTIES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });

    describe('SidejobsIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.addEntityResolutionToRequest(
                    alexaTest.getIntentRequest('SidejobsIntent', { deputy: 'carsten warnke' }),
                    'deputy', LIST_OF_DEPUTIES, 'Carsten Warnke', 'carsten-warnke'),
                says: 'Carsten Warnke geht keiner Nebentätigkeit nach.',
                shouldEndSession: true,
            },
            {
                request: alexaTest.addEntityResolutionsToRequest(
                    alexaTest.getIntentRequest('SidejobsIntent', { deputy: 'Merkel' }),
                    [
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Angela Merkel', id: 'angela-merkel' },
                        { slotName: 'deputy', slotType: LIST_OF_DEPUTIES, value: 'Christoph Merkel', id: 'christoph-merkel' },
                    ]),
                elicitsSlot: 'deputy',
                says: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                reprompts: 'Welcher Abgeordnete, Angela Merkel oder Christoph Merkel?',
                shouldEndSession: false,
            },
            {
                request: alexaTest.addEntityResolutionNoMatchToRequest(
                    alexaTest.getIntentRequest('SidejobsIntent'), 'deputy', LIST_OF_DEPUTIES, 'Otto Waalkes'),
                says: 'Ich kann diesen Abgeordneten leider nicht finden.',
                shouldEndSession: true,
            },
        ]);
    });
});
