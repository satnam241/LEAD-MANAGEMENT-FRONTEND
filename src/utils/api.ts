// ==========================================================
//  PRODUCTION GRADE API SERVICE — LEAD MANAGEMENT SYSTEM
// ==========================================================

// -------------------------
// Types
// -------------------------
export interface Lead {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  rawData?: any;
  extraFields?: Record<string, any>;
  status: "new" | "contacted" | "converted";
  createdAt: string;
  followUp?: {
    date?: string | null;
    recurrence?: string | null;
    message?: string | null;
    whatsappOptIn?: boolean;
    active?: boolean;
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface DailyStats {
  totalLeads: number;
  new: number;
  contacted: number;
  converted: number;
}

export interface AdminProfile {
  _id: string;
  email: string;
  name?: string;
}

// -------------------------
// BASE URL (Render Safe)
// -------------------------

// ❗ ENSURES no double-slash issues AND env is always used
export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// ======================================================================
// 🛡️ UNIVERSAL FETCH WRAPPER — Auto handles Unauthorized, JSON errors
// ======================================================================
async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers: any = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errMsg = data?.error || data?.message || "Request failed";
    throw new Error(errMsg);
  }

  return data;
}

// ======================================================================
// AUTH
// ======================================================================

export const loginAdmin = async (credentials: AuthCredentials) =>
  apiFetch(`${API_BASE}/admin/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const signupAdmin = async (credentials: AuthCredentials) =>
  apiFetch(`${API_BASE}/admin/signup`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const forgotPassword = async (email: string) =>
  apiFetch(`${API_BASE}/admin/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = async (token: string, newPassword: string) =>
  apiFetch(`${API_BASE}/admin/reset-password`, {
    method: "POST",
    body: JSON.stringify({ token, password: newPassword }),
  });

// ======================================================================
// LEADS CRUD
// ======================================================================

export const fetchLeads = async (
  token: string,
  page = 1,
  limit = 10,
  options: Record<string, any> = {}
) => {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });

  Object.entries(options).forEach(([k, v]) => {
    if (v) query.append(k, v);
  });

  return apiFetch(`${API_BASE}/leads/leads?${query.toString()}`);
};

export const updateLead = async (leadId: string, updates: Partial<Lead>) =>
  apiFetch(`${API_BASE}/leads/leads/${leadId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

export const deleteLead = async (leadId: string) =>
  apiFetch(`${API_BASE}/admin/leads/${leadId}`, {
    method: "DELETE",
  });

export const createLeadPublic = async (leadData: any) =>
  apiFetch(`${API_BASE}/leads/leads`, {
    method: "POST",
    body: JSON.stringify(leadData),
  });

// ======================================================================
// STATS
// ======================================================================

export const fetchDailyStats = async () =>
  apiFetch(`${API_BASE}/admin/stats/daily`);

// ======================================================================
// EXPORT CSV
// ======================================================================

export const exportLeadsToCSV = (leads: Lead[]): string => {
  const baseHeaders = ["Full Name", "Email", "Phone", "Source", "Status", "Created At"];
  const extraKeys = Array.from(new Set(leads.flatMap(l => Object.keys(l.extraFields || {}))));
  const headers = [...baseHeaders, ...extraKeys];

  const rows = leads.map(l => {
    const extras = extraKeys.map(k => l.extraFields?.[k] || "");
    return [
      l.fullName || "",
      l.email || "",
      l.phone || "",
      l.source,
      l.status,
      new Date(l.createdAt).toISOString(),
      ...extras
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
};

// ======================================================================
// SEND MESSAGE (EMAIL / WHATSAPP / BOTH)
// ======================================================================

export const sendMessage = async (
  leadId: string,
  type: "email" | "whatsapp" | "both",
  message: string
) =>
  apiFetch(`${API_BASE}/messages/${leadId}/send-message`, {
    method: "POST",
    body: JSON.stringify({ leadId, messageType: type, message }),
  });

// ======================================================================
// ADMIN PROFILE
// ======================================================================

export const getAdminProfile = async () =>
  apiFetch(`${API_BASE}/admin/me`);

// ======================================================================
// ACTIVITY
// ======================================================================

export const fetchActivities = async (userId: string) =>
  apiFetch(`${API_BASE}/activity/${userId}`);

export const addActivity = async (data: any) =>
  apiFetch(`${API_BASE}/activity`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateActivity = async (id: string, text: string) =>
  apiFetch(`${API_BASE}/activity/${id}`, {
    method: "PUT",
    body: JSON.stringify({ text }),
  });

export const deleteActivity = async (id: string) =>
  apiFetch(`${API_BASE}/activity/${id}`, {
    method: "DELETE",
  });

// ======================================================================
// IMPORT LEADS (UPLOAD)
// ======================================================================
export const importLeadsFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/admin/import-leads`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Upload failed");
  }

  return data;
};
