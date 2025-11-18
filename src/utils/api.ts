// api.ts

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
// Forgot / Reset Password
// -------------------------
export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/admin/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (error) {
    console.error("Forgot password error:", error);
    return { success: false, error: "Server error" };
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/admin/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });
    return await res.json();
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Server error" };
  }
};

// -------------------------
// Lead Management (Admin)

    export const fetchLeads = async (
      token: string,
      page: number = 1,
      limit: number = 10
    ): Promise<{
      leads: Lead[];
      totalPages: number;
      page: number;
      totalLeads: number;
      newLeadsCount: number;
      contactedCount: number;
      convertedCount: number;
    }> => {
      try {
        const res = await fetch(
          `${API_BASE}/leads/leads?page=${page}&limit=${limit}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        if (res.status === 401) {
          sessionStorage.removeItem("token");
          throw new Error("Unauthorized. Please login again.");
        }
    
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to fetch leads: ${errText}`);
        }
    
        const data = await res.json();
    
        // -----------------------------------
        // 🧠 SMART FUTURE-PROOF PARSING
        // -----------------------------------
    
        const leads = Array.isArray(data)
          ? data                     // backend returned ONLY array
          : data.leads ?? data.data ?? [];  // backend returned object
    
        const totalLeads =
          data.totalLeads ??
          data.count ??
          leads.length; // fallback
    
        const pageNumber = data.page ?? page;
        const totalPages =
          data.totalPages ??
          Math.ceil(totalLeads / limit) ??
          1;
    
        return {
          leads,
          totalPages,
          page: pageNumber,
          totalLeads,
          newLeadsCount: data.newLeadsCount ?? 0,
          contactedCount: data.contactedCount ?? 0,
          convertedCount: data.convertedCount ?? 0,
        };
    
      } catch (error) {
        console.error("❌ Fetch leads error:", error);
    
        return {
          leads: [],
          totalPages: 1,
          page: 1,
          totalLeads: 0,
          newLeadsCount: 0,
          contactedCount: 0,
          convertedCount: 0,
        };
      }
    };
    


export const updateLead = async (
  leadId: string,
  updates: Partial<Lead>,
  token: string
): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/leads/leads/${leadId}`, {
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
export const createLeadPublic = async (leadData) => {
  try {
    const res = await fetch(`${API_BASE}/leads/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
    });
    const data = await res.json();
    return { success: true, lead: data }; // 🔹 Wrap manually
  } catch (error) {
    console.error("Create lead error:", error);
    return { success: false };
  }
};


// -------------------------
// Daily Stats (Admin)
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

export const exportLeadsToCSV = (leads: Lead[]): string => {
  // Default headers
  const baseHeaders = [
    "Full Name",
    "Email",
    "Phone",
    "Source",
    "Status",
    "Created At",
  ];

  // Collect all possible extra field keys
  const extraKeys = Array.from(
    new Set(
      leads.flatMap((l) => (l.extraFields ? Object.keys(l.extraFields) : []))
    )
  );

  const headers = [...baseHeaders, ...extraKeys];

  const csvContent = [
    headers.join(","),
    ...leads.map((lead) => {
      const extraValues = extraKeys.map(
        (key) => (lead.extraFields && lead.extraFields[key]) || ""
      );
      return [
        lead.fullName || "",
        lead.email || "",
        lead.phone || "",
        lead.source || "",
        lead.status || "",
        new Date(lead.createdAt).toISOString(),
        ...extraValues,
      ].join(",");
    }),
  ].join("\n");

  return csvContent;
};


// -------------------------
// Send Message to Lead
export const sendMessage = async (
  leadId: string,
  type: "email" | "whatsapp" | "both",
  message: string,
  token: string
) => {
  const res = await fetch(`${API_BASE}/messages/${leadId}/send-message`, {
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

export const getAdminProfile = async (
  token: string
): Promise<AdminProfile | null> => {
  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch admin profile");

    return await res.json();
  } catch (error) {
    console.error("Fetch admin profile error:", error);
    return null;
  }
};


// src/services/activityService.ts

export const fetchActivities = async (userId: string) => {
  const res = await fetch(`${API_BASE}/activity/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
};

export const addActivity = async (data: { userId: string; adminId?: string; text: string }) => {
  const res = await fetch(`${API_BASE}/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add activity");
  return res.json();
};

export const updateActivity = async (id: string, text: string) => {
  const res = await fetch(`${API_BASE}/activity/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to update activity");
  return res.json();
};

export const deleteActivity = async (id: string) => {
  const res = await fetch(`${API_BASE}/activity/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete activity");
  return res.json();
};// -------------------------
// IMPORT LEADS (FILE UPLOAD)
// -------------------------
export const importLeadsFile = async (
  file: File,
  token: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/admin/import-leads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, 
        // DO NOT SET Content-Type manually
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      return {
        success: true,
        message: data.message || "Leads imported successfully",
      };
    }

    return {
      success: false,
      error: data.error || "Upload failed",
    };
  } catch (err) {
    console.error("Import error:", err);
    return {
      success: false,
      error: "Something went wrong",
    };
  }
};
