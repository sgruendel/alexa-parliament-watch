'use strict';

const expect = require('chai').expect;
const utils = require('../src/utils');

const angelaMerkel = require('./angela-merkel.json');
const christianeJagau = require('./christiane-jagau.json');
const marionTerhalle = require('./marion-terhalle.json');
const christophMerkel = require('./christoph-merkel.json');
const alexanderGrafLambsdorff = require('./alexander-graf-lambsdorff.json');

describe('util', () => {
    describe('#getResponseData()', () => {
        it('should work for Angela Merkel', () => {
            const result = utils.getResponseData(angelaMerkel.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Dr. Angela Merkel ist Mitglied der CDU im Bundestag. Sie wurde 1954 geboren, besitzt eine Ausbildung als Promovierte Physikerin und ist tätig als Bundeskanzlerin.');
            expect(result.cardTitle, 'cardTitle').to.equal('Dr. Angela Merkel');
            expect(result.cardContent, 'cardContent').to.equal('Im Bundestag für die CDU\ngeboren 1954\nAusbildung: Promovierte Physikerin\nTätigkeit: Bundeskanzlerin\n\nFoto Fotograf Laurence Chaperon, CC BY-SA 3.0 DE');
        });

        it('should work for candidates without party, degree and education', () => {
            const result = utils.getResponseData(christianeJagau.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Christiane Jagau ist parteilos im Bundestag. Sie wurde 1962 geboren und ist tätig als Büroangestellte.');
            expect(result.cardTitle, 'cardTitle').to.equal('Christiane Jagau');
            expect(result.cardContent, 'cardContent').to.equal('parteilos im Bundestag\ngeboren 1962\nTätigkeit: Büroangestellte');
        });

        it('should work for female candidates without birthyear', () => {
            const result = utils.getResponseData(marionTerhalle.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Marion Terhalle ist Mitglied der FDP im Bundestag. Sie ist tätig als Finanzwirtin.');
            expect(result.cardTitle, 'cardTitle').to.equal('Marion Terhalle');
            expect(result.cardContent, 'cardContent').to.equal('Im Bundestag für die FDP\nTätigkeit: Finanzwirtin');
        });

        it('should work for male candidates without birthyear', () => {
            const result = utils.getResponseData(christophMerkel.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Christoph Merkel ist Mitglied der AfD im Bundestag. Er besitzt eine Ausbildung als Jurist.');
            expect(result.cardTitle, 'cardTitle').to.equal('Christoph Merkel');
            expect(result.cardContent, 'cardContent').to.equal('Im Bundestag für die AfD\nAusbildung: Jurist');
        });

        it('should normalize copyright with HTML', () => {
            const result = utils.getResponseData(alexanderGrafLambsdorff.profile);
            expect(result.speechOutput, 'speechOutput').to.equal('Alexander Graf Lambsdorff ist Mitglied der FDP im Bundestag. Er wurde 1966 geboren, besitzt eine Ausbildung als Geschichte und ist tätig als MdB.');
            expect(result.cardTitle, 'cardTitle').to.equal('Alexander Graf Lambsdorff');
            expect(result.cardContent, 'cardContent').to.equal('Im Bundestag für die FDP\ngeboren 1966\nAusbildung: Geschichte\nTätigkeit: MdB\n\nFoto Graf Alexander Lambsdorff');
        });
    });
});
