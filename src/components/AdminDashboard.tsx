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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contacted: 0,
    converted: 0,
  });

  const token = sessionStorage.getItem("token");

  // ✅ Load leads per page + total stats
  const loadLeads = async (pageNum: number = 1) => {
    if (!token) return;
    try {
      const { leads, totalPages, page, totalLeads, newLeadsCount, contactedCount, convertedCount } = await fetchLeads(token, pageNum);
      setLeads(leads);
      setTotalPages(totalPages);
      setPage(page);
      setStats({
        totalLeads,
        newLeads: newLeadsCount,
        contacted: contactedCount,
        converted: convertedCount,
      });
    } catch (err) {
      console.error("Failed to load leads:", err);
    }
  };

  useEffect(() => {
    loadLeads(page);
  }, [page]);

  // ✅ Load admin profile
  useEffect(() => {
    if (!token) return;
    const getAdmin = async () => {
      const data = await getAdminProfile(token);
      setAdmin(data);
    };
    getAdmin();
  }, []);

  const handleSendMessage = (lead: Lead) => {
    setSelectedLead(lead);
    setShowMessageModal(true);
  };

  const handleUpdateStatus = async (leadId: string, status: "new" | "contacted" | "converted") => {
    if (!token) return;
    const success = await updateLead(leadId, { status }, token);
    if (success) {
      setLeads(prev => prev.map(l => (l._id === leadId ? { ...l, status } : l)));
      // optionally reload stats after update
      loadLeads(page);
    }
  };

  const handleExportLeads = async () => {
    try {
      const csv = await exportLeadsToCSV(leads); // export current page
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "leads.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export leads");
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
              <h1 className="text-2xl font-bold gradient-text">Lead Management</h1>
              <p className="text-sm text-muted-foreground">Modern Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button onClick={handleExportLeads} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">Hi, {admin?.name || "Admin"} 👋</h2>
          <p className="text-muted-foreground">Welcome to Lead Management</p>
        </div>

        {/* Stats */}
        <div className="dashboard-grid mb-8">
          <div className="stat-card-gradient-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">TOTAL LEADS</p>
                <div className="text-3xl font-bold text-white mt-2">{stats.totalLeads}</div>
                <p className="text-xs text-white/60 mt-1">All time leads</p>
              </div>
              <Users className="h-8 w-8 text-white/80" />
            </div>
          </div>

          <div className="stat-card-gradient-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">NEW LEADS</p>
                <div className="text-3xl font-bold text-white mt-2">{stats.newLeads}</div>
                <p className="text-xs text-white/60 mt-1">Require attention</p>
              </div>
              <Clock className="h-8 w-8 text-white/80" />
            </div>
          </div>

          <div className="stat-card-gradient-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">CONTACTED</p>
                <div className="text-3xl font-bold text-white mt-2">{stats.contacted}</div>
                <p className="text-xs text-white/60 mt-1">In progress</p>
              </div>
              <MessageCircle className="h-8 w-8 text-white/80" />
            </div>
          </div>

          <div className="stat-card-gradient-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 font-medium uppercase tracking-wide">CONVERTED</p>
                <div className="text-3xl font-bold text-white mt-2">{stats.converted}</div>
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
              <CardTitle className="text-lg font-semibold">Recent Leads</CardTitle>
              <Badge variant="secondary" className="ml-auto">{stats.totalLeads} leads</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <LeadTable leads={leads} onSendMessage={handleSendMessage} onUpdateStatus={handleUpdateStatus} />
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between mt-2">
          <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} / {totalPages}</span>
          <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
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
            if (selectedLead) handleUpdateStatus(selectedLead._id, "contacted");
            setShowMessageModal(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
