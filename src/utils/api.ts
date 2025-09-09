// API utility functions for Supabase integration
// This file will contain API calls when backend is set up

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: Date;
  status: 'new' | 'contacted' | 'converted';
}

export interface AuthCredentials {
  email: string;
  password: string;
}

// Authentication
export const loginAdmin = async (credentials: AuthCredentials): Promise<boolean> => {
  // TODO: Replace with Supabase Auth
  // For now, using mock authentication
  return credentials.email === 'admin@company.com' && credentials.password === 'admin123';
};

// Lead Management
export const fetchLeads = async (): Promise<Lead[]> => {
  // TODO: Replace with Supabase query
  // For now, returning mock data
  return [];
};

export const createLead = async (leadData: Omit<Lead, 'id' | 'timestamp'>): Promise<Lead> => {
  // TODO: Replace with Supabase insert
  const newLead: Lead = {
    ...leadData,
    id: Date.now().toString(),
    timestamp: new Date(),
  };
  return newLead;
};

export const updateLeadStatus = async (leadId: string, status: Lead['status']): Promise<void> => {
  // TODO: Replace with Supabase update
  console.log(`Updating lead ${leadId} status to ${status}`);
};

export const sendMessage = async (
  leadId: string, 
  type: 'email' | 'whatsapp', 
  message: string
): Promise<void> => {
  // TODO: Replace with Supabase Edge Functions
  console.log(`Sending ${type} to lead ${leadId}: ${message}`);
};

export const exportLeadsToCSV = async (leads: Lead[]): Promise<string> => {
  // Convert leads to CSV format
  const headers = ['Name', 'Email', 'Phone', 'Message', 'Date', 'Status'];
  const csvContent = [
    headers.join(','),
    ...leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      `"${lead.message}"`,
      lead.timestamp.toISOString(),
      lead.status
    ].join(','))
  ].join('\n');
  
  return csvContent;
};