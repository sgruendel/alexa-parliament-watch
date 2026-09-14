function politicianFor(mandate) {
    const politician = mandate?.related_data?.politician;
    if (!politician || typeof politician.label !== 'string') throw new Error('Missing politician data');
    return politician;
}

function nameFor(politician) {
    return [politician.field_title, politician.label].filter(Boolean).join(' ');
}

function sourceFor(politician) {
    return `Quelle: abgeordnetenwatch.de\n${politician.abgeordnetenwatch_url}`;
}

function card(handlerInput, title, content, politician) {
    return handlerInput.responseBuilder
        .speak(content.speechOutput)
        .withSimpleCard(title, `${content.cardContent}\n\n${sourceFor(politician)}`)
        .withShouldEndSession(true)
        .getResponse();
}

function countText(count, none, one) {
    if (count === 0) return none;
    if (count === 1) return one;
    return String(count);
}

function joinGerman(values) {
    if (values.length < 2) return values.join('');
    return `${values.slice(0, -1).join(', ')} und ${values.at(-1)}`;
}

export function deputyResponse(mandate) {
    const politician = politicianFor(mandate);
    const name = nameFor(politician);
    const parliament = mandate.parliament_period?.label?.split(/\s+\d{4}/)[0] || 'Bundestag';
    const party = politician.party?.label;
    const pronoun = politician.sex === 'm' ? 'Er' : 'Sie';
    const details = [];
    const cardLines = [party ? `Im ${parliament} für die ${party}` : `parteilos im ${parliament}`];

    if (Number.isInteger(politician.year_of_birth)) {
        details.push(`wurde ${politician.year_of_birth} geboren`);
        cardLines.push(`geboren ${politician.year_of_birth}`);
    }
    if (politician.education) {
        details.push(`besitzt eine Ausbildung als ${politician.education}`);
        cardLines.push(`Ausbildung: ${politician.education}`);
    }
    if (politician.occupation) {
        details.push(`ist tätig als ${politician.occupation}`);
        cardLines.push(`Tätigkeit: ${politician.occupation}`);
    }

    let speechOutput = party ? `${name} ist Mitglied der ${party} im ${parliament}.` : `${name} ist parteilos im ${parliament}.`;
    if (details.length) speechOutput += ` ${pronoun} ${joinGerman(details)}.`;
    return { speechOutput, cardContent: cardLines.join('\n'), politician, title: name };
}

export function answersResponse(mandate) {
    const politician = politicianFor(mandate);
    const name = nameFor(politician);
    const questions = Number.isInteger(politician.statistic_questions) ? politician.statistic_questions : 0;
    const answered = Number.isInteger(politician.statistic_questions_answered)
        ? politician.statistic_questions_answered
        : 0;
    let speechOutput = `${name} hat ${countText(questions, 'keine', 'eine')} Frage${questions === 1 ? '' : 'n'} erhalten`;
    if (questions) speechOutput += ` und ${countText(answered, 'keine', 'eine')} davon beantwortet`;
    speechOutput += '.';
    return { speechOutput, cardContent: speechOutput, politician, title: `${name}: Fragen und Antworten` };
}

export function votesResponse(mandate, votes) {
    const politician = politicianFor(mandate);
    const name = nameFor(politician);
    const counts = { yes: 0, no: 0, abstain: 0 };
    for (const vote of votes) {
        if (Object.hasOwn(counts, vote.vote)) counts[vote.vote] += 1;
    }
    const participated = counts.yes + counts.no + counts.abstain;
    let speechOutput = `${name} hat an `;
    if (participated === 0) {
        speechOutput += 'keiner Abstimmung teilgenommen.';
    } else {
        speechOutput +=
            `${countText(participated, 'keiner', 'einer')} Abstimmung${participated === 1 ? '' : 'en'} teilgenommen, ` +
            `bei ${countText(counts.yes, 'keiner', 'einer')} mit Ja gestimmt, ` +
            `bei ${countText(counts.no, 'keiner', 'einer')} mit Nein gestimmt und ` +
            `sich bei ${countText(counts.abstain, 'keiner', 'einer')} enthalten.`;
    }
    return { speechOutput, cardContent: speechOutput, politician, title: `${name}: Abstimmungsverhalten` };
}

export function committeesResponse(mandate, memberships) {
    const politician = politicianFor(mandate);
    const name = nameFor(politician);
    const committees = [...new Set(memberships.map((membership) => membership.committee?.label).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, 'de'),
    );
    const speechOutput = committees.length
        ? `${name} ist in folgenden Ausschüssen vertreten: ${joinGerman(committees)}.`
        : `${name} ist in keinem Ausschuss vertreten.`;
    return { speechOutput, cardContent: speechOutput, politician, title: `${name}: Ausschussmitgliedschaften` };
}

export function sidejobsResponse(mandate, sidejobs) {
    const politician = politicianFor(mandate);
    const name = nameFor(politician);
    if (sidejobs.length === 0) {
        const speechOutput = `${name} geht keiner Nebentätigkeit nach.`;
        return { speechOutput, cardContent: speechOutput, politician, title: `${name}: Nebentätigkeiten` };
    }

    const paid = sidejobs.filter((sidejob) => Number.isFinite(sidejob.income)).length;
    const speechOutput =
        `${name} hat ${countText(sidejobs.length, 'keine', 'eine')} ` +
        `Nebentätigkeit${sidejobs.length === 1 ? '' : 'en'}. ` +
        `Bei ${countText(paid, 'keiner', 'einer')} sind Einkünfte ausgewiesen.`;
    const details = sidejobs.map((sidejob) => {
        const organization = sidejob.sidejob_organization?.label;
        return `• ${sidejob.label}${organization ? ` – ${organization}` : ''}`;
    });
    return {
        speechOutput,
        cardContent: `${speechOutput}\n\n${details.join('\n')}`,
        politician,
        title: `${name}: Nebentätigkeiten`,
    };
}

export function renderResponse(handlerInput, type, mandate, related = []) {
    const content = {
        deputy: () => deputyResponse(mandate),
        answers: () => answersResponse(mandate),
        votes: () => votesResponse(mandate, related),
        committees: () => committeesResponse(mandate, related),
        sidejobs: () => sidejobsResponse(mandate, related),
    }[type]?.();
    if (!content) throw new Error(`Unknown response type: ${type}`);
    return card(handlerInput, content.title, content, content.politician);
}
