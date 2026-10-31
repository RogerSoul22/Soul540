import type { ContractForm, Contract as SharedContract } from '@soul540/screens';

export type Contract = SharedContract;
export type FormData = ContractForm;
export type ContractEvents = Array<{ id: string; name: string }>;
