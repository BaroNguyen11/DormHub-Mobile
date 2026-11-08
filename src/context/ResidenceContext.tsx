import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { StudentRoomAssignment } from '../api/roomAssignments';
import type { DormApplicationDto } from '../api/dormApplications';
import { cancelStudentDormApplication, changeStudentDormApplicationRoom, createStudentDormApplication, getStudentDormApplication, getStudentDormApplications } from '../api/dormApplications';
import { pendingApplication, rejectedApplication } from '../mocks/residence';
import { mockSession } from '../mocks/session';
import { devPreviewEnabled } from '../config/devPreview';
import type { ResidenceSession, ResidenceStatus, RoomApplication } from '../types/residence';

interface ResidenceContextValue {
  session: ResidenceSession;
  application: RoomApplication | null;
  setStatus: (status: ResidenceStatus, roomId?: string | null) => void;
  setBackendRoom: (assignment: StudentRoomAssignment | null) => void;
  setBackendApplication: (application: DormApplicationDto | null) => void;
  backendApplications: readonly DormApplicationDto[];
  refreshBackendApplications: () => Promise<readonly DormApplicationDto[]>;
  createBackendApplication: (roomId: number, note?: string) => Promise<DormApplicationDto>;
  changeBackendApplicationRoom: (id: number, roomId: number) => Promise<DormApplicationDto>;
  cancelBackendApplication: (id: number) => Promise<void>;
  clearBackendApplications: () => void;
  submitApplication: (roomId: string, startDate: string, note: string) => void;
  cancelApplication: () => void;
}

const ResidenceContext = createContext<ResidenceContextValue | null>(null);
const initialStatus = devPreviewEnabled && mockSession.kind === 'student' ? mockSession.residenceStatus : 'none';

export function ResidenceProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<ResidenceSession>({
    status: initialStatus,
    roomId: initialStatus === 'active' ? 'A203' : initialStatus === 'pending' ? pendingApplication.roomId : initialStatus === 'rejected' ? rejectedApplication.roomId : null,
    backendRoomId: null,
  });
  const [application, setApplication] = useState<RoomApplication | null>(initialStatus === 'pending' ? pendingApplication : initialStatus === 'rejected' ? rejectedApplication : null);
  const [backendApplications, setBackendApplications] = useState<readonly DormApplicationDto[]>([]);

  const setStatus = useCallback((status: ResidenceStatus, roomId: string | null = null) => {
    setSession({
      status,
      roomId: status === 'active' ? (roomId ?? 'A203') : status === 'pending' ? pendingApplication.roomId : status === 'rejected' ? rejectedApplication.roomId : null,
      backendRoomId: null,
    });
    setApplication(status === 'pending' ? pendingApplication : status === 'rejected' ? rejectedApplication : null);
  }, []);

  const setBackendRoom = useCallback((assignment: StudentRoomAssignment | null) => {
    setSession(assignment === null ? { status: 'none', roomId: null, backendRoomId: null } : {
      status: 'active',
      roomId: String(assignment.roomId),
      backendRoomId: assignment.roomId,
      backendAssignmentStatus: assignment.assignmentStatus,
      backendContractId: assignment.contractId,
      backendAssignedAt: assignment.assignedAt,
      backendCheckInAt: assignment.checkInAt,
    });
    setApplication(null);
  }, []);

  const setBackendApplication = useCallback((application: DormApplicationDto | null) => {
    const status: ResidenceStatus = application?.status === 'PENDING' ? 'pending' : application?.status === 'APPROVED' ? 'approved' : application?.status === 'REJECTED' ? 'rejected' : 'none';
    setSession({
      status,
      roomId: application && application.status !== 'CANCELLED' ? String(application.requestedRoomId) : null,
      backendRoomId: null,
      backendApplication: application,
    });
    setApplication(null);
  }, []);

  const refreshBackendApplications = useCallback(async () => {
    const result = await getStudentDormApplications(0, 20);
    setBackendApplications(result.content);
    const current = result.content.find((item) => item.status === 'PENDING' || item.status === 'APPROVED')
      ?? result.content.find((item) => item.status === 'REJECTED')
      ?? null;
    setBackendApplication(current);
    return result.content;
  }, [setBackendApplication]);

  const createBackendApplication = useCallback(async (roomId: number, note?: string) => {
    const created = await createStudentDormApplication(roomId, note);
    setBackendApplications((previous) => [created, ...previous.filter((item) => item.id !== created.id)]);
    setBackendApplication(created);
    return created;
  }, [setBackendApplication]);

  const changeBackendApplicationRoom = useCallback(async (id: number, roomId: number) => {
    await changeStudentDormApplicationRoom(id, roomId);
    const updated = await getStudentDormApplication(id);
    setBackendApplications((previous) => previous.map((item) => item.id === id ? updated : item));
    setBackendApplication(updated);
    return updated;
  }, [setBackendApplication]);

  const cancelBackendApplication = useCallback(async (id: number) => {
    await cancelStudentDormApplication(id);
    const updated = await getStudentDormApplication(id);
    setBackendApplications((previous) => previous.map((item) => item.id === id ? updated : item));
    setBackendApplication(updated);
  }, [setBackendApplication]);

  const clearBackendApplications = useCallback(() => setBackendApplications([]), []);

  const submitApplication = useCallback((roomId: string, startDate: string, note: string) => {
    setSession({ status: 'pending', roomId, backendRoomId: null });
    setApplication({ ...pendingApplication, roomId, startDate, note });
  }, []);

  const cancelApplication = useCallback(() => {
    setSession({ status: 'none', roomId: null, backendRoomId: null });
    setApplication(null);
  }, []);

  const value = useMemo<ResidenceContextValue>(() => ({ session, application, setStatus, setBackendRoom, setBackendApplication, backendApplications, refreshBackendApplications, createBackendApplication, changeBackendApplicationRoom, cancelBackendApplication, clearBackendApplications, submitApplication, cancelApplication }), [session, application, setStatus, setBackendRoom, setBackendApplication, backendApplications, refreshBackendApplications, createBackendApplication, changeBackendApplicationRoom, cancelBackendApplication, clearBackendApplications, submitApplication, cancelApplication]);
  return <ResidenceContext.Provider value={value}>{children}</ResidenceContext.Provider>;
}

export function useResidence() {
  const value = useContext(ResidenceContext);
  if (!value) throw new Error('ResidenceProvider is missing');
  return value;
}
