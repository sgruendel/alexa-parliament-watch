import https from 'node:https';

import fetch from 'node-fetch';

import { createRequestSignal } from './request-budget.js';

export const API_BASE_URL = 'https://www.abgeordnetenwatch.de/api/v2/';
export const BUNDESTAG_ID = 5;

const httpsAgent = new https.Agent({ keepAlive: true });

export class HttpError extends Error {
    constructor(statusCode) {
        super(`Abgeordnetenwatch request failed with status ${statusCode}`);
        this.name = 'HttpError';
        this.statusCode = statusCode;
    }
}

export class ApiError extends Error {
    constructor(message) {
        super(`Abgeordnetenwatch API error: ${message}`);
        this.name = 'ApiError';
    }
}

function queryString(query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) params.set(key, String(value));
    }
    return params.toString();
}

/** Fetch and validate one API v2 response. */
export async function getJson(path, query = {}, { signal = createRequestSignal() } = {}) {
    signal.throwIfAborted();
    const suffix = queryString(query);
    const response = await fetch(API_BASE_URL + path + (suffix ? `?${suffix}` : ''), {
        agent: httpsAgent,
        headers: { accept: 'application/json' },
        signal,
    });
    if (!response.ok) throw new HttpError(response.status);

    const body = await response.json();
    if (body?.meta?.status !== 'ok' || body.data === undefined) {
        throw new ApiError(body?.meta?.status_message || 'invalid response');
    }
    return body;
}

export async function getParliamentPeriods(parliamentId = BUNDESTAG_ID, options) {
    const response = await getJson('parliament-periods', { parliament: parliamentId, range_end: 100 }, options);
    if (!Array.isArray(response.data)) throw new ApiError('expected parliament-period list');
    return response.data;
}

export function currentLegislature(periods, now = new Date()) {
    const date = now.toISOString().slice(0, 10);
    const current = periods
        .filter(
            (period) =>
                period?.type === 'legislature' &&
                typeof period.start_date_period === 'string' &&
                period.start_date_period <= date &&
                (period.end_date_period == null || period.end_date_period >= date),
        )
        .sort((a, b) => b.start_date_period.localeCompare(a.start_date_period))[0];
    if (!current) throw new ApiError('no current legislature found');
    return current;
}

export async function getMandates(parliamentPeriodId, options) {
    const response = await getJson(
        'candidacies-mandates',
        { parliament_period: parliamentPeriodId, type: 'mandate', range_end: 1000 },
        options,
    );
    if (!Array.isArray(response.data)) throw new ApiError('expected mandate list');
    return response.data;
}

export async function getMandate(mandateId, options) {
    const response = await getJson(
        `candidacies-mandates/${encodeURIComponent(mandateId)}`,
        { related_data: 'politician' },
        options,
    );
    if (!response.data || Array.isArray(response.data)) throw new ApiError('expected mandate');
    return response.data;
}

async function getList(path, query, description, options) {
    const response = await getJson(path, { ...query, range_end: 1000 }, options);
    if (!Array.isArray(response.data)) throw new ApiError(`expected ${description} list`);
    return response.data;
}

export function getVotes(mandateId, options) {
    return getList('votes', { mandate: mandateId }, 'vote', options);
}

export function getCommitteeMemberships(mandateId, options) {
    return getList('committee-memberships', { candidacy_mandate: mandateId }, 'committee membership', options);
}

export function getSidejobs(mandateId, options) {
    return getList('sidejobs', { mandates: mandateId }, 'sidejob', options);
}
