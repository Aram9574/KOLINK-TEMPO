

export interface User {
  name: string;
  avatar: string;
  email?: string;
  headline?: string;
}

export type NavItem = 'Panel' | 'Generador de Posts' | 'Mis posts' | 'Ajustes' | 'Estadísticas' | 'Centro de ayuda' | 'Autopilot' | 'Base de Conocimiento';

export type SettingsTab = 'profile' | 'general' | 'notifications' | 'billing' | 'integrations' | 'security' | 'personalization';

export type TaskStatus = 'todo' | 'inprogress' | 'completed';

export type PlanName = 'Free' | 'Basic' | 'Standard' | 'Premium';

export interface Post {
  id: string;
  content: string;
  scheduledAt: Date | null;
  status: 'draft' | 'scheduled';
  // FIX: Added optional image property to match the data structure used in the app.
  image?: string | null;
  views?: number;
  likes?: number;
  comments?: number;
  taskStatus?: TaskStatus;
}

export interface AdvancedSettings {
  length: 'short' | 'medium' | 'long';
  emojiUsage: 'none' | 'subtle' | 'moderate';
  creativity: number;
  cta: 'question' | 'debate' | 'link' | 'none';
  hashtags: 'broad' | 'niche' | 'none';
  audience: string;
}

export type TierName = 'Novato Creador' | 'Estratega de Contenido' | 'Influencer Digital' | 'Visionario de LinkedIn';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
}

export interface InspirationPost {
  id: string;
  content: string;
}

export interface UserIdentity {
  name: string;
  occupation: string;
  bio: string;
  customInstructions: string;
}

export interface GeneratedPostHistoryItem {
  id: string;
  content: string;
  date: Date;
}

export interface Notification {
  id: number;
  type: 'comment' | 'like' | 'system' | string;
  read: boolean;
  text: string;
  time: string;
}
