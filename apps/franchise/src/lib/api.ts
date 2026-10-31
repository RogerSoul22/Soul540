import { createApiFetch } from '@soul540/api-client';

const baseUrl = import.meta.env.VITE_API_URL || '';

export { ApiRequestError } from '@soul540/api-client';

export const apiFetch = createApiFetch({ baseUrl, system: 'franchise' });
