'use strict';

const request = require('request-promise-native');

const apiRequest = request.defaults({
    baseUrl: 'https://www.abgeordnetenwatch.de/api',
    gzip: true,
    json: true,
});

var exports = module.exports = {};

exports.getParliaments = async function() {
    const options = {
        uri: 'parliaments.json',
    };
    return apiRequest(options);
};

exports.getCandidates = async function(uuid) {
    const options = {
        uri: 'parliament/' + uuid + '/candidates.json',
    };
    return apiRequest(options);
};

exports.getProfile = async function(uuid, username) {
    const options = {
        uri: 'parliament/' + uuid + '/profile/' + username + '/profile.json',
    };
    return apiRequest(options);
};
