// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import LeadTable from "./LeadTable";
// import SendMessageModal from "./SendMessageModal";
// import AddLeadModal from "./AddLeadModal";
// import { useNavigate } from "react-router-dom";
// import { importLeadsFile } from "@/utils/api";

// import {
//   Users,
//   MessageCircle,
//   TrendingUp,
//   Download,
//   LogOut,
//   Building2,
//   Clock,
//   Upload,
// } from "lucide-react";

// import {
//   fetchLeads,
//   updateLead,
//   exportLeadsToCSV,
//   Lead,
//   getAdminProfile,
//   AdminProfile,
//   deleteLead,
// } from "@/utils/api";

// const AdminDashboard = ({ onLogout }) => {
//   const [admin, setAdmin] = useState<AdminProfile | null>(null);
//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
//   const [showMessageModal, setShowMessageModal] = useState(false);

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [stats, setStats] = useState({
//     totalLeads: 0,
//     newLeads: 0,
//     contacted: 0,
//     converted: 0,
//   });

//   const navigate = useNavigate();
//   const token = sessionStorage.getItem("token");

//   // ⭐ LIVE stats updater (THIS FIXED EVERYTHING)
//   const refreshStatsOnly = async () => {
//     if (!token) return;
//     const data = await fetchLeads(token, page);

//     setStats({
//       totalLeads: data.totalLeads,
//       newLeads: data.newLeadsCount,
//       contacted: data.contactedCount,
//       converted: data.convertedCount,
//     });
//   };

//   // ⭐ normal stats load
//   const loadStats = async () => {
//     if (!token) return;
//     const data = await fetchLeads(token, page);

//     setLeads(data.leads);
//     setTotalPages(data.totalPages);

//     setStats({
//       totalLeads: data.totalLeads,
//       newLeads: data.newLeadsCount,
//       contacted: data.contactedCount,
//       converted: data.convertedCount,
//     });
//   };

//   // ⭐ Load leads
//   const loadLeads = async (pageNum = 1) => {
//     if (!token) return;

//     const data = await fetchLeads(token, pageNum);

//     setLeads(data.leads);
//     setTotalPages(data.totalPages);
//     setPage(data.page);

//     setStats({
//       totalLeads: data.totalLeads,
//       newLeads: data.newLeadsCount,
//       contacted: data.contactedCount,
//       converted: data.convertedCount,
//     });
//   };

//   useEffect(() => {
//     loadLeads(page);
//   }, [page]);

//   useEffect(() => {
//     if (token) getAdminProfile(token).then(setAdmin);
//   }, []);

//   // ⭐ table se status change hote hi LIVE update
//   const handleUpdateStatus = async (leadId: string, status: "new" | "contacted" | "converted") => {
//     if (!token) return;

//     const success = await updateLead(leadId, { status }, token);

//     if (success) {
//       setLeads((prev) =>
//         prev.map((l) => (l._id === leadId ? { ...l, status } : l))
//       );

//       await refreshStatsOnly(); // ⭐ MOST IMPORTANT FIX
//     }
//   };

//   // ⭐ Delete Lead
//   const handleDeleteLead = async (leadId: string) => {
//     if (!token) return;

//     if (!window.confirm("Are you sure you want to delete this lead?")) return;

//     const success = await deleteLead(leadId, token);

//     if (success) {
//       const updated = leads.filter((l) => l._id !== leadId);
//       setLeads(updated);
//       await refreshStatsOnly();
//     }
//   };

//   // ⭐ CSV Export
//   const handleExportLeads = async () => {
//     const csv = await exportLeadsToCSV(leads);
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "leads.csv";
//     a.click();

//     window.URL.revokeObjectURL(url);
//   };

//   // ⭐ IMPORT LEADS (One-Click Upload)
//   const handleImportClick = () => {
//     document.getElementById("importFileInput")?.click();
//   };

//   return (
//     <div className="min-h-screen">

//       {/* Header */}
//       <header className="glass-effect border-b backdrop-blur-xl">
//         <div className="container mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center justify-center w-12 h-12 gradient-primary rounded-xl shadow-glow">
//               <Building2 className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold gradient-text">Lead Management</h1>
//               <p className="text-sm text-muted-foreground">Modern Admin Dashboard</p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3">

//             <Button
//               onClick={() => navigate("/add-lead")}
//               size="sm"
//               className="bg-blue-600 hover:bg-blue-700 text-white"
//             >
//               + Add Lead
//             </Button>

//             {/* Hidden file input */}
//             <input
//               type="file"
//               accept=".csv,.xlsx,.xls"
//               id="importFileInput"
//               className="hidden"
//               onChange={async (e) => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;

//                 const result = await importLeadsFile(file, token);
//                 if (result.success) {
//                   alert("File uploaded!");
//                   loadLeads(page);
//                 } else {
//                   alert(result.error);
//                 }
//               }}
//             />

//             <Button onClick={handleImportClick}>
//               <Upload className="h-4 w-4 mr-2" /> Import
//             </Button>

//             <Button onClick={handleExportLeads} variant="outline" size="sm">
//               <Download className="h-4 w-4 mr-2" />
//               Export
//             </Button>

//             <Button onClick={onLogout} variant="outline" size="sm">
//               <LogOut className="h-4 w-4 mr-2" /> Logout
//             </Button>
//           </div>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="container mx-auto px-6 py-8">

//         {/* Welcome */}
//         <div className="mb-8">
//           <h2 className="text-4xl font-bold">{admin?.name || "Admin"} 👋</h2>
//           <p className="text-muted-foreground">Welcome to Lead Management</p>
//         </div>

//         {/* Stats */}
//         <div className="dashboard-grid mb-8">

//           <div className="stat-card-gradient-1">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <p className="text-sm text-white/80">TOTAL LEADS</p>
//                 <div className="text-3xl font-bold text-white mt-2">{stats.totalLeads}</div>
//               </div>
//               <Users className="h-8 w-8 text-white/80" />
//             </div>
//           </div>

//           <div className="stat-card-gradient-2">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <p className="text-sm text-white/80">NEW LEADS</p>
//                 <div className="text-3xl font-bold text-white mt-2">{stats.newLeads}</div>
//               </div>
//               <Clock className="h-8 w-8 text-white/80" />
//             </div>
//           </div>

//           <div className="stat-card-gradient-3">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <p className="text-sm text-white/80">CONTACTED</p>
//                 <div className="text-3xl font-bold text-white mt-2">{stats.contacted}</div>
//               </div>
//               <MessageCircle className="h-8 w-8 text-white/80" />
//             </div>
//           </div>

//           <div className="stat-card-gradient-4">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <p className="text-sm text-white/80">CONVERTED</p>
//                 <div className="text-3xl font-bold text-white mt-2">{stats.converted}</div>
//               </div>
//               <TrendingUp className="h-8 w-8 text-white/80" />
//             </div>
//           </div>

//         </div>

//         {/* Leads Table */}
//         <Card className="data-table">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-lg font-semibold">
//                 Recent Leads
//               </CardTitle>
//               <Badge variant="secondary">{stats.totalLeads} leads</Badge>
//             </div>
//           </CardHeader>

//           <CardContent className="p-0">
//             <LeadTable
//               leads={leads}
//               refreshStats={refreshStatsOnly}
//               onUpdateStatus={handleUpdateStatus}
//               onDeleteLead={handleDeleteLead}
//               onSendMessage={(lead) => {
//                 setSelectedLead(lead);
//                 setShowMessageModal(true);
//               }}
//             />
//           </CardContent>
//         </Card>

//         {/* Pagination */}
//         <div className="flex justify-between mt-2">
//           <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
//             Previous
//           </button>

//           <span>Page {page} / {totalPages}</span>

//           <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
//             Next
//           </button>
//         </div>
//       </main>

//       {/* Message Modal */}
//       {showMessageModal && selectedLead && (
//         <SendMessageModal
//           lead={selectedLead}
//           onClose={() => {
//             setShowMessageModal(false);
//             setSelectedLead(null);
//           }}
//           onSent={() => {
//             handleUpdateStatus(selectedLead._id, "contacted");
//             setShowMessageModal(false);
//           }}
//         />
//       )}

//     </div>
//   );
// };

// export default AdminDashboard;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LeadTable from "./LeadTable";
import SendMessageModal from "./SendMessageModal";
import AddLeadModal from "./AddLeadModal";
import { useNavigate } from "react-router-dom";
import { importLeadsFile } from "@/utils/api";

import {
  Users,
  MessageCircle,
  TrendingUp,
  Download,
  LogOut,
  Building2,
  Clock,
  Upload,
} from "lucide-react";

import {
  fetchLeads,
  updateLead,
  exportLeadsToCSV,
  Lead,
  getAdminProfile,
  AdminProfile,
  deleteLead,
} from "@/utils/api";

const AdminDashboard = ({ onLogout }) => {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ⭐ stats are now 100% frontend based
  const calcStats = (allLeads: Lead[]) => {
    return {
      totalLeads: allLeads.length,
      newLeads: allLeads.filter((l) => l.status === "new").length,
      contacted: allLeads.filter((l) => l.status === "contacted").length,
      converted: allLeads.filter((l) => l.status === "converted").length,
    };
  };

  const [stats, setStats] = useState(calcStats([]));

  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // ⭐ Load leads
  const loadLeads = async (pageNum = 1) => {
    if (!token) return;

    const data = await fetchLeads(token, pageNum);

    setLeads(data.leads);
    setTotalPages(data.totalPages);
    setPage(data.page);

    // ⭐ Update stats (frontend only)
    setStats(calcStats(data.leads));
  };

  useEffect(() => {
    loadLeads(page);
  }, [page]);

  useEffect(() => {
    if (!token) return;
    getAdminProfile(token).then(setAdmin);
  }, []);

  // ⭐ TABLE → DASHBOARD Status Update Handler
  const handleUpdateStatus = async (leadId: string, status: Lead["status"]) => {
    if (!token) return;

    const success = await updateLead(leadId, { status }, token);

    if (success) {
      const updated = leads.map((l) =>
        l._id === leadId ? { ...l, status } : l
      );
      setLeads(updated);

      // ⭐ Update cards instantly
      setStats(calcStats(updated));
    }
  };

  // ⭐ Delete lead
  const handleDeleteLead = async (leadId: string) => {
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    const success = await deleteLead(leadId, token);
    if (!success) return;

    const updated = leads.filter((l) => l._id !== leadId);
    setLeads(updated);

    // ⭐ Instant dashboard card update
    setStats(calcStats(updated));
  };

  // IMPORT FILE
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const result = await importLeadsFile(file, token);

    if (result.success) {
      alert("File uploaded!");
      loadLeads(page); // stats auto update
    } else {
      alert(result.error);
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
            <Button onClick={() => navigate("/add-lead")} className="bg-blue-600 hover:bg-blue-700 text-white">
              + Add Lead
            </Button>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              id="importFileInput"
              onChange={handleFileUpload}
            />

            <Button onClick={() => document.getElementById("importFileInput")?.click()}>
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>

            <Button onClick={() => {
              const csv = exportLeadsToCSV(leads);
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "leads.csv";
              a.click();
              window.URL.revokeObjectURL(url);
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button onClick={onLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Hi, {admin?.name || "Admin"} 👋</h2>
          <p className="text-muted-foreground">Welcome to Lead Management</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-grid mb-8">
          <div className="stat-card-gradient-1">
            <p className="text-sm text-white/80 uppercase">TOTAL LEADS</p>
            <div className="text-3xl font-bold text-white mt-2">{stats.totalLeads}</div>
          </div>

          <div className="stat-card-gradient-2">
            <p className="text-sm text-white/80 uppercase">NEW LEADS</p>
            <div className="text-3xl font-bold text-white mt-2">{stats.newLeads}</div>
          </div>

          <div className="stat-card-gradient-3">
            <p className="text-sm text-white/80 uppercase">CONTACTED</p>
            <div className="text-3xl font-bold text-white mt-2">{stats.contacted}</div>
          </div>

          <div className="stat-card-gradient-4">
            <p className="text-sm text-white/80 uppercase">CONVERTED</p>
            <div className="text-3xl font-bold text-white mt-2">{stats.converted}</div>
          </div>
        </div>

        {/* TABLE */}
        <Card className="data-table">
          <CardHeader>
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            <Badge className="ml-auto">{stats.totalLeads} leads</Badge>
          </CardHeader>

          <CardContent className="p-0">
            <LeadTable
              leads={leads}
              refreshStats={() => setStats(calcStats(leads))}
              onUpdateStatus={handleUpdateStatus}
              onDeleteLead={handleDeleteLead}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
