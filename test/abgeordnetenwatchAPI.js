'use strict';

const expect = require('chai').expect;
const abgeordnetenwatch = require('../src/abgeordnetenwatchAPI');

describe('abgeordnetenwatchAPI', () => {
    describe('#getParliaments()', () => {
        it('should return all parliaments', async function() {
            const result = await abgeordnetenwatch.getParliaments();
            expect(result.parliaments).to.have.length.above(50);

            result.parliaments.forEach(parliament => {
                expect(parliament.name).to.be.a('string');
            });
        });
    });

    describe('#getCandidates()', () => {
        it('should return all candidates for Hamburg', async function() {
            const result = await abgeordnetenwatch.getCandidates('eacf8eca-932f-4620-9668-7386013481a0');
            expect(result.profiles).to.have.length.above(99);

            result.profiles.forEach(profile => {
                expect(profile.personal.first_name).to.be.a('string');
                expect(profile.personal.last_name).to.be.a('string');
            });
        });
    });

    describe('#getProfile()', () => {
        it('should return profile for Angela Merkel', async function () {
            const result = await abgeordnetenwatch.getProfile('60d0787f-e311-4283-a7fd-85b9f62a9b33', 'angela-merkel');
            expect(result.profile).to.exist;
            expect(result.profile.personal.first_name).to.equal('Angela');
            expect(result.profile.personal.last_name).to.equal('Merkel');
        });
    });
});
