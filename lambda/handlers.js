import winston from 'winston';

import * as api from './abgeordnetenwatch.js';
import { renderResponse } from './presentation.js';
import { createRequestSignal } from './request-budget.js';
import { getElicitSlotPrompt, resolveSlot } from './slot-resolution.js';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [new winston.transports.Console({ format: winston.format.simple() })],
    exitOnError: false,
});

const relatedLoaders = {
    votes: api.getVotes,
    committees: api.getCommitteeMemberships,
    sidejobs: api.getSidejobs,
};

function elicit(handlerInput, prompt) {
    return handlerInput.responseBuilder.speak(prompt).reprompt(prompt).addElicitSlotDirective('deputy').getResponse();
}

export async function handleDeputyIntent(handlerInput, type) {
    const request = handlerInput.requestEnvelope.request;
    const { t } = handlerInput.attributesManager.getRequestAttributes();
    const resolution = resolveSlot(request.intent?.slots?.deputy, { requireId: true });

    if (resolution.status === 'unknown') return handlerInput.responseBuilder.speak(t('UNKNOWN_DEPUTY')).getResponse();
    if (resolution.status === 'ambiguous') {
        return elicit(
            handlerInput,
            getElicitSlotPrompt('Welche Person', resolution.candidates.map((candidate) => candidate.name)),
        );
    }
    if (resolution.status !== 'matched') {
        return request.dialogState && request.dialogState !== 'COMPLETED'
            ? handlerInput.responseBuilder.addDelegateDirective().getResponse()
            : elicit(handlerInput, t('HELP_REPROMPT'));
    }

    const mandateId = resolution.value.id;
    if (!/^\d+$/.test(mandateId)) {
        logger.error(`Invalid mandate ID from slot resolution: ${mandateId}`);
        return handlerInput.responseBuilder.speak(t('NO_RESULT_MESSAGE')).getResponse();
    }

    try {
        const signal = createRequestSignal(handlerInput.context);
        const [mandate, related] = await Promise.all([
            api.getMandate(mandateId, { signal }),
            relatedLoaders[type]?.(mandateId, { signal }) ?? [],
        ]);
        return renderResponse(handlerInput, type, mandate, related);
    } catch (error) {
        logger.error(error.stack || error.toString());
        return handlerInput.responseBuilder.speak(t('NO_RESULT_MESSAGE')).getResponse();
    }
}
