import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { createMaintenance, getMaintenance, listMaintenance } from '../api/student';
import { uploadImage } from '../api/httpClient';
import type { MaintenanceDto } from '../api/student';
import { useAuth } from './AuthContext';
import { useResidence } from './ResidenceContext';
import type { RepairDraft, RepairRequest } from '../types/repair';

interface RepairContextValue {
  requests: readonly RepairRequest[];
  loading: boolean;
  error: string | null;
  refreshRepairs: () => Promise<void>;
  fetchRequest: (id: string) => Promise<RepairRequest>;
  createRequest: (draft: RepairDraft) => Promise<RepairRequest | null>;
}
const RepairContext = createContext<RepairContextValue | null>(null);
const localDate = (value?: string | null) => { if (!value) return ''; const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN'); };
const localTime = (value?: string | null) => { if (!value) return ''; const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); };
function mapMaintenance(dto: MaintenanceDto): RepairRequest {
  return {
    id: String(dto.id), roomId: String(dto.roomId), title: dto.title, description: dto.description,
    category: dto.type as RepairRequest['category'], priority: dto.priority as RepairRequest['priority'],
    status: dto.status as RepairRequest['status'], createdDate: localDate(dto.createdAt), createdTime: localTime(dto.createdAt),
    updatedDate: localDate(dto.updatedAt), resolvedDate: localDate(dto.resolvedAt), rejectionReason: dto.rejectionReason ?? undefined,
    imageUris: dto.imageUrl ? [dto.imageUrl] : [], collection: dto.status === 'COMPLETED' || dto.status === 'REJECTED' ? 'history' : 'current',
  };
}
export function RepairProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const { session } = useResidence();
  const [requests, setRequests] = useState<readonly RepairRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshRepairs = useCallback(async () => {
    if (auth.status !== 'authenticated') { setRequests([]); setError(null); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try { setRequests((await listMaintenance()).data.content.map(mapMaintenance)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không tải được danh sách sửa chữa.'); throw cause; }
    finally { setLoading(false); }
  }, [auth.status, auth.status === 'authenticated' ? auth.user.userId : null]);
  useEffect(() => { void refreshRepairs().catch(() => undefined); }, [refreshRepairs]);
  const createRequest = useCallback(async (draft: RepairDraft): Promise<RepairRequest | null> => {
    if (session.status !== 'active' || !draft.title.trim() || !draft.description.trim()) return null;
    const imageUrl = draft.imageUris[0] ? await uploadImage(draft.imageUris[0]) : undefined;
    const dto = (await createMaintenance({ title: draft.title.trim(), assetName: draft.title.trim(), description: draft.description.trim(), priority: draft.priority ?? 'MEDIUM', type: draft.category, imageUrl })).data;
    const created = mapMaintenance(dto);
    setRequests((previous) => [created, ...previous]);
    return created;
  }, [session.status]);
  const fetchRequest = useCallback(async (id: string) => mapMaintenance((await getMaintenance(id)).data), []);
  const value = useMemo(() => ({ requests, loading, error, refreshRepairs, fetchRequest, createRequest }), [requests, loading, error, refreshRepairs, fetchRequest, createRequest]);
  return <RepairContext.Provider value={value}>{children}</RepairContext.Provider>;
}
export function useRepairs() { const value = useContext(RepairContext); if (!value) throw new Error('RepairProvider is missing'); return value; }
