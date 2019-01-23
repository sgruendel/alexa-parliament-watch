'use strict';

const fs = require('fs');
const abgeordnetenwatch = require('./abgeordnetenwatch');

const MODEL_FILE = 'models/de-DE.json';
const UTF8 = 'utf8';

const SUPPORTED_PARLIAMENTS = [
    /*
    'Baden-Württemberg',
    'Bayern',
    'Berlin',
    'Brandenburg',
    'Bremen',
    */
    'Bundestag',
    /*
    'EU',
    'Hamburg',
    'Hessen',
    'Mecklenburg-Vorpommern',
    'Niedersachsen',
    'Nordrhein-Westfalen',
    'Rheinland-Pfalz',
    'Saarland',
    'Sachsen',
    'Sachsen-Anhalt',
    'Schleswig-Holstein',
    'Thüringen',
    */
];

async function createModel() {
    const getParliaments = abgeordnetenwatch.getParliaments();

    var promises = [];
    var listOfParliaments = [];
    var listOfDeputies = [];
    var listOfIDs = [];
    getParliaments
        .then(result => {
            result.parliaments.forEach(parliament => {
                if (SUPPORTED_PARLIAMENTS.includes(parliament.name)) {
                    listOfParliaments.push({
                        id: parliament.meta.uuid,
                        name: { value: parliament.name },
                    });

                    const getDeputies = abgeordnetenwatch.getDeputies(parliament.meta.uuid);
                    promises.push(getDeputies);
                    getDeputies
                        .then(result => {
                            result.profiles.forEach(profile => {
                                const id = /* parliament.meta.uuid + '/' + */ profile.meta.username;
                                if (!listOfIDs.includes(id)) {
                                    listOfIDs.push(id);
                                    listOfDeputies.push({
                                        id: id,
                                        name: {
                                            value: profile.personal.first_name + ' ' + profile.personal.last_name,
                                        },
                                    });
                                }
                            });
                            console.log('done with', parliament.name);
                        });
                }
            });
        });

    // read existing interaction model
    var model = JSON.parse(fs.readFileSync(MODEL_FILE, UTF8));

    // wait for getParliaments to finish to make sure promises array is complete
    console.log('waiting for', getParliaments);
    await getParliaments;

    console.log('waiting for', promises);
    await Promise.all(promises);

    // sort deputies by name to guarantee stable order when regenerating
    listOfDeputies.sort((a, b) => a.id > b.id ? 1 : ((b.id > a.id) ? -1 : 0));

    model.interactionModel.languageModel.types = [
        {
            name: 'LIST_OF_PARLIAMENTS',
            values: listOfParliaments,
        },
        {
            name: 'LIST_OF_DEPUTIES',
            values: listOfDeputies,
        },
    ];
    // serialize new interaction model
    fs.writeFileSync(MODEL_FILE, JSON.stringify(model, null, 2), UTF8);
}

createModel();
