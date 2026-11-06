import { useResidence } from '../context/ResidenceContext';
import { FindRoomScreen } from './FindRoomScreen';
import { MyRoomScreen } from './MyRoomScreen';
import { RequestStatusScreen } from './RequestStatusScreen';

export function ResidenceLandingScreen() { const { session } = useResidence(); if (session.status === 'active') return <MyRoomScreen />; if (session.status === 'none') return <FindRoomScreen />; return <RequestStatusScreen />; }
