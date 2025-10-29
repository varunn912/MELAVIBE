export enum IssueType {
  MedicalEmergency = 'MedicalEmergency',
  SafetyConcern = 'SafetyConcern',
  Harassment = 'Harassment',
  TheftProperty = 'TheftProperty',
  LostPerson = 'LostPerson',
  SanitationIssue = 'SanitationIssue',
  FacilityMaintenance = 'FacilityMaintenance',
  FireHazard = 'FireHazard',
  InfoQuestion = 'InfoQuestion',
  Other = 'Other',
}

export enum ReportStatus {
  New = 'NEW',
  InProgress = 'IN_PROGRESS',
  Resolved = 'RESOLVED',
}

export enum LfStatus {
  Lost = 'LOST',
  Found = 'FOUND',
}

export interface OrganizerNote {
  timestamp: number;
  message: string;
}

export interface Report {
  id: string;
  type: IssueType;
  description: string;
  timestamp: number;
  status: ReportStatus;
  userId: string;
  isAnonymous?: boolean;
  imageDataUrl?: string;
  audioDataUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  aiPriority?: 'Low' | 'Medium' | 'High';
  aiSummary?: string;
  aiSuggestedTeam?: 'Medical' | 'Security' | 'Sanitation' | 'Facilities' | 'General';
  source?: 'app' | 'sms';
  organizerNotes?: OrganizerNote[];
  resolvedTimestamp?: number;
}

export interface Announcement {
  id: number;
  message: string;
}

export interface LostAndFoundItem {
  id: string;
  status: LfStatus;
  category: string;
  description: string;
  imageDataUrl?: string;
  timestamp: number;
  userId: string;
  isResolved: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  audioDataUrl?: string;
}

export interface SurveySubmission {
  rating: number;
  feedback: string;
  timestamp: number;
}