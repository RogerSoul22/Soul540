import { createApiFetch } from '../../../../packages/api-client/src/index';

export { ApiRequestError, SILENT_ERRORS_HEADER } from '../../../../packages/api-client/src/index';

export const apiFetch = createApiFetch();
