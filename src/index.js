'use strict';

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const dashbot = process.env.DASHBOT_API_KEY ? require('dashbot')(process.env.DASHBOT_API_KEY).alexa : undefined;

const abgeordnetenwatch = require('./abgeordnetenwatchAPI');
const utils = require('./utils');

const SKILL_ID = 'amzn1.ask.skill.f63fec31-1d6c-4c66-87cb-c73d7d44729d';
const ER_SUCCESS_MATCH = 'ER_SUCCESS_MATCH';
const ER_SUCCESS_NO_MATCH = 'ER_SUCCESS_NO_MATCH';

const languageStrings = {
    de: {
        translation: {
            CURRENT_WATER_LEVEL_MESSAGE: 'Der Wasserstand bei {{slots.station.value}} beträgt {{result.currentMeasurement.value}} {{result.unit}}',
            TREND_RISING: ', die Tendenz ist steigend',
            TREND_FALLING: ', die Tendenz ist fallend',
            TREND_STABLE: ', die Tendenz ist gleichbleibend',
            NO_RESULT_MESSAGE: 'Ich kann diesen Messwert zur Zeit leider nicht bestimmen.',
            UNKNOWN_STATION_MESSAGE: 'Ich kenne diese Messstelle leider nicht.',
            HELP_MESSAGE: 'Du kannst sagen, „Frag Pegel Online nach dem Wasserstand an einer Messstelle, oder du kannst „Beenden“ sagen. Wie kann ich dir helfen?',
            HELP_REPROMPT: 'Wie kann ich dir helfen?',
            STOP_MESSAGE: 'Auf Wiedersehen!',
        },
    },
};

const CandidateIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest' && request.intent.name === 'CandidateIntent';
    },
    async handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        // delegate to Alexa to collect all the required slots
        if (request.dialogState && request.dialogState !== 'COMPLETED') {
            console.log('dialog state is', request.dialogState, '=> adding delegate directive');
            return handlerInput.responseBuilder
                .addDelegateDirective()
                .getResponse();
        }

        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const { slots } = request.intent;

        console.log('candidate', JSON.stringify(slots.candidate));
        // console.log('parliament', JSON.stringify(slots.parliament));

        var rpa = slots.candidate
            && slots.candidate.resolutions
            && slots.candidate.resolutions.resolutionsPerAuthority[0];
        switch (rpa.status.code) {
        case ER_SUCCESS_NO_MATCH:
            console.error('no match for candidate', slots.candidate.value);
            const speechOutput = requestAttributes.t('Ich kann diesen Abgeordneten leider nicht finden.');
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .getResponse();

        case ER_SUCCESS_MATCH:
            if (rpa.values.length > 1) {
                var prompt = 'Welcher Abgeordnete';
                const size = rpa.values.length;

                rpa.values.forEach((element, index) => {
                    prompt += ((index === size - 1) ? ' oder ' : ', ') + element.value.name;
                });

                prompt += '?';
                return handlerInput.responseBuilder
                    .speak(prompt)
                    .reprompt(prompt)
                    .addElicitSlotDirective(slots.candidate.name)
                    .getResponse();
            }
            break;

        default:
            console.error('unexpected status code', rpa.status.code);
        }
        /*
        console.log('parliament/username', rpa.values[0].value.id);
        const parliamentUsername = rpa.values[0].value.id.split('/');
        const parliament = parliamentUsername[0];
        const username = parliamentUsername[1];
        console.log('parliament/username', parliament, username);
        */

        /*
        rpa = slots.parliament
            && slots.parliament.resolutions
            && slots.parliament.resolutions.resolutionsPerAuthority[0];
        switch (rpa.status.code) {
        case ER_SUCCESS_NO_MATCH:
            console.error('no match for parliament', slots.parliament.value);
            const speechOutput = requestAttributes.t('TODO');
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .getResponse();

        case ER_SUCCESS_MATCH:
            if (rpa.values.length > 1) {
                prompt = 'Welches Parlament';
                const size = rpa.values.length;

                rpa.values.forEach((element, index) => {
                    prompt += ((index === size - 1) ? ' oder ' : ', ') + element.value.name;
                });

                prompt += '?';
                return handlerInput.responseBuilder
                    .speak(prompt)
                    .reprompt(prompt)
                    .addElicitSlotDirective(slots.parliament.name)
                    .getResponse();
            }
            break;

        default:
            console.error('unexpected status code', rpa.status.code);
        }
        const parliament = rpa.values[0].value.id;
        console.log('parliament/username', parliamentUsername);
        */

        const parliament = '60d0787f-e311-4283-a7fd-85b9f62a9b33'; // Bundestag
        const username = rpa.values[0].value.id;
        try {
            const result = await abgeordnetenwatch.getProfile(parliament, username);
            const responseData = utils.getResponseData(result.profile);

            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            console.error('Error getting candidate profile', err);
            const speechOutput = requestAttributes.t('TODO');
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .getResponse();
        }
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'LaunchRequest'
            || (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent');
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speechOutput = requestAttributes.t('HELP_MESSAGE');
        const repromptSpeechOutput = requestAttributes.t('HELP_REPROMPT');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(repromptSpeechOutput)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speechOutput = requestAttributes.t('STOP_MESSAGE');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log('Session ended with reason:', handlerInput.requestEnvelope.request.reason);
        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error('Error handled:', error);
        return handlerInput.responseBuilder
            .speak('Entschuldigung, das verstehe ich nicht. Bitte wiederholen Sie das?')
            .reprompt('Entschuldigung, das verstehe ich nicht. Bitte wiederholen Sie das?')
            .getResponse();
    },
};

const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true,
        });

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = (...args) => {
            return localizationClient.t(...args);
        };
    },
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        CandidateIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withSkillId(SKILL_ID)
    .lambda();
if (dashbot) exports.handler = dashbot.handler(exports.handler);
