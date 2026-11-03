// Local UI view models. They do not describe backend DTOs.
export type ResidenceStatus = 'none' | 'active' | 'pending' | 'rejected';

export interface StudentProfile { name: string; initials: string; greetingDate: string }
export interface ResidenceSession { status: ResidenceStatus; roomId: string | null }
export interface RoomApplication { roomId: string; sentDate: string; sentTime: string; startDate?: string; note?: string; decisionDate?: string; decisionTime?: string; rejectionReason?: string }
export interface ContractOverview { number: string; roomLabel: string; startDate: string; endDate: string; monthlyPrice: number; deposit: number; terms: readonly string[] }
export interface UtilityOverview { month: string; electricityKwh: number; previousElectricityKwh: number; waterM3: number; previousWaterM3: number; electricityHistory: readonly { month: string; kwh: number }[] }
export interface HomeOverview { notifications: readonly { title: string; message: string; time: string; icon: 'file-text' | 'tool' }[] }
