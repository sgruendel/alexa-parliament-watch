import { expect } from 'chai';

import { getElicitSlotPrompt, resolveSlot } from '../../slot-resolution.js';
import { resolvedSlot } from '../helpers/alexa.js';

describe('slot resolution', () => {
    it('handles missing and malformed slots', () => {
        expect(resolveSlot()).to.deep.equal({ status: 'missing' });
        expect(resolveSlot({ value: 'Name' })).to.deep.equal({ status: 'error' });
        expect(resolveSlot(resolvedSlot('deputy', 'Name', [{ name: 'Name' }] ), { requireId: true })).to.deep.equal({
            status: 'error',
        });
    });

    it('handles unknown, exact, single, ambiguous, and duplicate matches', () => {
        const unknown = resolvedSlot('deputy', 'Niemand', [], 'ER_SUCCESS_NO_MATCH');
        expect(resolveSlot(unknown)).to.deep.equal({ status: 'unknown' });
        const exact = resolvedSlot('deputy', 'Alex Müller', [
            { id: '1', name: 'Alexander Müller' },
            { id: '2', name: 'Alex Müller' },
        ]);
        expect(resolveSlot(exact, { requireId: true }).value.id).to.equal('2');
        const single = resolvedSlot('deputy', 'Merz', [{ id: '3', name: 'Friedrich Merz' }]);
        expect(resolveSlot(single, { requireId: true }).value.id).to.equal('3');
        const ambiguous = resolvedSlot('deputy', 'Müller', [
            { id: '1', name: 'Alexander Müller' },
            { id: '2', name: 'Claudia Müller' },
            { id: '2', name: 'Claudia Müller' },
        ]);
        expect(resolveSlot(ambiguous, { requireId: true }).candidates).to.have.length(2);
    });

    it('builds a natural elicitation prompt', () => {
        expect(getElicitSlotPrompt('Welche Person', ['Anna A', 'Berta B'])).to.equal(
            'Welche Person, Anna A oder Berta B?',
        );
    });
});
