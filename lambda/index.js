import Alexa from 'ask-sdk-core';
import i18next from 'i18next';
import sprintf from 'i18next-sprintf-postprocessor';
import winston from 'winston';

import { SKILL_ID } from './config.js';
import { handleDeputyIntent } from './handlers.js';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [new winston.transports.Console({ format: winston.format.simple() })],
    exitOnError: false,
});

const languageStrings = {
    de: {
        translation: {
            HELP_MESSAGE:
                'Ich kann dir mehr über ein Mitglied des Bundestags sagen. Du kannst auch nach Fragen, ' +
                'Abstimmungen, Ausschüssen oder Nebentätigkeiten fragen. Über wen möchtest du etwas wissen?',
            HELP_REPROMPT: 'Über welches Mitglied des Bundestags möchtest du etwas wissen?',
            STOP_MESSAGE: '<say-as interpret-as="interjection">bis dann</say-as>.',
            UNKNOWN_DEPUTY: 'Ich kann diese Person leider nicht finden.',
            NO_RESULT_MESSAGE: 'Es ist leider ein Fehler beim Ermitteln der Daten aufgetreten.',
            NOT_UNDERSTOOD_MESSAGE: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das.',
        },
    },
};

i18next.use(sprintf).init({
    overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
    resources: languageStrings,
    returnObjects: true,
});

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const { t } = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder.speak(t('HELP_MESSAGE')).reprompt(t('HELP_REPROMPT')).getResponse();
    },
};

function intentHandler(intentName, type) {
    return {
        canHandle(handlerInput) {
            const request = handlerInput.requestEnvelope.request;
            return request.type === 'IntentRequest' && request.intent.name === intentName;
        },
        handle(handlerInput) {
            return handleDeputyIntent(handlerInput, type);
        },
    };
}

const DeputyIntentHandler = intentHandler('DeputyIntent', 'deputy');
const AnswersIntentHandler = intentHandler('AnswersIntent', 'answers');
const VotesIntentHandler = intentHandler('VotesIntent', 'votes');
const CommitteesIntentHandler = intentHandler('CommitteesIntent', 'committees');
const SidejobsIntentHandler = intentHandler('SidejobsIntent', 'sidejobs');

const HelpIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const { t } = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder.speak(t('HELP_MESSAGE')).reprompt(t('HELP_REPROMPT')).getResponse();
    },
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const { t } = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(t('NOT_UNDERSTOOD_MESSAGE'))
            .reprompt(t('NOT_UNDERSTOOD_MESSAGE'))
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (
            request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent')
        );
    },
    handle(handlerInput) {
        const { t } = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder.speak(t('STOP_MESSAGE')).withShouldEndSession(true).getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        if (request.reason === 'ERROR') logger.error(`${request.error?.type}: ${request.error?.message}`);
        return handlerInput.responseBuilder.withShouldEndSession(true).getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        logger.error(error.stack || error.toString());
        const { t } = handlerInput.attributesManager.getRequestAttributes();
        return handlerInput.responseBuilder
            .speak(t('NOT_UNDERSTOOD_MESSAGE'))
            .reprompt(t('NOT_UNDERSTOOD_MESSAGE'))
            .getResponse();
    },
};

const LocalizationInterceptor = {
    process(handlerInput) {
        i18next.changeLanguage(Alexa.getLocale(handlerInput.requestEnvelope));
        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = (...args) => i18next.t(...args);
    },
};

let skill;

export const handler = async function (event, context) {
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addRequestHandlers(
                LaunchRequestHandler,
                DeputyIntentHandler,
                AnswersIntentHandler,
                VotesIntentHandler,
                CommitteesIntentHandler,
                SidejobsIntentHandler,
                HelpIntentHandler,
                FallbackIntentHandler,
                CancelAndStopIntentHandler,
                SessionEndedRequestHandler,
            )
            .addRequestInterceptors(LocalizationInterceptor)
            .addErrorHandlers(ErrorHandler)
            .withSkillId(SKILL_ID)
            .create();
    }
    return skill.invoke(event, context);
};
