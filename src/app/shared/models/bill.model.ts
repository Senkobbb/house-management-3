export type PaymentStatus = 'paid' | 'unpaid';

export interface Bill {
  id: string;
  roomId: string;
  month: number;
  year: number;
  rentAmount: number;
  electricUsage: number;
  electricUnitPrice: number;
  waterUsage: number;
  waterUnitPrice: number;
  serviceFee: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export type BillPayload = Omit<Bill, 'id' | 'createdAt'>;

export function calculateBillTotal(
  bill: Pick<Bill, 'rentAmount' | 'electricUsage' | 'electricUnitPrice' | 'waterUsage' | 'waterUnitPrice' | 'serviceFee'>,
): number {
  return (
    bill.rentAmount +
    bill.electricUsage * bill.electricUnitPrice +
    bill.waterUsage * bill.waterUnitPrice +
    bill.serviceFee
  );
}
