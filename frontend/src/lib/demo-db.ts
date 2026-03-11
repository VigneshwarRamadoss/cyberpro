import { getStorage, setStorage, removeStorage, clearStorage } from './storage';
import { User, AnalysisResult, Incident } from '@/types';

// Storage Keys
const KEYS = {
  AUTH: 'shieldspeak_auth',
  USERS: 'shieldspeak_users',
  ANALYSES: 'shieldspeak_analyses',
  INCIDENTS: 'shieldspeak_incidents',
  SEEDED: 'shieldspeak_seeded',
};

// Initial Demo Data
const DEMO_USERS: User[] = [
  { id: 'usr_admin123', email: 'admin@shieldspeak.com', full_name: 'Admin User', role: 'admin', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr_alex123', email: 'alex@demo.com', full_name: 'Alex Johnson', role: 'user', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr_jordan123', email: 'jordan@demo.com', full_name: 'Jordan Smith', role: 'user', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const DEMO_ANALYSES: AnalysisResult[] = [
  {
    id: 'ana_1', user_id: 'usr_alex123', source_type: 'text', original_text: 'I hate you, you are worthless and everyone knows it.',
    status: 'completed', is_bullying: true, severity: 'high', category: 'insult', confidence_score: 0.94,
    explanation: 'Contains direct, severe insults and degrading language targeted at an individual.',
    suggested_action: 'Issue a formal warning and monitor the account.', created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'ana_2', user_id: 'usr_jordan123', source_type: 'voice', transcript_text: 'Are we still meeting at 5pm? Let me know.',
    status: 'completed', is_bullying: false, severity: 'none', category: 'none', confidence_score: 0.99,
    explanation: 'Standard logistical conversation. No harmful patterns detected.',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'ana_3', user_id: 'usr_alex123', source_type: 'text', original_text: 'You are so ugly, nobody wants to look at you.',
    status: 'completed', is_bullying: true, severity: 'medium', category: 'harassment', confidence_score: 0.88,
    explanation: 'Contains appearance-based bullying language targeting an individual.',
    suggested_action: 'Review content and warn the user.', created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'ana_4', user_id: 'usr_jordan123', source_type: 'text', original_text: 'Great job on the presentation today! Really impressive work.',
    status: 'completed', is_bullying: false, severity: 'none', category: 'none', confidence_score: 0.97,
    explanation: 'Positive and encouraging language. No harmful patterns detected.',
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];

const DEMO_INCIDENTS: Incident[] = [
  {
    id: 'inc_1', analysis_id: 'ana_1', user_id: 'usr_alex123', user_name: 'Alex Johnson', user_email: 'alex@demo.com',
    source_type: 'text', original_text: 'I hate you, you are worthless and everyone knows it.', risk_score: 85.5,
    escalation_level: 'admin_review', review_status: 'open', action_taken: 'none', admin_notes: '',
    severity: 'high', category: 'insult', confidence_score: 0.94,
    created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'inc_2', analysis_id: 'ana_3', user_id: 'usr_alex123', user_name: 'Alex Johnson', user_email: 'alex@demo.com',
    source_type: 'text', original_text: 'You are so ugly, nobody wants to look at you.', risk_score: 65,
    escalation_level: 'warning', review_status: 'open', action_taken: 'none', admin_notes: '',
    severity: 'medium', category: 'harassment', confidence_score: 0.88,
    created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date(Date.now() - 7200000).toISOString()
  }
];

// DB Operations
export const db = {
  isSeeded: () => getStorage(KEYS.SEEDED, false),
  
  seed: () => {
    if (getStorage(KEYS.SEEDED, false)) return;
    setStorage(KEYS.USERS, DEMO_USERS);
    setStorage(KEYS.ANALYSES, DEMO_ANALYSES);
    setStorage(KEYS.INCIDENTS, DEMO_INCIDENTS);
    setStorage(KEYS.SEEDED, true);
  },

  reset: () => {
    clearStorage();
    // Re-seed immediately so the next page has data
    setStorage(KEYS.USERS, DEMO_USERS);
    setStorage(KEYS.ANALYSES, DEMO_ANALYSES);
    setStorage(KEYS.INCIDENTS, DEMO_INCIDENTS);
    setStorage(KEYS.SEEDED, true);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Auth Operations
  setAuth: (user: User, token: string) => setStorage(KEYS.AUTH, { user, token }),
  getAuth: () => getStorage<{ user: User | null; token: string | null }>(KEYS.AUTH, { user: null, token: null }),
  clearAuth: () => removeStorage(KEYS.AUTH),

  // Users
  getUsers: () => getStorage<User[]>(KEYS.USERS, []),
  addUser: (user: User) => {
    const users = db.getUsers();
    setStorage(KEYS.USERS, [...users, user]);
  },
  getUserByEmail: (email: string) => db.getUsers().find(u => u.email === email),

  // Analyses
  getAnalyses: () => getStorage<AnalysisResult[]>(KEYS.ANALYSES, []),
  addAnalysis: (analysis: AnalysisResult) => {
    const list = db.getAnalyses();
    setStorage(KEYS.ANALYSES, [analysis, ...list]);
  },

  // Incidents
  getIncidents: () => getStorage<Incident[]>(KEYS.INCIDENTS, []),
  addIncident: (incident: Incident) => {
    const list = db.getIncidents();
    setStorage(KEYS.INCIDENTS, [incident, ...list]);
  },
  updateIncident: (id: string, updates: Partial<Incident>) => {
    const list = db.getIncidents();
    const updatedList = list.map(inc => inc.id === id ? { ...inc, ...updates, updated_at: new Date().toISOString() } : inc);
    setStorage(KEYS.INCIDENTS, updatedList);
  }
};
