'use strict';

const A_HREF_RE = new RegExp('<a[^>]*>([^<]*)</a>');

var exports = module.exports = {};

exports.getResponseData = function(profile) {
    const name = (profile.personal.degree ? profile.personal.degree + ' ' : '') + profile.personal.first_name + ' ' + profile.personal.last_name;
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
