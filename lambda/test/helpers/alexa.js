import { SKILL_ID } from '../../config.js';

let requestId = 0;

function envelope(request) {
    requestId += 1;
    const application = { applicationId: SKILL_ID };
    const user = { userId: 'amzn1.ask.account.TEST' };
    return {
        version: '1.0',
        session: { new: true, sessionId: `session-${requestId}`, application, attributes: {}, user },
        context: {
            System: {
                application,
                user,
                device: { deviceId: 'test-device', supportedInterfaces: {} },
                apiEndpoint: 'https://api.amazonalexa.com',
            },
        },
        request: {
            requestId: `request-${requestId}`,
            timestamp: new Date().toISOString(),
            locale: 'de-DE',
            ...request,
        },
    };
}

export function launchRequest() {
    return envelope({ type: 'LaunchRequest' });
}

export function intentRequest(name, slots = {}, dialogState = 'COMPLETED') {
    return envelope({
        type: 'IntentRequest',
        dialogState,
        intent: { name, confirmationStatus: 'NONE', slots },
    });
}

export function sessionEndedRequest(reason = 'USER_INITIATED') {
    return envelope({
        type: 'SessionEndedRequest',
        reason,
        ...(reason === 'ERROR' ? { error: { type: 'INVALID_RESPONSE', message: 'test error' } } : {}),
    });
}

export function resolvedSlot(name, spokenValue, matches, status = 'ER_SUCCESS_MATCH') {
    return {
        name,
        value: spokenValue,
        confirmationStatus: 'NONE',
        resolutions: {
            resolutionsPerAuthority: [
                {
                    authority: `amzn1.er-authority.echo-sdk.${SKILL_ID}.${name}`,
                    status: { code: status },
                    values: matches.map((value) => ({ value })),
                },
            ],
        },
    };
}

export function speech(response) {
    return response.response.outputSpeech?.ssml?.replace(/^<speak>|<\/speak>$/g, '');
}
