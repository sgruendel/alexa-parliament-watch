import fs from 'node:fs';

import * as api from '../abgeordnetenwatch.js';

const MODEL_FILE = new URL('../../skill-package/interactionModels/custom/de-DE.json', import.meta.url);

async function createModel() {
    const options = { signal: AbortSignal.timeout(30_000) };
    const periods = await api.getParliamentPeriods(api.BUNDESTAG_ID, options);
    const period = api.currentLegislature(periods);
    const mandates = await api.getMandates(period.id, options);
    const values = mandates
        .filter(
            (mandate) =>
                Number.isInteger(mandate.id) &&
                Number.isInteger(mandate.politician?.id) &&
                typeof mandate.politician.label === 'string' &&
                mandate.end_date == null,
        )
        .map((mandate) => ({
            id: String(mandate.id),
            name: { value: mandate.politician.label },
        }))
        .sort((a, b) => a.name.value.localeCompare(b.name.value, 'de'));

    if (values.length < 500) throw new Error(`Only ${values.length} active mandates found for ${period.label}`);
    const model = JSON.parse(fs.readFileSync(MODEL_FILE, 'utf8'));
    model.interactionModel.languageModel.types = [{ name: 'LIST_OF_DEPUTIES', values }];
    fs.writeFileSync(MODEL_FILE, `${JSON.stringify(model, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${values.length} active members from ${period.label}.`);
}

createModel().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
