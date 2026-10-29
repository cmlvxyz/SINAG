export type IncidentCategory = 
  | 'MEDICAL' 
  | 'FIRE' 
  | 'FLOOD' 
  | 'POLICE' 
  | 'ACCIDENT' 
  | 'RESCUE';

export type IncidentStatus = 
  | 'DISPATCHED' 
  | 'EN_ROUTE' 
  | 'ON_SCENE' 
  | 'RESOLVED';

export interface LocationData {
  address: string;
  barangay: string;
  city: string;
  lat: number;
  lng: number;
  accuracyRadiusMeters: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
}

export interface ResponderUnit {
  id: string;
  name: string;
  role: string;
  unitCode: string;
  category: IncidentCategory;
  phone: string;
  avatar: string;
  status: 'ON_DUTY' | 'RESPONDING' | 'STANDBY';
  distanceKm: number;
  etaMinutes: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  resolvedCount: number;
}

export interface TimelineEvent {
  timeOffsetMs: number;
  label: string;
  detail: string;
  timestamp: string;
  completed: boolean;
}

export interface IncidentAlert {
  id: string;
  incidentCode: string;
  citizenName: string;
  citizenPhone: string;
  citizenAvatar?: string;
  category: IncidentCategory;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  status: IncidentStatus;
  date: string;
  time: string;
  timestampMs: number;
  responseTimeMs: number;
  location: LocationData;
  assignedResponder?: ResponderUnit;
  timeline: TimelineEvent[];
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'SOS_DISPATCH' | 'RESPONDER_UPDATE' | 'CALAMITY_BROADCAST' | 'SYSTEM';
  read: boolean;
  incidentId?: string;
}

export interface GpsTelemetry {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  isWatching: boolean;
  permission: 'prompt' | 'granted' | 'denied';
  lastFixTime: string;
}
