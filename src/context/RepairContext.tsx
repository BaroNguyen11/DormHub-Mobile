import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { createMaintenanceRequest, getMaintenanceRequest, getMaintenanceRequests, mapRepairCategoryToMaintenanceType } from '../api/maintenance';
import { useResidence } from './ResidenceContext';
import type { RepairDraft, RepairRequest } from '../types/repair';
import type { ResidenceStatus } from '../types/residence';

interface RepairContextValue {
  requests: readonly RepairRequest[];
  isLoading: boolean;
  hasMoreRequests: boolean;
  error: string | null;
  createRequest: (draft: RepairDraft, title?: string) => Promise<RepairRequest | null>;
  getRequestDetail: (id: string) => Promise<RepairRequest | null>;
  loadMoreRequests: () => Promise<void>;
  resetForAccount: (residenceStatus: ResidenceStatus) => void;
}
const RepairContext = createContext<RepairContextValue | null>(null);

export function RepairProvider({ children }: PropsWithChildren) {
  const { session } = useResidence();
  const [requests, setRequests] = useState<readonly RepairRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreRequests, setHasMoreRequests] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestsRef = useRef(requests);
  const backendAccountRef = useRef(false);
  const loadVersionRef = useRef(0);
  const pageRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const resetForAccount = useCallback((residenceStatus: ResidenceStatus) => {
    backendAccountRef.current = residenceStatus === 'active';
    const version = ++loadVersionRef.current;
    setError(null);
    pageRef.current = 0;
    setHasMoreRequests(false);
    if (residenceStatus !== 'active') {
      requestsRef.current = [];
      setRequests([]);
      setIsLoading(false);
      return;
    }
    requestsRef.current = [];
    setRequests([]);
    setIsLoading(true);
    void getMaintenanceRequests(0, 10).then((page) => {
      if (version !== loadVersionRef.current) return;
      requestsRef.current = page.content;
      setRequests(page.content);
      pageRef.current = page.page;
      setHasMoreRequests(!page.last);
    }).catch((loadError: unknown) => {
      if (version === loadVersionRef.current) setError(loadError instanceof Error ? loadError.message : 'Không tải được yêu cầu bảo trì.');
    }).finally(() => {
      if (version === loadVersionRef.current) setIsLoading(false);
    });
  }, []);

  const loadMoreRequests = useCallback(async () => {
    if (!backendAccountRef.current || !hasMoreRequests || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const page = await getMaintenanceRequests(pageRef.current + 1, 10);
      const existing = new Set(requestsRef.current.map((item) => item.id));
      const next = [...requestsRef.current, ...page.content.filter((item) => !existing.has(item.id))];
      requestsRef.current = next;
      setRequests(next);
      pageRef.current = page.page;
      setHasMoreRequests(!page.last);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không tải được yêu cầu bảo trì.');
    } finally {
      loadingMoreRef.current = false;
      setIsLoading(false);
    }
  }, [hasMoreRequests]);

  const createRequest = useCallback(async (draft: RepairDraft, titleInput?: string): Promise<RepairRequest | null> => {
    if (session.status !== 'active' || !session.roomId) return null;
    if (session.backendRoomId == null || !draft.category || !draft.priority) return null;
      const description = draft.description.trim();
      const title = titleInput?.trim() || (description.length > 42 ? `${description.slice(0, 42).trimEnd()}…` : description);
      const created = await createMaintenanceRequest({
        title,
        description,
        priority: draft.priority,
        type: mapRepairCategoryToMaintenanceType(draft.category),
        roomId: session.backendRoomId,
      });
      const next = [created, ...requestsRef.current];
      requestsRef.current = next;
      setRequests(next);
      return created;
  }, [session]);

  const getRequestDetail = useCallback(async (id: string): Promise<RepairRequest | null> => {
    const cached = requestsRef.current.find((item) => item.id === id);
    if (!backendAccountRef.current) return cached ?? null;
    const detail = await getMaintenanceRequest(id);
    const next = [detail, ...requestsRef.current.filter((item) => item.id !== id)];
    requestsRef.current = next;
    setRequests(next);
    return detail;
  }, []);

  return <RepairContext.Provider value={{ requests, isLoading, hasMoreRequests, error, createRequest, getRequestDetail, loadMoreRequests, resetForAccount }}>{children}</RepairContext.Provider>;
}

export function useRepairs() { const value = useContext(RepairContext); if (!value) throw new Error('RepairProvider is missing'); return value; }
