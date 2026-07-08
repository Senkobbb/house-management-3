export type RoomStatus = 'vacant' | 'occupied';

export interface Room {
  id: string;
  name: string;
  floor: number;
  price: number;
  status: RoomStatus;
  maxTenants: number;
}

export type RoomPayload = Omit<Room, 'id'>;
