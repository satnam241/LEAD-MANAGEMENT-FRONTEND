// api.ts

// -------------------------
// Types
// -------------------------
export interface Lead {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  source: string;
  rawData?: any;
  status: "new" | "contacted" | "converted";
  createdAt: string;
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

// -------------------------
// API Base
// -------------------------
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4520/api";

// -------------------------
// Admin Authentication
// -------------------------
export const loginAdmin = async (
  credentials: AuthCredentials
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return await res.json();
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Server error" };
  }
};

export const signupAdmin = async (
  credentials: AuthCredentials
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/admin/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return await res.json();
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Server error" };
  }
};

// -------------------------
// Lead Management (Admin)
// -------------------------
export const fetchLeads = async (token: string): Promise<Lead[]> => {
  try {
    const res = await fetch(`${API_BASE}/admin/leads`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch leads");

    const data = await res.json();
    return data.leads || [];
  } catch (error) {
    console.error("Fetch leads error:", error);
    return [];
  }
};


export const updateLead = async (
  leadId: string,
  updates: Partial<Lead>,
  token: string
): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/admin/leads/${leadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch (error) {
    console.error("Update lead error:", error);
    return false;
  }
};

export const deleteLead = async (
  leadId: string,
  token: string
): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/admin/leads/${leadId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch (error) {
    console.error("Delete lead error:", error);
    return false;
  }
};

// -------------------------
// Public Lead Submission
// -------------------------
export const createLeadPublic = async (
  leadData: Omit<Lead, "_id" | "createdAt" | "status">
): Promise<{ success: boolean; lead?: Lead }> => {
  try {
    const res = await fetch(`${API_BASE}/leads/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });
    return await res.json();
  } catch (error) {
    console.error("Create lead error:", error);
    return { success: false };
  }
};

// -------------------------
// Daily Stats (Admin)
// -------------------------
export const fetchDailyStats = async (
  token: string
): Promise<DailyStats | null> => {
  try {
    const res = await fetch(`${API_BASE}/admin/stats/daily`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  } catch (error) {
    console.error("Fetch stats error:", error);
    return null;
  }
};

// -------------------------
// Export Leads as CSV
// -------------------------
export const exportLeadsToCSV = (leads: Lead[]): string => {
  const headers = ["Name", "Email", "Phone", "Source", "Date", "Status"];
  const csvContent = [
    headers.join(","),
    ...leads.map((lead) =>
      [
        lead.fullName || "",
        lead.email || "",
        lead.phone || "",
        lead.source,
        new Date(lead.createdAt).toISOString(),
        lead.status,
      ].join(",")
    ),
  ].join("\n");

  return csvContent;
};

// -------------------------
// Send Message to Lead
// -------------------------
export const sendMessage = async (
  leadId: string,
  type: "email" | "whatsapp" | "both",
  message: string,
  token: string
) => {
  const res = await fetch(`${API_BASE}/leads/${leadId}/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ leadId, messageType: type, message }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to send message");
  }

  return res.json();
};
