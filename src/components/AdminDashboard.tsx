import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LeadTable from "./LeadTable";
import SendMessageModal from "./SendMessageModal";
import {
  Users,
  MessageCircle,
  TrendingUp,
  Download,
  LogOut,
  Building2,
  Clock,
} from "lucide-react";

import { fetchLeads, updateLead, exportLeadsToCSV, Lead, getAdminProfile, AdminProfile } from "@/utils/api";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
  
    const getData = async () => {
      const leadsData = await fetchLeads(token);
      setLeads(leadsData);
  
      const adminData = await getAdminProfile(token);
      setAdmin(adminData);
    };
  
    getData();
  }, []);
  

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter((lead) => lead.status === "new").length,
    contacted: leads.filter((lead) => lead.status === "contacted").length,
    converted: leads.filter((lead) => lead.status === "converted").length,
  };

  const handleSendMessage = (lead: Lead) => {
    setSelectedLead(lead);
    setShowMessageModal(true);
  };

  const handleUpdateStatus = async (
    leadId: string,
    status: "new" | "contacted" | "converted"
  ) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const success = await updateLead(leadId, { status }, token); 
    if (success) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === leadId ? { ...lead, status } : lead 
        )
      );
    }
  };

  const handleExportLeads = async () => {
    try {
      const csvContent = await exportLeadsToCSV(leads);
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "leads-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export leads. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 gradient-primary rounded-xl shadow-glow">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Lead Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Modern Admin Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={handleExportLeads}
              variant="outline"
              size="sm"
              className="hidden sm:flex border-border/50 hover:bg-accent/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-border/50 hover:bg-accent/50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
        <h2 className="text-4xl font-bold text-foreground mb-2">
  Hi, { admin?.email || "Admin"} 👋
</h2>

          <p className="text-muted-foreground">Welcome to Lead Management</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-grid mb-8">
          <div className="stat-card-gradient-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">
                  TOTAL LEADS
                </p>
                <div className="text-3xl font-bold text-white mt-2">
                  {stats.totalLeads}
                </div>
                <p className="text-xs text-white/60 mt-1">All time leads</p>
              </div>
              <Users className="h-8 w-8 text-white/80" />
            </div>
          </div>

          <div className="stat-card-gradient-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">
                  NEW LEADS
                </p>
                <div className="text-3xl font-bold text-white mt-2">
                  {stats.newLeads}
                </div>
                <p className="text-xs text-white/60 mt-1">Require attention</p>
              </div>
              <Clock className="h-8 w-8 text-white/80" />
            </div>
          </div>

          <div className="stat-card-gradient-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">
                  CONTACTED
                </p>
                <div className="text-3xl font-bold text-white mt-2">
                  {stats.contacted}
                </div>
                <p className="text-xs text-white/60 mt-1">In progress</p>
              </div>
              <MessageCircle className="h-8 w-8 text-white/80" />
            </div>
          </div>

          <div className="stat-card-gradient-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">
                  CONVERTED
                </p>
                <div className="text-3xl font-bold text-white mt-2">
                  {stats.converted}
                </div>
                <p className="text-xs text-white/60 mt-1">Success rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-white/80" />
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <Card className="data-table">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Recent Leads
              </CardTitle>
              <Badge variant="secondary" className="ml-auto">
                {leads.length} leads
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <LeadTable
              leads={leads}
              onSendMessage={handleSendMessage}
              onUpdateStatus={handleUpdateStatus}
            />
          </CardContent>
        </Card>
      </main>

      {/* Send Message Modal */}
      {showMessageModal && selectedLead && (
        <SendMessageModal
          lead={selectedLead}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedLead(null);
          }}
          onSent={() => {
            if (selectedLead) {
              handleUpdateStatus(selectedLead._id, "contacted"); // 👈 fixed
            }
            setShowMessageModal(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
