export const mandate = {
    id: 68737,
    type: 'mandate',
    parliament_period: { id: 161, label: 'Bundestag 2025 - 2029' },
    related_data: {
        politician: {
            id: 118559,
            label: 'Friedrich Merz',
            field_title: null,
            sex: 'm',
            year_of_birth: 1955,
            education: 'Rechtsanwalt',
            occupation: 'MdB',
            party: { id: 2, label: 'CDU' },
            statistic_questions: 438,
            statistic_questions_answered: null,
            abgeordnetenwatch_url: 'https://www.abgeordnetenwatch.de/profile/friedrich-merz',
        },
    },
};

export function apiResponse(data) {
    return { meta: { status: 'ok', status_message: '' }, data };
}
