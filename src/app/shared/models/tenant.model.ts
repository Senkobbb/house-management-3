export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  idCardNumber: string;
  roomId: string | null;
  moveInDate: string;
  moveOutDate: string | null;
}

export type TenantPayload = Omit<Tenant, 'id'>;
