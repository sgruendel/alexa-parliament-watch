'use strict';

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

const ER_SUCCESS_MATCH = 'ER_SUCCESS_MATCH';
const ER_SUCCESS_NO_MATCH = 'ER_SUCCESS_NO_MATCH';
const A_HREF_RE = new RegExp('<a[^>]*>([^<]*)</a>');

var exports = module.exports = {};

exports.parseParliamentUsername = function(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    logger.debug('request', request);

    // delegate to Alexa to collect all the required slots
    if (request.dialogState && request.dialogState !== 'COMPLETED') {
        logger.debug('dialog state is ' + request.dialogState + ' => adding delegate directive');
        return {
            response:
                handlerInput.responseBuilder
                    .addDelegateDirective()
                    .getResponse(),
        };
    }

    // const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const { slots } = request.intent;

    logger.debug('candidate slot', slots.candidate);
    // logger.debug('parliament slot', slots.parliament);

    var rpa = slots.candidate
        && slots.candidate.resolutions
        && slots.candidate.resolutions.resolutionsPerAuthority[0];
    switch (rpa.status.code) {
    case ER_SUCCESS_NO_MATCH:
        logger.error('no match for candidate ' + slots.candidate.value);
        const speechOutput = 'Ich kann diesen Abgeordneten leider nicht finden.';
        return {
            response:
                handlerInput.responseBuilder
                    .speak(speechOutput)
                    .getResponse(),
        };

    case ER_SUCCESS_MATCH:
        if (rpa.values.length > 1) {
            logger.info('multiple matches for ' + slots.candidate.value);
            var prompt = 'Welcher Abgeordnete';
            const size = rpa.values.length;

            rpa.values.forEach((element, index) => {
                prompt += ((index === size - 1) ? ' oder ' : ', ') + element.value.name;
            });

            prompt += '?';
            logger.info('eliciting candidate slot: ' + prompt);
            return {
                response:
                    handlerInput.responseBuilder
                        .speak(prompt)
                        .reprompt(prompt)
                        .addElicitSlotDirective(slots.candidate.name)
                        .getResponse(),
            };
        }
        break;

    default:
        logger.error('unexpected status code ' + rpa.status.code);
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

    return { parliament: '60d0787f-e311-4283-a7fd-85b9f62a9b33', username: rpa.values[0].value.id };
};

function getName(profile) {
    return (profile.personal.degree ? profile.personal.degree + ' ' : '') + profile.personal.first_name + ' ' + profile.personal.last_name;
}

exports.getCandidateResponseData = function(profile) {
    const name = getName(profile);
    var speechOutput = name;
    var commas = [];
    var cardContent;

    if (profile.party) {
        speechOutput += ' ist Mitglied der ' + profile.party;
        cardContent = 'Im ' + profile.parliament.name + ' für die ' + profile.party;
    } else {
        speechOutput += ' ist parteilos';
        cardContent = 'parteilos im ' + profile.parliament.name;
    }
    speechOutput += ' im ' + profile.parliament.name + '. ' + (profile.personal.gender === 'male' ? 'Er ' : 'Sie ');

    if (profile.personal.birthyear) {
        speechOutput += 'wurde ' + profile.personal.birthyear + ' geboren, ';
        commas.push(speechOutput.length);
        cardContent += '\ngeboren ' + profile.personal.birthyear;
    }

    if (profile.personal.education) {
        speechOutput += 'besitzt eine Ausbildung als ' + profile.personal.education + ', ';
        commas.push(speechOutput.length);
        cardContent += '\nAusbildung: ' + profile.personal.education;
    }

    if (profile.personal.profession) {
        speechOutput += 'ist tätig als ' + profile.personal.profession + ', ';
        commas.push(speechOutput.length);
        cardContent += '\nTätigkeit: ' + profile.personal.profession;
    }

    // replace comma before last subclause with "und"
    if (commas.length > 1) {
        const lastCommaPos = commas[commas.length - 2] - 2;
        speechOutput = speechOutput.slice(0, lastCommaPos) + ' und' + speechOutput.slice(lastCommaPos + 1);
    }

    // replace trailing ", " with "."
    speechOutput = speechOutput.slice(0, speechOutput.length - 2) + '.';

    if (profile.personal.picture.url && profile.personal.picture.copyright) {
        var copyright = profile.personal.picture.copyright;
        if (copyright.startsWith('<p>')) {
            copyright = copyright.slice(3, copyright.length - 4);
        }
        if (copyright.endsWith('</a>')) {
            copyright = copyright.replace(A_HREF_RE, '$1');
        }
        cardContent += '\n\nFoto ' + copyright;
    }

    return { speechOutput: speechOutput, cardTitle: name, cardContent: cardContent };
};

function getCountText(count, count0Text, count1Text) {
    if (!count) {
        return count0Text;
    } else if (count === 1) {
        return count1Text;
    }
    return count.toString();
}

exports.getAnswerResponseData = function(profile) {
    var noOfAnswers = 0;
    profile.questions.forEach(question => {
        noOfAnswers += question.answers.length;
    });

    const name = getName(profile);
    var speechOutput = name + ' hat ' + getCountText(profile.questions.length, 'keine', 'eine') + ' Frage' + (profile.questions.length > 1 ? 'n' : '') + ' erhalten';
    if (profile.questions.length) {
        speechOutput += ' und ' + getCountText(noOfAnswers, 'keine', 'eine') + ' davon beantwortet';
    }
    speechOutput += '.';
    const cardContent = speechOutput;

    return { speechOutput: speechOutput, cardTitle: name + ': Fragen und Antworten', cardContent: cardContent };
};

exports.getVotesResponseData = function(profile) {
    var yesCount = 0;
    var noCount = 0;
    var abstainCount = 0;
    var notParticipatedCount = 0;
    profile.votes.forEach(vote => {
        switch (vote.vote) {
        case 'dafür gestimmt':
            yesCount++;
            break;

        case 'dagegen gestimmt':
            noCount++;
            break;

        case 'enthalten':
            abstainCount++;
            break;

        case 'nicht beteiligt':
            notParticipatedCount++;
            break;

        default:
            logger.error('unknown vote ' + vote.vote);
        }
    });

    const name = getName(profile);
    var speechOutput = name + ' hat an ';
    if (profile.votes.length && ((profile.votes.length - notParticipatedCount) > 0)) {
        const participatedCount = profile.votes.length - notParticipatedCount;
        speechOutput += getCountText(participatedCount, 'keiner', 'einer') + ' Abstimmung' + (participatedCount > 1 ? 'en' : '') + ' teilgenommen, bei '
            + getCountText(yesCount, 'keiner', 'einer') + ' mit Ja gestimmt, bei '
            + getCountText(noCount, 'keiner', 'einer') + ' mit Nein gestimmt und hat sich bei '
            + getCountText(abstainCount, 'keiner', 'einer') + ' enthalten.';
    } else {
        speechOutput += 'keiner Abstimmung teilgenommen.';
    }
    const cardContent = speechOutput;

    return { speechOutput: speechOutput, cardTitle: name + ': Abstimmungsverhalten', cardContent: cardContent };
};

exports.getCommitteesResponseData = function(profile) {
    const name = getName(profile);
    var speechOutput = name + ' ist ';

    if (profile.committees.length) {
        speechOutput += 'in folgenden Ausschüssen vertreten: ';
        profile.committees.forEach((committee, index) => {
            speechOutput += (index > 0 ? ', ' : '') + committee.name;
        });
    } else {
        speechOutput += 'in keinem Ausschuss vertreten.';
    }
    const cardContent = speechOutput;

    return { speechOutput: speechOutput, cardTitle: name + ': Ausschussmitgliedschaften', cardContent: cardContent };
};

exports.getSidejobsResponseData = function(profile) {
    const name = getName(profile);
    var speechOutput = name + ' geht ';
    var cardContent;
    var sidejobs = {};
    var sidejobsWithoutIncome = 0;

    if (profile.sidejobs.length > 0) {
        speechOutput += 'folgenden Nebentätigkeiten nach: ';
        cardContent = speechOutput;
        profile.sidejobs.forEach((sidejob, index) => {
            if (sidejob.income) {
                const incomeRange = sidejob.income.total_min + '-' + sidejob.income.total_max;
                if (!sidejobs[incomeRange]) sidejobs[incomeRange] = {};
                if (!sidejobs[incomeRange][sidejob.income.interval]) sidejobs[incomeRange][sidejob.income.interval] = 0;
                sidejobs[incomeRange][sidejob.income.interval]++;
            } else {
                sidejobsWithoutIncome++;
            }
            // TODO accumulate by year: sidejob.income.date
        });
        var firstSidejob = true;
        for (var incomeRange in sidejobs) {
            for (var interval in sidejobs[incomeRange]) {
                const textToAdd = getCountText(sidejobs[incomeRange][interval], 'keine', 'eine') + ' Aktivität' + (sidejobs[incomeRange][interval] > 1 ? 'en' : '')
                    + ' mit ' + interval + ' ' + incomeRange + ' €';
                speechOutput += (!firstSidejob ? ', ' : '') + textToAdd;
                cardContent += '\n' + textToAdd;
                firstSidejob = false;
            }
        }
        if (sidejobsWithoutIncome > 0) {
            const textToAdd = getCountText(sidejobsWithoutIncome, 'keine', 'eine')
                + ' Aktivität' + (sidejobsWithoutIncome > 1 ? 'en' : '') + ' ohne Einkünfte';
            speechOutput += (!firstSidejob ? ' und ' : '') + textToAdd;
            cardContent += '\n' + textToAdd;
        }
    } else {
        speechOutput += 'keiner Nebentätigkeit nach.';
        cardContent = speechOutput;
    }

    return { speechOutput: speechOutput, cardTitle: name + ': Nebentätigkeiten', cardContent: cardContent };
};
