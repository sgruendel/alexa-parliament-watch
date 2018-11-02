'use strict';

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const dashbot = process.env.DASHBOT_API_KEY ? require('dashbot')(process.env.DASHBOT_API_KEY).alexa : undefined;

const abgeordnetenwatch = require('./abgeordnetenwatchAPI');
const utils = require('./utils');

const SKILL_ID = 'amzn1.ask.skill.f63fec31-1d6c-4c66-87cb-c73d7d44729d';

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
        const data = utils.parseParliamentUsername(handlerInput);
        if (data.response) {
            return data.response;
        }

        try {
            const result = await abgeordnetenwatch.getProfile(data.parliament, data.username);
            const responseData = utils.getCandidateResponseData(result.profile);

            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            console.error('Error getting candidate profile', err);
            const speechOutput = 'Es ist leider ein Fehler aufgetreten beim Ermitteln der Daten.';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .getResponse();
        }
    },
};

const AnswersIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest' && request.intent.name === 'AnswersIntent';
    },
    async handle(handlerInput) {
        const data = utils.parseParliamentUsername(handlerInput);
        if (data.response) {
            return data.response;
        }

        try {
            const result = await abgeordnetenwatch.getProfile(data.parliament, data.username);
            const responseData = utils.getAnswerResponseData(result.profile);

            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            console.error('Error getting candidate profile', err);
            const speechOutput = 'Es ist leider ein Fehler aufgetreten beim Ermitteln der Daten.';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .getResponse();
        }
    },
};

const VotesIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest' && request.intent.name === 'VotesIntent';
    },
    async handle(handlerInput) {
        const data = utils.parseParliamentUsername(handlerInput);
        if (data.response) {
            return data.response;
        }

        try {
            const result = await abgeordnetenwatch.getProfile(data.parliament, data.username);
            const responseData = utils.getVotesResponseData(result.profile);

            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            console.error('Error getting candidate profile', err);
            const speechOutput = 'Es ist leider ein Fehler aufgetreten beim Ermitteln der Daten.';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .getResponse();
        }
    },
};

const CommitteesIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest' && request.intent.name === 'CommitteesIntent';
    },
    async handle(handlerInput) {
        const data = utils.parseParliamentUsername(handlerInput);
        if (data.response) {
            return data.response;
        }

        try {
            const result = await abgeordnetenwatch.getProfile(data.parliament, data.username);
            const responseData = utils.getCommitteesResponseData(result.profile);

            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            console.error('Error getting candidate profile', err);
            const speechOutput = 'Es ist leider ein Fehler aufgetreten beim Ermitteln der Daten.';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .getResponse();
        }
    },
};

const SidejobsIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest' && request.intent.name === 'SidejobsIntent';
    },
    async handle(handlerInput) {
        const data = utils.parseParliamentUsername(handlerInput);
        if (data.response) {
            return data.response;
        }

        try {
            const result = await abgeordnetenwatch.getProfile(data.parliament, data.username);
            const responseData = utils.getSidejobsResponseData(result.profile);

            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            console.error('Error getting candidate profile', err);
            const speechOutput = 'Es ist leider ein Fehler aufgetreten beim Ermitteln der Daten.';
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
        AnswersIntentHandler,
        VotesIntentHandler,
        CommitteesIntentHandler,
        SidejobsIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withSkillId(SKILL_ID)
    .lambda();
if (dashbot) exports.handler = dashbot.handler(exports.handler);
