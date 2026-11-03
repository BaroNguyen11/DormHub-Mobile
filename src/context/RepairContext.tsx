import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useResidence } from './ResidenceContext';
import { initialRepairRequests, mockRepairDate, mockRepairTime } from '../mocks/repairs';
import type { RepairDraft, RepairRequest } from '../types/repair';
import { buildRepairRequest } from '../utils/repair';
import type { ResidenceStatus } from '../types/residence';

interface RepairContextValue { requests: readonly RepairRequest[]; createRequest: (draft: RepairDraft) => RepairRequest | null; resetForAccount: (residenceStatus: ResidenceStatus) => void }
const RepairContext = createContext<RepairContextValue | null>(null);

export function RepairProvider({ children }: PropsWithChildren) {
  const { session } = useResidence();
  const [requests, setRequests] = useState<readonly RepairRequest[]>(initialRepairRequests);
  const requestsRef = useRef(requests);
  const resetForAccount = useCallback((residenceStatus: ResidenceStatus) => {
    const next = residenceStatus === 'active' ? initialRepairRequests.map((item) => ({ ...item, imageUris: [...item.imageUris] })) : [];
    requestsRef.current = next;
    setRequests(next);
  }, []);
  const createRequest = useCallback((draft: RepairDraft): RepairRequest | null => {
    const request = buildRepairRequest(requestsRef.current, draft, session, mockRepairDate, mockRepairTime);
    if (!request) return null;
    const next = [request, ...requestsRef.current];
    requestsRef.current = next;
    setRequests(next);
    return request;
  }, [session]);
  return <RepairContext.Provider value={{ requests, createRequest, resetForAccount }}>{children}</RepairContext.Provider>;
}

export function useRepairs() { const value = useContext(RepairContext); if (!value) throw new Error('RepairProvider is missing'); return value; }
