import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { getMyAssignments, getMyDormApplications } from '../api/residence';
import { listContracts, listCheckoutRequests } from '../api/student';
import type { DormApplicationDto } from '../api/residence';
import { useAuth } from './AuthContext';
import type { ResidenceSession, RoomApplication } from '../types/residence';

interface ResidenceContextValue {
  session: ResidenceSession;
  application: RoomApplication | null;
  loading: boolean;
  error: string | null;
  refreshResidence: () => Promise<void>;
}
const ResidenceContext = createContext<ResidenceContextValue | null>(null);

function appView(dto: DormApplicationDto): RoomApplication {
  const created = new Date(dto.requestDate);
  const processed = dto.processedAt ? new Date(dto.processedAt) : null;
  return {
    id: dto.id,
    roomId: String(dto.requestedRoomNumber),
    sentDate: Number.isNaN(created.getTime()) ? '' : created.toLocaleDateString('vi-VN'),
    sentTime: Number.isNaN(created.getTime()) ? '' : created.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    status: dto.status,
    note: dto.note ?? undefined,
    decisionDate: processed && !Number.isNaN(processed.getTime()) ? processed.toLocaleDateString('vi-VN') : undefined,
    decisionTime: processed && !Number.isNaN(processed.getTime()) ? processed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : undefined,
    rejectionReason: dto.reviewNote ?? undefined,
  };
}

export function ResidenceProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const [session, setSession] = useState<ResidenceSession>({ status: 'none', roomId: null });
  const [application, setApplication] = useState<RoomApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const sessionStatus = useRef(session.status);
  sessionStatus.current = session.status;
  const refreshResidence = useCallback(async () => {
    if (auth.status !== 'authenticated') {
      setSession({ status: 'none', roomId: null });
      setApplication(null);
      setError(null);
      setLoading(auth.status === 'loading');
      initialized.current = auth.status !== 'loading';
      return;
    }
    if (!initialized.current) setLoading(true);
    setError(null);
    let loadedSuccessfully = false;
    try {
      const [assignmentsResult, applicationsResult, contractsResult, checkoutResult] = await Promise.allSettled([getMyAssignments(), getMyDormApplications(), listContracts(), listCheckoutRequests()]);
      if (assignmentsResult.status === 'rejected') throw assignmentsResult.reason;
      const active = assignmentsResult.value.data.content.find((item) => ['ASSIGNED', 'CHECKED_IN'].includes(item.assignmentStatus));
      if (active) {
        const openCheckout = checkoutResult.status === 'fulfilled' ? checkoutResult.value.data.content.find((item) => ['PENDING', 'APPROVED'].includes(item.status)) : null;
        setSession({ status: openCheckout || (checkoutResult.status === 'rejected' && sessionStatus.current === 'checkoutPending') ? 'checkoutPending' : 'active', roomId: String(active.roomNumber), room: active });
        if (applicationsResult.status === 'fulfilled') {
          const currentApplication = applicationsResult.value.data.content.find((item) => ['PENDING', 'REJECTED', 'APPROVED'].includes(item.status)) ?? null;
          setApplication(currentApplication ? appView(currentApplication) : null);
        }
      } else {
        if (applicationsResult.status === 'rejected') throw applicationsResult.reason;
        const currentApplication = applicationsResult.value.data.content.find((item) => ['PENDING', 'REJECTED', 'APPROVED'].includes(item.status)) ?? null;
        const currentContract = contractsResult.status === 'fulfilled' ? contractsResult.value.data.content.find((item) => ['PENDING', 'ACTIVE', 'EXPIRED'].includes(item.status)) ?? null : null;
        setSession({
          status: currentApplication?.status === 'REJECTED' ? 'rejected' : currentApplication?.status === 'APPROVED' ? 'approved' : currentApplication ? 'pending' : currentContract ? 'approved' : 'none',
          roomId: currentApplication ? String(currentApplication.requestedRoomNumber) : currentContract?.roomNumber ?? null,
        });
        setApplication(currentApplication ? appView(currentApplication) : null);
      }
      loadedSuccessfully = true;
    } catch (cause) {
      if (!initialized.current) setError(cause instanceof Error ? cause.message : 'Không tải được thông tin lưu trú.');
    } finally {
      if (loadedSuccessfully) initialized.current = true;
      setLoading(false);
    }
  }, [auth.status, auth.status === 'authenticated' ? auth.user.userId : null]);
  useEffect(() => { void refreshResidence(); }, [refreshResidence]);
  const value = useMemo<ResidenceContextValue>(() => ({
    session, application, loading, error, refreshResidence,
  }), [session, application, loading, error, refreshResidence]);
  return <ResidenceContext.Provider value={value}>{children}</ResidenceContext.Provider>;
}

export function useResidence() { const value = useContext(ResidenceContext); if (!value) throw new Error('ResidenceProvider is missing'); return value; }
