import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { StudentRoomAssignment } from '../api/roomAssignments';
import type { DormApplicationDto } from '../api/dormApplications';
import { cancelStudentDormApplication, changeStudentDormApplicationRoom, createStudentDormApplication, getStudentDormApplications } from '../api/dormApplications';
import type { ResidenceSession, ResidenceStatus } from '../types/residence';

interface ResidenceContextValue {
  session: ResidenceSession;
  setStatus: (status: ResidenceStatus, roomId?: string | null) => void;
  setBackendRoom: (assignment: StudentRoomAssignment | null) => void;
  setBackendApplication: (application: DormApplicationDto | null) => void;
  backendApplications: readonly DormApplicationDto[];
  refreshBackendApplications: () => Promise<readonly DormApplicationDto[]>;
  createBackendApplication: (roomId: number, note?: string) => Promise<DormApplicationDto>;
  changeBackendApplicationRoom: (id: number, roomId: number) => Promise<DormApplicationDto>;
  cancelBackendApplication: (id: number) => Promise<void>;
  clearBackendApplications: () => void;
}

const ResidenceContext = createContext<ResidenceContextValue | null>(null);
export function ResidenceProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<ResidenceSession>({
    status: 'none',
    roomId: null,
    backendRoomId: null,
  });
  const [backendApplications, setBackendApplications] = useState<readonly DormApplicationDto[]>([]);

  const setStatus = useCallback((status: ResidenceStatus, roomId: string | null = null) => {
    setSession({
      status,
      roomId,
      backendRoomId: null,
    });
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
  }, []);

  const setBackendApplication = useCallback((application: DormApplicationDto | null) => {
    const status: ResidenceStatus = application?.status === 'PENDING' ? 'pending' : application?.status === 'APPROVED' ? 'approved' : application?.status === 'REJECTED' ? 'rejected' : 'none';
    setSession({
      status,
      roomId: application && application.status !== 'CANCELLED' ? String(application.requestedRoomId) : null,
      backendRoomId: null,
      backendApplication: application,
    });
  }, []);

  const refreshBackendApplications = useCallback(async () => {
    const firstPage = await getStudentDormApplications(0, 100);
    const applications = [...firstPage.content];
    for (let page = 1; page < firstPage.totalPages; page += 1) {
      const nextPage = await getStudentDormApplications(page, 100);
      applications.push(...nextPage.content);
    }
    setBackendApplications(applications);
    const current = applications.find((item) => item.status === 'PENDING' || item.status === 'APPROVED')
      ?? applications.find((item) => item.status === 'REJECTED')
      ?? null;
    setBackendApplication(current);
    return applications;
  }, [setBackendApplication]);

  const createBackendApplication = useCallback(async (roomId: number, note?: string) => {
    const created = await createStudentDormApplication(roomId, note);
    setBackendApplications((previous) => [created, ...previous.filter((item) => item.id !== created.id)]);
    setBackendApplication(created);
    return created;
  }, [setBackendApplication]);

  const changeBackendApplicationRoom = useCallback(async (id: number, roomId: number) => {
    const updated = await changeStudentDormApplicationRoom(id, roomId);
    setBackendApplications((previous) => previous.map((item) => item.id === id ? updated : item));
    setBackendApplication(updated);
    return updated;
  }, [setBackendApplication]);

  const cancelBackendApplication = useCallback(async (id: number) => {
    const updated = await cancelStudentDormApplication(id);
    setBackendApplications((previous) => previous.map((item) => item.id === id ? updated : item));
    setBackendApplication(updated);
  }, [setBackendApplication]);

  const clearBackendApplications = useCallback(() => setBackendApplications([]), []);

  const value = useMemo<ResidenceContextValue>(() => ({ session, setStatus, setBackendRoom, setBackendApplication, backendApplications, refreshBackendApplications, createBackendApplication, changeBackendApplicationRoom, cancelBackendApplication, clearBackendApplications }), [session, setStatus, setBackendRoom, setBackendApplication, backendApplications, refreshBackendApplications, createBackendApplication, changeBackendApplicationRoom, cancelBackendApplication, clearBackendApplications]);
  return <ResidenceContext.Provider value={value}>{children}</ResidenceContext.Provider>;
}

export function useResidence() {
  const value = useContext(ResidenceContext);
  if (!value) throw new Error('ResidenceProvider is missing');
  return value;
}
