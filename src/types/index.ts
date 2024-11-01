export interface Project {
  id: string;
  name: string;
  ownerId: string;
  collaborators: string[];
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  content: string;
  language: string;
  createdBy: string;
  lastEditedBy: string;
  lastEditedAt: Date;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  invitedEmail: string;
  invitedById: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  role: 'EDITOR' | 'VIEWER';
  expiresAt: Date;
}
export interface Collaboration {
  projectId: string;
  userId: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  status: 'ACTIVE' | 'INVITED' | 'PENDING'
}

export type CursorPosition = {
  line: number;
  column: number;
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
};

export type Presence = {
  userId: string;
  name: string;
  avatar: string;
  cursor: CursorPosition;
  lastSeen: number;
};