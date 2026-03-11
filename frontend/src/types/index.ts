export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  user_id: string;
  source_type: 'text' | 'voice';
  original_text: string | null;
  transcript_text: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  is_bullying: boolean | null;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'none' | null;
  category: string | null;
  confidence_score: number | null;
  explanation: string | null;
  suggested_action: string | null;
  model_version: string | null;
  processing_ms: number | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisListResponse {
  items: AnalysisResult[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Incident {
  id: string;
  analysis_id: string;
  user_id: string;
  risk_score: number;
  escalation_level: 'none' | 'warning' | 'admin_review' | 'urgent_review';
  review_status: 'open' | 'in_review' | 'resolved' | 'dismissed';
  assigned_admin_id: string | null;
  action_taken: 'none' | 'warned_user' | 'escalated' | 'monitored' | 'false_positive';
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  user_email: string | null;
  source_type: string | null;
  severity: string | null;
  category: string | null;
  confidence_score: number | null;
  original_text: string | null;
  transcript_text: string | null;
  explanation: string | null;
  suggested_action: string | null;
}

export interface IncidentListResponse {
  items: Incident[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AnalyticsSummary {
  total_incidents: number;
  open_incidents: number;
  resolved_incidents: number;
  critical_incidents: number;
  repeat_users_count: number;
}

export interface SeverityDistribution {
  severity: string;
  count: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}
