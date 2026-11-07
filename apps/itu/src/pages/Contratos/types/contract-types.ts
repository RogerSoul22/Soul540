import type { ContractForm, Contract as SharedContract } from '../../../../../../packages/screens/src/index';

export type Contract = SharedContract;
export type FormData = ContractForm;
export type ContractEvents = Array<{ id: string; name: string }>;
