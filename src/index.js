'use strict';

const Alexa = require('ask-sdk-core');
const i18next = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
    exitOnError: false,
});

const abgeordnetenwatch = require('./abgeordnetenwatch');
const utils = require('./utils');

const SKILL_ID = 'amzn1.ask.skill.f63fec31-1d6c-4c66-87cb-c73d7d44729d';

const languageStrings = {
    de: {
        translation: {
            HELP_MESSAGE: 'Ich kann dir mehr zu einem Abgeordneten im Bundestag sagen, oder du fragst mich nach „Nebentätigkeiten von“, „Ausschüsse von“, „Abstimmungen von“ oder „Fragen an“ einen bestimmten Abgeordneten. Über welchen Abgeordneten möchtest du etwas wissen?',
            HELP_REPROMPT: 'Wie lautet der Name des Abgeordneten, über den oder die du etwas wissen möchtest?',
            STOP_MESSAGE: '<say-as interpret-as="interjection">bis dann</say-as>.',
            UNKNOWN_DEPUTY: 'Ich kann diesen Abgeordneten leider nicht finden.',
            NOT_UNDERSTOOD_MESSAGE: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
        },
    },
};

const DeputyIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'LaunchRequest'
            || (request.type === 'IntentRequest' && request.intent.name === 'DeputyIntent');
    },
    async handle(handlerInput) {
        const data = utils.parseParliamentUsername(handlerInput);
        if (data.response) {
            return data.response;
        }

        try {
            const result = await abgeordnetenwatch.getProfile(data.parliament, data.username);
            const responseData = utils.getDeputyResponseData(result.profile);

            logger.info(responseData.cardContent);
            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            logger.error(err.stack || err.toString());
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

            logger.info(responseData.cardContent);
            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            logger.error(err.stack || err.toString());
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

            logger.info(responseData.cardContent);
            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            logger.error(err.stack || err.toString());
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

            logger.info(responseData.cardContent);
            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            logger.error(err.stack || err.toString());
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

            logger.info(responseData.cardContent);
            return handlerInput.responseBuilder
                .speak(responseData.speechOutput)
                .withStandardCard(responseData.cardTitle, responseData.cardContent, result.profile.personal.picture.url)
                .getResponse();
        } catch (err) {
            logger.error(err.stack || err.toString());
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
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('HELP_MESSAGE'))
            .reprompt(requestAttributes.t('HELP_REPROMPT'))
            .getResponse();
    },
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speechOutput = requestAttributes.t('NOT_UNDERSTOOD_MESSAGE');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
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
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

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
        const { request } = handlerInput.requestEnvelope;
        try {
            if (request.reason === 'ERROR') {
                logger.error(request.error.type + ': ' + request.error.message);
            }
        } catch (err) {
            logger.error(err.stack || err.toString(), request);
        }

        logger.debug('session ended', request);
        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const { request } = handlerInput.requestEnvelope;
        logger.error(error.stack || error.toString(), request);

        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speechOutput = requestAttributes.t('NOT_UNDERSTOOD_MESSAGE');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    },
};

const LocalizationInterceptor = {
    process(handlerInput) {
        i18next.use(sprintf).init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true,
        });

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = (...args) => {
            return i18next.t(...args);
        };
    },
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        DeputyIntentHandler,
        AnswersIntentHandler,
        VotesIntentHandler,
        CommitteesIntentHandler,
        SidejobsIntentHandler,
        HelpIntentHandler,
        FallbackIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withSkillId(SKILL_ID)
    .lambda();
