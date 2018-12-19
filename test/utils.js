'use strict';

const expect = require('chai').expect;
const utils = require('../src/utils');

const angelaMerkel = require('./angela-merkel.json');
const christianeJagau = require('./christiane-jagau.json');
const marionTerhalle = require('./marion-terhalle.json');
const christophMerkel = require('./christoph-merkel.json');
const alexanderGrafLambsdorff = require('./alexander-graf-lambsdorff.json');

describe('utils', () => {

    // parseParliamentUsername() tested as part of alexa-skill-test.js

    describe('#getDeputyResponseData()', () => {
        it('should work for Angela Merkel', () => {
            const result = utils.getDeputyResponseData(angelaMerkel.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Dr. Angela Merkel ist Mitglied der CDU im Bundestag. Sie wurde 1954 geboren, besitzt eine Ausbildung als Promovierte Physikerin und ist tätig als Bundeskanzlerin.');
            expect(result.cardTitle, 'cardTitle').to.equal('Dr. Angela Merkel');
            expect(result.cardContent, 'cardContent').to.equal('Im Bundestag für die CDU\ngeboren 1954\nAusbildung: Promovierte Physikerin\nTätigkeit: Bundeskanzlerin\n\nFoto Fotograf Laurence Chaperon, CC BY-SA 3.0 DE');
        });

        it('should work for deputies without party, degree and education', () => {
            const result = utils.getDeputyResponseData(christianeJagau.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Christiane Jagau ist parteilos im Bundestag. Sie wurde 1962 geboren und ist tätig als Büroangestellte.');
            expect(result.cardTitle, 'cardTitle').to.equal('Christiane Jagau');
            expect(result.cardContent, 'cardContent').to.equal('parteilos im Bundestag\ngeboren 1962\nTätigkeit: Büroangestellte');
        });

        it('should work for female deputies without birthyear', () => {
            const result = utils.getDeputyResponseData(marionTerhalle.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Marion Terhalle ist Mitglied der FDP im Bundestag. Sie ist tätig als Finanzwirtin.');
            expect(result.cardTitle, 'cardTitle').to.equal('Marion Terhalle');
            expect(result.cardContent, 'cardContent').to.equal('Im Bundestag für die FDP\nTätigkeit: Finanzwirtin');
        });

        it('should work for male deputies without birthyear', () => {
            const result = utils.getDeputyResponseData(christophMerkel.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Christoph Merkel ist Mitglied der AfD im Bundestag. Er besitzt eine Ausbildung als Jurist.');
            expect(result.cardTitle, 'cardTitle').to.equal('Christoph Merkel');
            expect(result.cardContent, 'cardContent').to.equal('Im Bundestag für die AfD\nAusbildung: Jurist');
        });

        it('should normalize copyright with HTML', () => {
            const result = utils.getDeputyResponseData(alexanderGrafLambsdorff.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Alexander Graf Lambsdorff ist Mitglied der FDP im Bundestag. Er wurde 1966 geboren, besitzt eine Ausbildung als Geschichte und ist tätig als MdB.');
            expect(result.cardTitle, 'cardTitle').to.equal('Alexander Graf Lambsdorff');
            expect(result.cardContent, 'cardContent').to.equal('Im Bundestag für die FDP\ngeboren 1966\nAusbildung: Geschichte\nTätigkeit: MdB\n\nFoto Graf Alexander Lambsdorff');
        });
    });

    describe('#getAnswerResponseData()', () => {
        it('should work for Angela Merkel', () => {
            const result = utils.getAnswerResponseData(angelaMerkel.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Dr. Angela Merkel hat 104 Fragen erhalten und keine davon beantwortet.');
            expect(result.cardTitle, 'cardTitle').to.equal('Dr. Angela Merkel: Fragen und Antworten');
            expect(result.cardContent, 'cardContent').to.equal('Dr. Angela Merkel hat 104 Fragen erhalten und keine davon beantwortet.\n\nFoto Fotograf Laurence Chaperon, CC BY-SA 3.0 DE');
        });

        it('should work for Alexander Graf Lambsdorff', () => {
            const result = utils.getAnswerResponseData(alexanderGrafLambsdorff.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Alexander Graf Lambsdorff hat 8 Fragen erhalten und keine davon beantwortet.');
            expect(result.cardTitle, 'cardTitle').to.equal('Alexander Graf Lambsdorff: Fragen und Antworten');
            expect(result.cardContent, 'cardContent').to.equal('Alexander Graf Lambsdorff hat 8 Fragen erhalten und keine davon beantwortet.\n\nFoto Graf Alexander Lambsdorff');
        });
    });

    describe('#getVotesResponseData()', () => {
        it('should work for Angela Merkel', () => {
            const result = utils.getVotesResponseData(angelaMerkel.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Dr. Angela Merkel hat an 8 Abstimmungen teilgenommen, bei 5 mit Ja gestimmt, bei 3 mit Nein gestimmt und hat sich bei keiner enthalten.');
            expect(result.cardTitle, 'cardTitle').to.equal('Dr. Angela Merkel: Abstimmungsverhalten');
            expect(result.cardContent, 'cardContent').to.equal('Dr. Angela Merkel hat an 8 Abstimmungen teilgenommen, bei 5 mit Ja gestimmt, bei 3 mit Nein gestimmt und hat sich bei keiner enthalten.\n\nFoto Fotograf Laurence Chaperon, CC BY-SA 3.0 DE');
        });

        it('should work for Alexander Graf Lambsdorff', () => {
            const result = utils.getVotesResponseData(alexanderGrafLambsdorff.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Alexander Graf Lambsdorff hat an 34 Abstimmungen teilgenommen, bei 18 mit Ja gestimmt, bei 14 mit Nein gestimmt und hat sich bei 2 enthalten.');
            expect(result.cardTitle, 'cardTitle').to.equal('Alexander Graf Lambsdorff: Abstimmungsverhalten');
            expect(result.cardContent, 'cardContent').to.equal('Alexander Graf Lambsdorff hat an 34 Abstimmungen teilgenommen, bei 18 mit Ja gestimmt, bei 14 mit Nein gestimmt und hat sich bei 2 enthalten.\n\nFoto Graf Alexander Lambsdorff');
        });
    });

    describe('#getCommitteesResponseData()', () => {
        it('should work for Angela Merkel', () => {
            const result = utils.getCommitteesResponseData(angelaMerkel.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Dr. Angela Merkel ist in keinem Ausschuss vertreten.');
            expect(result.cardTitle, 'cardTitle').to.equal('Dr. Angela Merkel: Ausschussmitgliedschaften');
            expect(result.cardContent, 'cardContent').to.equal('Dr. Angela Merkel ist in keinem Ausschuss vertreten.\n\nFoto Fotograf Laurence Chaperon, CC BY-SA 3.0 DE');
        });

        it('should work for Alexander Graf Lambsdorff', () => {
            const result = utils.getCommitteesResponseData(alexanderGrafLambsdorff.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Alexander Graf Lambsdorff ist in folgenden Ausschüssen vertreten: Ausschuss für die Angelegenheiten der Europäischen Union, Ausschuss für Menschenrechte und humanitäre Hilfe, Ausschuss für wirtschaftliche Zusammenarbeit und Entwicklung, Auswärtiger Ausschuss, Verteidigungsausschuss');
            expect(result.cardTitle, 'cardTitle').to.equal('Alexander Graf Lambsdorff: Ausschussmitgliedschaften');
            expect(result.cardContent, 'cardContent').to.equal('Alexander Graf Lambsdorff ist in folgenden Ausschüssen vertreten: Ausschuss für die Angelegenheiten der Europäischen Union, Ausschuss für Menschenrechte und humanitäre Hilfe, Ausschuss für wirtschaftliche Zusammenarbeit und Entwicklung, Auswärtiger Ausschuss, Verteidigungsausschuss\n\nFoto Graf Alexander Lambsdorff');
        });
    });

    describe('#getSidejobsResponseData()', () => {
        it('should work for Angela Merkel', () => {
            const result = utils.getSidejobsResponseData(angelaMerkel.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Dr. Angela Merkel geht folgenden Nebentätigkeiten nach: 7 Aktivitäten ohne Einkünfte');
            expect(result.cardTitle, 'cardTitle').to.equal('Dr. Angela Merkel: Nebentätigkeiten');
            expect(result.cardContent, 'cardContent').to.equal('Dr. Angela Merkel geht folgenden Nebentätigkeiten nach: \n7 Aktivitäten ohne Einkünfte\n\nFoto Fotograf Laurence Chaperon, CC BY-SA 3.0 DE');
        });

        it('should work for Alexander Graf Lambsdorff', () => {
            const result = utils.getSidejobsResponseData(alexanderGrafLambsdorff.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Alexander Graf Lambsdorff geht folgenden Nebentätigkeiten nach: 3 Aktivitäten mit einmalig 3500-7000 €, eine Aktivität mit einmalig 7000-15000 € und 3 Aktivitäten ohne Einkünfte');
            expect(result.cardTitle, 'cardTitle').to.equal('Alexander Graf Lambsdorff: Nebentätigkeiten');
            expect(result.cardContent, 'cardContent').to.equal('Alexander Graf Lambsdorff geht folgenden Nebentätigkeiten nach: \n3 Aktivitäten mit einmalig 3500-7000 €\neine Aktivität mit einmalig 7000-15000 €\n3 Aktivitäten ohne Einkünfte\n\nFoto Graf Alexander Lambsdorff');
        });
    });

});
