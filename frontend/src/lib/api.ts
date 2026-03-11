import { db } from './demo-db';
import { User, AnalysisResult, Incident } from '@/types';

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate Axios response shape
const mockResponse = <T>(data: T) => ({ data });
const mockError = (message: string, status = 400) => {
  const err = new Error(message) as any;
  err.response = { status, data: { detail: message } };
  return Promise.reject(err);
};

// Generic API Client replacement for Hackathon MVP
const api = {
  interceptors: { response: { use: () => {} } },
  post: () => Promise.resolve(),
  get: () => Promise.resolve(),
  put: () => Promise.resolve(),
  patch: () => Promise.resolve(),
};

export default api;

// Auth API
export const authApi = {
  signup: async (data: { full_name: string; email: string; password: string }) => {
    await delay(800);
    const existing = db.getUserByEmail(data.email);
    if (existing) return mockError('Email already registered');
    
    const newUser: User = {
      id: `usr_${Date.now()}`,
      full_name: data.full_name,
      email: data.email,
      role: 'user',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.addUser(newUser);
    return mockResponse(newUser);
  },
  login: async (data: { email: string; password: string }) => {
    await delay(600);
    const user = db.getUserByEmail(data.email);
    if (!user) return mockError('Invalid credentials', 401);
    
    // Accept any password for MVP demo purposes
    const token = `mock_token_${Date.now()}`;
    db.setAuth(user, token);
    return mockResponse({ access_token: token, token_type: 'bearer' });
  },
  logout: async () => {
    await delay(300);
    db.clearAuth();
    return mockResponse({ detail: 'Logged out' });
  },
  me: async () => {
    await delay(200);
    const auth = db.getAuth();
    if (!auth || !auth.user) return mockError('Not authenticated', 401);
    return mockResponse(auth.user);
  },
  refresh: async () => {
    await delay(200);
    return mockResponse({ access_token: 'refreshed_mock_token' });
  },
  updatePassword: async (data: { current_password: string; new_password: string }) => {
    await delay(800);
    return mockResponse({ detail: 'Password updated' });
  },
};

// Expanded mock NLP logic
function detectMockBullying(text: string) {
  const lower = text.toLowerCase();
  // Severe insults
  if (lower.includes('hate') || lower.includes('worthless') || lower.includes('stupid')) {
    return { isBullying: true, severity: 'high', category: 'insult', confidence: 0.92, score: 85 };
  }
  // Threats
  if (lower.includes('kill') || lower.includes('die') || lower.includes('hurt you') || lower.includes('beat you')) {
    return { isBullying: true, severity: 'critical', category: 'threat', confidence: 0.95, score: 95 };
  }
  // Appearance-based bullying
  if (lower.includes('ugly') || lower.includes('fat') || lower.includes('pathetic') || lower.includes('disgusting')) {
    return { isBullying: true, severity: 'medium', category: 'harassment', confidence: 0.88, score: 65 };
  }
  // Slurs and name-calling
  if (lower.includes('idiot') || lower.includes('dumb') || lower.includes('retard') || lower.includes('moron')) {
    return { isBullying: true, severity: 'medium', category: 'insult', confidence: 0.86, score: 60 };
  }
  // Exclusion/isolation
  if (lower.includes('nobody likes') || lower.includes('no friends') || lower.includes('no one cares') || lower.includes('everyone hates')) {
    return { isBullying: true, severity: 'medium', category: 'exclusion', confidence: 0.82, score: 55 };
  }
  // Intimidation
  if (lower.includes('watch out') || lower.includes('gonna get you') || lower.includes('you\'ll regret') || lower.includes('you\'re dead')) {
    return { isBullying: true, severity: 'high', category: 'intimidation', confidence: 0.90, score: 80 };
  }
  // Mild harassment
  if (lower.includes('shut up') || lower.includes('loser') || lower.includes('go away') || lower.includes('freak')) {
    return { isBullying: true, severity: 'low', category: 'harassment', confidence: 0.78, score: 40 };
  }
  return { isBullying: false, severity: 'none', category: 'none', confidence: 0.98, score: 5 };
}

// Analysis API
export const analysisApi = {
  analyzeText: async (text: string) => {
    await delay(1200);
    const auth = db.getAuth();
    const userId = auth?.user?.id || 'anonymous';
    const nlp = detectMockBullying(text);
    
    const analysisId = `ana_${Date.now()}`;
    const result: AnalysisResult = {
      id: analysisId,
      user_id: userId,
      source_type: 'text',
      original_text: text,
      status: 'completed',
      is_bullying: nlp.isBullying,
      severity: nlp.severity as any,
      category: nlp.category as any,
      confidence_score: nlp.confidence,
      explanation: nlp.isBullying ? 'Harmful language detected based on keyword patterns.' : 'No harmful patterns detected.',
      suggested_action: nlp.isBullying ? 'Review user content' : 'None required',
      created_at: new Date().toISOString()
    };
    db.addAnalysis(result);
    
    // Auto-escalate to incident if bullying detected
    if (nlp.isBullying) {
      const inc: Incident = {
        id: `inc_${Date.now()}`,
        analysis_id: analysisId,
        user_id: userId,
        user_name: auth?.user?.full_name || 'Demo User',
        user_email: auth?.user?.email || 'demo@demo.com',
        source_type: 'text',
        original_text: text,
        risk_score: nlp.score,
        escalation_level: nlp.score > 80 ? 'admin_review' : 'warning',
        review_status: 'open',
        action_taken: 'none',
        severity: nlp.severity as any,
        category: nlp.category as any,
        confidence_score: nlp.confidence,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.addIncident(inc);
    }
    
    return mockResponse(result);
  },
  analyzeVoice: async (file: File) => {
    await delay(2000); // simulate upload & transcribe
    const auth = db.getAuth();
    const userId = auth?.user?.id || 'anonymous';
    
    const analysisId = `ana_${Date.now()}`;
    const result: AnalysisResult = {
      id: analysisId,
      user_id: userId,
      source_type: 'voice',
      transcript_text: '[Simulated Transcript] Voice analysis currently runs deterministic safe mockup.',
      status: 'completed',
      is_bullying: false,
      severity: 'none',
      category: 'none',
      confidence_score: 0.95,
      explanation: 'No harmful patterns detected in transcribed audio.',
      suggested_action: 'None required',
      created_at: new Date().toISOString()
    };
    db.addAnalysis(result);
    return mockResponse(result);
  },
  getAnalysis: async (id: string) => {
    await delay(300);
    const item = db.getAnalyses().find(a => a.id === id);
    if (!item) return mockError('Analysis not found', 404);
    return mockResponse(item);
  },
  listAnalyses: async (params?: Record<string, string | number>) => {
    await delay(400);
    const auth = db.getAuth();
    let items = db.getAnalyses().filter(a => a.user_id === auth?.user?.id);
    
    if (params?.source_type) items = items.filter(i => i.source_type === params.source_type);
    if (params?.severity) items = items.filter(i => i.severity === params.severity);
    if (params?.analysis_status) items = items.filter(i => i.status === params.analysis_status);
    
    return mockResponse({ items, total: items.length, page: 1, size: 20, pages: 1 });
  },
};

// Incident API (admin)
export const incidentApi = {
  list: async (params?: Record<string, string | number>) => {
    await delay(500);
    let items = db.getIncidents();
    
    if (params?.review_status) items = items.filter(i => i.review_status === params.review_status);
    if (params?.severity) items = items.filter(i => i.severity === params.severity);
    if (params?.category) items = items.filter(i => i.category === params.category);
    if (params?.search) {
      const query = String(params.search).toLowerCase();
      items = items.filter(i => 
        i.user_name?.toLowerCase().includes(query) || 
        i.user_email?.toLowerCase().includes(query) ||
        i.original_text?.toLowerCase().includes(query)
      );
    }
    
    if (params?.sort === 'highest_severity') {
      const sevMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
      items.sort((a, b) => (sevMap[b.severity!] || 0) - (sevMap[a.severity!] || 0));
    } else {
      // sort newest default
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    return mockResponse({ items, total: items.length, page: 1, size: 20, pages: 1 });
  },
  get: async (id: string) => {
    await delay(300);
    const item = db.getIncidents().find(i => i.id === id);
    if (!item) return mockError('Incident not found', 404);
    return mockResponse(item);
  },
  update: async (id: string, data: Record<string, unknown>) => {
    await delay(600);
    db.updateIncident(id, data);
    const updated = db.getIncidents().find(i => i.id === id);
    return mockResponse(updated);
  },
};

// Analytics API (admin)
export const analyticsApi = {
  summary: async () => {
    await delay(400);
    const incidents = db.getIncidents();
    return mockResponse({
      total_incidents: incidents.length,
      open_incidents: incidents.filter(i => i.review_status === 'open').length,
      resolved_incidents: incidents.filter(i => i.review_status === 'resolved').length,
      critical_incidents: incidents.filter(i => i.severity === 'critical').length,
      repeat_users_count: 0 // Mock stat
    });
  },
  severityDistribution: async () => {
    await delay(400);
    const incidents = db.getIncidents();
    const counts: Record<string, number> = { none: 0, low: 0, medium: 0, high: 0, critical: 0 };
    incidents.forEach(i => { if (i.severity) counts[i.severity]++; });
    const data = Object.entries(counts).map(([severity, count]) => ({ severity, count }));
    return mockResponse(data);
  },
  categoryDistribution: async () => {
    await delay(400);
    const incidents = db.getIncidents();
    const counts: Record<string, number> = {};
    incidents.forEach(i => {
      if (i.category && i.category !== 'none') {
        counts[i.category] = (counts[i.category] || 0) + 1;
      }
    });
    const data = Object.entries(counts).map(([category, count]) => ({ category, count }));
    return mockResponse(data);
  },
  trends: async (days?: number) => {
    await delay(400);
    // Return dummy trend data for the chart
    const data = [];
    const now = new Date();
    for(let i=14; i>=0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5)
      });
    }
    return mockResponse(data);
  },
};
