import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { pendingApplication, rejectedApplication } from '../mocks/residence';
import { mockSession } from '../mocks/session';
import { devPreviewEnabled } from '../config/devPreview';
import type { ResidenceSession, ResidenceStatus, RoomApplication } from '../types/residence';

interface ResidenceContextValue { session: ResidenceSession; application: RoomApplication | null; setStatus: (status: ResidenceStatus, roomId?: string | null) => void; submitApplication: (roomId: string, startDate: string, note: string) => void; cancelApplication: () => void }
const ResidenceContext = createContext<ResidenceContextValue | null>(null);
const initialStatus = devPreviewEnabled && mockSession.kind === 'student' ? mockSession.residenceStatus : 'none';

export function ResidenceProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<ResidenceSession>({ status: initialStatus, roomId: initialStatus === 'active' ? 'A203' : initialStatus === 'pending' ? pendingApplication.roomId : initialStatus === 'rejected' ? rejectedApplication.roomId : null });
  const [application, setApplication] = useState<RoomApplication | null>(initialStatus === 'pending' ? pendingApplication : initialStatus === 'rejected' ? rejectedApplication : null);
  const value = useMemo<ResidenceContextValue>(() => ({
    session, application,
    setStatus: (status, roomId = null) => { setSession({ status, roomId: status === 'active' ? (roomId ?? 'A203') : status === 'pending' ? pendingApplication.roomId : status === 'rejected' ? rejectedApplication.roomId : null }); setApplication(status === 'pending' ? pendingApplication : status === 'rejected' ? rejectedApplication : null); },
    submitApplication: (roomId, startDate, note) => { setSession({ status: 'pending', roomId }); setApplication({ ...pendingApplication, roomId, startDate, note }); },
    cancelApplication: () => { setSession({ status: 'none', roomId: null }); setApplication(null); },
  }), [session, application]);
  return <ResidenceContext.Provider value={value}>{children}</ResidenceContext.Provider>;
}

export function useResidence() { const value = useContext(ResidenceContext); if (!value) throw new Error('ResidenceProvider is missing'); return value; }
