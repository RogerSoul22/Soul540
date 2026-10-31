import { createApiFetch } from '../../../../packages/api-client/src/index';

const baseUrl = import.meta.env.VITE_API_URL || '';

export { ApiRequestError } from '../../../../packages/api-client/src/index';

export const apiFetch = createApiFetch({ baseUrl, system: 'factory' });
