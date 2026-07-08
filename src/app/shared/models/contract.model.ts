export type ContractStatus = 'active' | 'ended' | 'cancelled';

export interface Contract {
  id: string;
  tenantId: string;
  roomId: string;
  deposit: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
}

export type ContractPayload = Omit<Contract, 'id'>;
