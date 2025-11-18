// import { useEffect, useMemo, useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import {
//   MessageCircle,
//   Phone,
//   Mail,
//   Calendar,
//   Edit,
//   Trash,
//   FileText,
//   Filter,
//   Clock,
// } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import { Lead, updateLead } from "@/utils/api";
// import SendMessageModal from "@/components/SendMessageModal";
// import AdminActivityModal from "@/components/AdminActivityModal";

// /**
//  * LeadTable
//  *
//  * - Renders leads (props.leads) but maintains local copy so we can update status locally
//  * - Status dropdown updates only local table + calls updateLead API (does NOT call parent)
//  * - Follow-up modal available to set followUp object (calls updateLead)
//  *
//  * NOTE:
//  * - If you want parent (dashboard) to update when status changes, pass and use onUpdateStatus.
//  * - Current behaviour: local table update only (dashboard NOT updated) — as requested.
//  */

// interface LeadTableProps {
//   leads: Lead[]; // incoming from parent
//   onSendMessage?: (lead: Lead) => void;
//   onDeleteLead?: (leadId: string) => void;
//   refreshStats: () => void; 
//   // optional parent update callback — not used by default to avoid changing dashboard state
//   onUpdateStatus?: (leadId: string, status: Lead["status"]) => void;
// }

// const LeadTable = ({ leads: propLeads, onSendMessage, onDeleteLead, onUpdateStatus,refreshStats}: LeadTableProps) => {
//   // local copy so we can update without touching parent unless explicitly calling onUpdateStatus
//   const [leads, setLeads] = useState<Lead[]>(propLeads ?? []);
//   const [editingLead, setEditingLead] = useState<Lead | null>(null);
//   const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
//   const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
//   const [activityUserId, setActivityUserId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   // follow-up modal state
//   const [followUpLead, setFollowUpLead] = useState<Lead | null>(null);

//   // filters & pagination
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const [page, setPage] = useState(1);
//   const pageSize = 15;

//   // sync local copy when parent prop changes
//   useEffect(() => {
//     setLeads(propLeads ?? []);
//     setPage(1); // reset page when data changes (optional)
//   }, [propLeads]);

//   const getStatusBadgeVariant = (status?: Lead["status"]) => {
//     switch (status) {
//       case "new":
//         return "default";
//       case "contacted":
//         return "secondary";
//       case "converted":
//         return "default";
//       default:
//         return "default";
//     }
//   };

//   // filtered leads (frontend)
//   const filteredLeads = useMemo(() => {
//     return leads.filter((lead) => {
//       const matchSearch =
//         search === "" ||
//         (lead.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
//         (lead.email || "").toLowerCase().includes(search.toLowerCase()) ||
//         (lead.phone || "").includes(search);

//       const matchStatus = !statusFilter || statusFilter === "all" || lead.status === statusFilter;

//       const leadDate = new Date(lead.createdAt || lead.receivedAt || Date.now());
//       const matchDate =
//         (!startDate || leadDate >= new Date(startDate)) &&
//         (!endDate || leadDate <= new Date(endDate + "T23:59:59"));

//       return matchSearch && matchStatus && matchDate;
//     });
//   }, [leads, search, statusFilter, startDate, endDate]);

//   const paginatedLeads = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     return filteredLeads.slice(start, start + pageSize);
//   }, [filteredLeads, page]);

//   // --- Helpers: update status locally + backend
//   const handleLocalStatusChange = async (leadId: string, newStatus: Lead["status"]) => {
//     setLoading(true);
//     try {
//       // optimistic local update
//       setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l)));

//       // call backend
//       const ok = await updateLead(leadId, { status: newStatus }, sessionStorage.getItem("token") || "");
//       if (!ok) {
//         // rollback on failure
//         setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, status: (l.status === newStatus ? "new" : l.status) } : l)));
//         alert("Failed to update status on server.");
//       } else {
//         // optionally notify parent if they passed handler (but default behavior no parent change)
//         if (typeof onUpdateStatus === "function") {
//           try {
//             onUpdateStatus(leadId, newStatus); // warning: parent may change dashboard
//           } catch {}
//         }
//       }
//     } catch (err) {
//       console.error("Status update error:", err);
//       alert("Error updating status.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Follow-up modal handlers
//   const openFollowUpModal = (lead: Lead) => {
//     // ensure followUp object exists
//     const safeLead = {
//       ...lead,
//       followUp: {
//         date: lead.followUp?.date ?? null,
//         recurrence: lead.followUp?.recurrence ?? null,
//         message: lead.followUp?.message ?? null,
//         whatsappOptIn: !!lead.followUp?.whatsappOptIn,
//         active: !!lead.followUp?.active,
//       },
//     } as Lead;
//     setFollowUpLead(safeLead);
//   };

//   const saveFollowUp = async (leadId: string, followUp: any) => {
//     setLoading(true);
//     try {
//       // update backend
//       const ok = await updateLead(leadId, { followUp }, sessionStorage.getItem("token") || "");
//       if (!ok) {
//         alert("Failed to save follow-up on server.");
//         return;
//       }

//       // update local list
//       setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, followUp } : l)));
//       setFollowUpLead(null);
//     } catch (err) {
//       console.error("Save follow-up error:", err);
//       alert("Error saving follow-up.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Edit & Save lead details (simple local edit + backend)
//   const saveEditedLead = async (lead: Lead) => {
//     setLoading(true);
//     try {
//       const ok = await updateLead(lead._id, lead, sessionStorage.getItem("token") || "");
//       if (!ok) {
//         alert("Failed to save lead");
//         return;
//       }
//       setLeads((prev) => prev.map((p) => (p._id === lead._id ? lead : p)));
//       setEditingLead(null);
//     } catch (err) {
//       console.error(err);
//       alert("Error saving lead.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative flex flex-col gap-4">
//       {/* Filter Bar */}
//       <div className="flex flex-wrap gap-2 items-end justify-between border-b pb-3 mb-2">
//         <div className="flex items-center gap-2">
//           <Filter className="h-4 w-4 text-gray-500" />
//           <Input
//             placeholder="Search by name, email, or phone..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-[220px]"
//           />
//         </div>

//         <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
//           <SelectTrigger className="w-[150px]">
//             <SelectValue placeholder="Filter by Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All</SelectItem>
//             <SelectItem value="new">New</SelectItem>
//             <SelectItem value="contacted">Contacted</SelectItem>
//             <SelectItem value="converted">Converted</SelectItem>
//           </SelectContent>
//         </Select>

//         <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[150px]" />
//         <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[150px]" />

//         <Button
//           variant="outline"
//           onClick={() => {
//             setSearch("");
//             setStartDate("");
//             setEndDate("");
//             setStatusFilter("");
//           }}
//         >
//           Reset
//         </Button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto flex-1">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead>Contact</TableHead>
//               <TableHead>Message</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Follow-Up</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {paginatedLeads.length > 0 ? (
//               paginatedLeads.map((lead) => (
//                 <TableRow key={lead._id} className="hover:bg-muted/50">
//                   <TableCell>
//                     <div className="font-medium">{lead.fullName}</div>
//                   </TableCell>

//                   <TableCell>
//                     <div className="space-y-1">
//                       <div className="flex items-center text-sm text-muted-foreground">
//                         <Mail className="h-3 w-3 mr-1" /> {lead.email || "—"}
//                       </div>
//                       <div className="flex items-center text-sm text-muted-foreground">
//                         <Phone className="h-3 w-3 mr-1" /> {lead.phone || "—"}
//                       </div>
//                     </div>
//                   </TableCell>

//                   <TableCell>
//                     <p className="text-sm truncate max-w-xs" title={lead.message || "N/A"}>
//                       {lead.message || "—"}
//                     </p>
//                   </TableCell>

//                   <TableCell>
//                     <div className="flex items-center text-sm text-muted-foreground">
//                       <Calendar className="h-3 w-3 mr-1" />
//                       {lead.createdAt ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }) : "—"}
//                     </div>
//                   </TableCell>

//                   <TableCell>
//                     {/* STATUS DROPDOWN (updates only table by default) */}
//                     <Select value={lead.status || "new"} onValueChange={async (v) => {
//   await onUpdateStatus(lead._id, v as Lead["status"]);  
//   refreshStats();   // ⭐ REAL-TIME stats update here
// }}
// >
//                       <SelectTrigger className="w-32">
//                         <SelectValue>
//                           <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
//                         </SelectValue>
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="new">New</SelectItem>
//                         <SelectItem value="contacted">Contacted</SelectItem>
//                         <SelectItem value="converted">Converted</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </TableCell>

//                   <TableCell>
//                     {lead.followUp?.active && lead.followUp?.date ? (
//                       <Badge className="bg-blue-600 text-white">
//                         {formatDistanceToNow(new Date(lead.followUp.date), { addSuffix: true })}
//                       </Badge>
//                     ) : (
//                       <span className="text-gray-400 text-sm">No Follow-up</span>
//                     )}
//                   </TableCell>

//                   <TableCell className="text-right space-x-1">
//                     <Button
//                       onClick={() => {
//                         setSelectedLead(lead);
//                         setIsMessageModalOpen(true);
//                       }}
//                       size="sm"
//                       variant="outline"
//                       className="hover:bg-blue-600 hover:text-white"
//                     >
//                       <MessageCircle className="h-4 w-4" />
//                     </Button>

//                     <Button onClick={() => setEditingLead(lead)} size="sm" variant="outline" className="hover:bg-amber-500 hover:text-white">
//                       <Edit className="h-4 w-4" />
//                     </Button>

//                     <Button onClick={() => openFollowUpModal(lead)} size="sm" variant="outline" className="hover:bg-indigo-600 hover:text-white">
//                       <Clock className="h-4 w-4" />
//                     </Button>

//                     <Button onClick={() => setActivityUserId(lead._id)} size="sm" variant="outline" className="hover:bg-green-600 hover:text-white">
//                       <FileText className="h-4 w-4" />
//                     </Button>

//                     <Button onClick={() => onDeleteLead?.(lead._1d ?? lead._id)} size="sm" variant="destructive">
//                       <Trash className="h-4 w-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={7} className="text-center text-gray-500">
//                   No leads found with selected filters.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-between px-4 pb-4">
//         <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
//           Previous
//         </Button>

//         <span className="text-sm">
//           Page {page} of {Math.max(1, Math.ceil(filteredLeads.length / pageSize))}
//         </span>

//         <Button disabled={page >= Math.ceil(filteredLeads.length / pageSize)} onClick={() => setPage(page + 1)}>
//           Next
//         </Button>
//       </div>

//       {/* Edit Lead Modal */}
//       {editingLead && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//         <div className="bg-[hsl(253.33_14.75%_11.96%)] rounded-lg shadow-xl p-6 w-96 space-y-3">

//             <h2 className="text-lg font-semibold text-center">Edit Lead</h2>

//             <input type="text" placeholder="Full Name" value={editingLead.fullName || ""} onChange={(e) => setEditingLead({ ...editingLead, fullName: e.target.value })} className="w-full border p-2 rounded" 
//             style={{
//               backgroundColor: "hsl(250deg 13.04% 9.02%)",
//             }}
          
//             />

//             <input type="email" placeholder="Email" value={editingLead.email || ""} onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })} className="w-full border p-2 rounded" style={{
//               backgroundColor: "hsl(250deg 13.04% 9.02%)",
//             }}
//           />

//             <input type="text" placeholder="Phone" value={editingLead.phone || ""} onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })} className="w-full border p-2 rounded" 
//             style={{
//               backgroundColor: "hsl(250deg 13.04% 9.02%)",
//             }}
//           />

//             <textarea placeholder="Message" value={editingLead.message || ""} onChange={(e) => setEditingLead({ ...editingLead, message: e.target.value })} className="w-full border p-2 rounded" 
//             style={{
//               backgroundColor: "hsl(250deg 13.04% 9.02%)",
//             }}
//           />

//             <div className="flex justify-end gap-2 mt-3">
//               <Button variant="outline" onClick={() => setEditingLead(null)} disabled={loading}>Cancel</Button>
//               <Button onClick={() => saveEditedLead(editingLead)} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Follow-Up Modal */}
//       {followUpLead && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-[#1c1a23] rounded-lg shadow-xl p-6 w-[520px] max-w-full space-y-4">
//             <h3 className="text-lg font-semibold">Follow-up — {followUpLead.fullName}</h3>

//             <div className="grid grid-cols-2 gap-3">
//               <label className="flex flex-col">
//                 <span className="text-sm">Date & Time</span>
//                 <input
//                   type="datetime-local"
//                   value={followUpLead.followUp?.date ? new Date(followUpLead.followUp.date).toISOString().slice(0, 16) : ""}
//                   onChange={(e) => setFollowUpLead({ ...followUpLead, followUp: { ...followUpLead.followUp, date: e.target.value ? new Date(e.target.value).toISOString() : null } })}
//                   className="border p-2 rounded"
//                    style={{
//     backgroundColor: "hsl(250deg 13.04% 9.02%)",
//   }}
//                 />
//               </label>

//               <label className="flex flex-col">
//                 <span className="text-sm">Recurrence</span>
//                 <select value={followUpLead.followUp?.recurrence || ""} onChange={(e) => setFollowUpLead({ ...followUpLead, followUp: { ...followUpLead.followUp, recurrence: e.target.value } })} className="border p-2 rounded" 
//                  style={{
//                   backgroundColor: "hsl(250deg 13.04% 9.02%)",
//                 }}
//                 >
//                   <option value="">Once</option>
//                   <option value="tomorrow">Tomorrow</option>
//                   <option value="3days">3 days</option>
//                   <option value="weekly">Weekly</option>
//                 </select>
//               </label>

//               <label className="col-span-2 flex flex-col">
//                 <span className="text-sm">Message</span>
//                 <textarea value={followUpLead.followUp?.message || ""} onChange={(e) => setFollowUpLead({ ...followUpLead, followUp: { ...followUpLead.followUp, message: e.target.value } })} className="border p-2 rounded min-h-[80px]" 
//                  style={{
//                   backgroundColor: "hsl(250deg 13.04% 9.02%)",
//                 }}
//                 />
//               </label>

//               <div className="flex items-center gap-4">
//                 <label className="flex items-center gap-2">
//                   <input type="checkbox" checked={!!followUpLead.followUp?.whatsappOptIn} onChange={(e) => setFollowUpLead({ ...followUpLead, followUp: { ...followUpLead.followUp, whatsappOptIn: e.target.checked } })} />
//                   <span className="text-sm">Send on WhatsApp</span>
//                 </label>

//                 <label className="flex items-center gap-2">
//                   <input type="checkbox" checked={!!followUpLead.followUp?.active} onChange={(e) => setFollowUpLead({ ...followUpLead, followUp: { ...followUpLead.followUp, active: e.target.checked } })} />
//                   <span className="text-sm">Active</span>
//                 </label>
//               </div>
//             </div>

//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setFollowUpLead(null)}>Cancel</Button>
//               <Button onClick={() => saveFollowUp(followUpLead._id, followUpLead.followUp)} disabled={loading}>{loading ? "Saving..." : "Save Follow-up"}</Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {activityUserId && <AdminActivityModal userId={activityUserId} onClose={() => setActivityUserId(null)} />}

//       {selectedLead && (
//         <SendMessageModal
//           lead={selectedLead}
//           isOpen={isMessageModalOpen}
//           onClose={() => {
//             setIsMessageModalOpen(false);
//             setSelectedLead(null);
//           }}
//           onSend={() => {
//             alert(`Message sent to ${selectedLead.fullName}`);
//             setIsMessageModalOpen(false);
//             setSelectedLead(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default LeadTable;



// src/components/LeadTable.tsx


import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash,
  FileText,
  Filter,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Lead, updateLead } from "@/utils/api";
import SendMessageModal from "@/components/SendMessageModal";
import AdminActivityModal from "@/components/AdminActivityModal";

interface LeadTableProps {
  leads: Lead[]; // incoming list from parent
  onSendMessage?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
  // Optional callback: parent can receive updated leads array (useful to recompute stats in parent)
  onLeadsChange?: (newLeads: Lead[]) => void;
  // Optional explicit API-backed status handler (if parent prefers to control)
  onUpdateStatus?: (leadId: string, status: Lead["status"]) => Promise<void> | void;
  // Optional: refresh stats helper to call parent to re-calc counts
  refreshStats?: () => void;
}

const LeadTable = ({
  leads: propLeads,
  onSendMessage,
  onDeleteLead,
  onLeadsChange,
  onUpdateStatus,
  refreshStats,
}: LeadTableProps) => {
  // Local copy so UI updates immediately without forcing parent update
  const [leads, setLeads] = useState<Lead[]>(propLeads ?? []);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [activityUserId, setActivityUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // follow-up modal state
  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null);

  // filters & pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Sync local when parent prop changes
  useEffect(() => {
    setLeads(propLeads ?? []);
    setPage(1);
  }, [propLeads]);

  const getStatusBadgeVariant = (status?: Lead["status"]) => {
    switch (status) {
      case "new":
        return "default";
      case "contacted":
        return "secondary";
      case "converted":
        return "default";
      default:
        return "default";
    }
  };

  // filtered leads (frontend)
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        (lead.fullName || "").toLowerCase().includes(q) ||
        (lead.email || "").toLowerCase().includes(q) ||
        (lead.phone || "").includes(q);

      const matchStatus = !statusFilter || statusFilter === "all" || lead.status === statusFilter;

      const leadDate = new Date(lead.createdAt || lead.receivedAt || Date.now());
      const matchDate =
        (!startDate || leadDate >= new Date(startDate)) &&
        (!endDate || leadDate <= new Date(endDate + "T23:59:59"));

      return matchSearch && matchStatus && matchDate;
    });
  }, [leads, search, statusFilter, startDate, endDate]);

  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, page]);

  // Local status update function (optimistic UI + backend)
  const handleLocalStatusChange = async (leadId: string, newStatus: Lead["status"]) => {
    setLoading(true);
    const token = sessionStorage.getItem("token") || "";

    // optimistic update
    const prev = leads;
    const updated = leads.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l));
    setLeads(updated);
    onLeadsChange?.(updated); // notify parent if provided (so parent can recompute stats from leads)
    refreshStats?.();

    try {
      // If parent provided its own updater, use it (so parent can control refresh)
      if (onUpdateStatus) {
        await onUpdateStatus(leadId, newStatus);
      } else {
        // otherwise call API directly
        const ok = await updateLead(leadId, { status: newStatus }, token);
        if (!ok) {
          // rollback
          setLeads(prev);
          onLeadsChange?.(prev);
          refreshStats?.();
          alert("Server update failed — status rolled back.");
        } else {
          // success — optionally refresh parent stats from backend if they'd like
          refreshStats?.();
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
      setLeads(prev);
      onLeadsChange?.(prev);
      refreshStats?.();
      alert("Error updating status.");
    } finally {
      setLoading(false);
    }
  };

  // Follow-up modal open
  const openFollowUpModal = (lead: Lead) => {
    const safeLead: Lead = {
      ...lead,
      followUp: {
        date: lead.followUp?.date ?? null,
        recurrence: lead.followUp?.recurrence ?? null,
        message: lead.followUp?.message ?? null,
        whatsappOptIn: !!lead.followUp?.whatsappOptIn,
        active: !!lead.followUp?.active,
      },
    } as Lead;
    setFollowUpLead(safeLead);
  };

  // Save follow-up (backend + local)
  const saveFollowUp = async (leadId: string, followUp: any) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || "";
      const ok = await updateLead(leadId, { followUp }, token);
      if (!ok) {
        alert("Failed to save follow-up on server.");
        return;
      }
      const updated = leads.map((l) => (l._id === leadId ? { ...l, followUp } : l));
      setLeads(updated);
      onLeadsChange?.(updated);
      setFollowUpLead(null);
      refreshStats?.();
    } catch (err) {
      console.error(err);
      alert("Error saving follow-up.");
    } finally {
      setLoading(false);
    }
  };

  // Save edited lead (backend + local)
  const saveEditedLead = async (lead: Lead) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || "";
      const ok = await updateLead(lead._id, lead, token);
      if (!ok) {
        alert("Failed to save lead.");
        return;
      }
      const updated = leads.map((p) => (p._id === lead._id ? lead : p));
      setLeads(updated);
      onLeadsChange?.(updated);
      setEditingLead(null);
      refreshStats?.();
    } catch (err) {
      console.error(err);
      alert("Error saving lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 items-end justify-between border-b pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px]"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>

        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[150px]" />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[150px]" />

        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setStartDate("");
            setEndDate("");
            setStatusFilter("");
          }}
        >
          Reset
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Follow-Up</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedLeads.length > 0 ? (
              paginatedLeads.map((lead) => (
                <TableRow key={lead._id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{lead.fullName}</div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" /> {lead.email || "—"}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" /> {lead.phone || "—"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm truncate max-w-xs" title={lead.message || "N/A"}>
                      {lead.message || "—"}
                    </p>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {lead.createdAt ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }) : "—"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={lead.status || "new"}
                      onValueChange={(v) => handleLocalStatusChange(lead._id, v as Lead["status"])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    {lead.followUp?.active && lead.followUp?.date ? (
                      <Badge className="bg-blue-600 text-white">
                        {formatDistanceToNow(new Date(lead.followUp.date), { addSuffix: true })}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">No Follow-up</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right space-x-1">
                    <Button
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsMessageModalOpen(true);
                        onSendMessage?.(lead);
                      }}
                      size="sm"
                      variant="outline"
                      className="hover:bg-blue-600 hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>

                    <Button onClick={() => setEditingLead(lead)} size="sm" variant="outline" className="hover:bg-amber-500 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button onClick={() => openFollowUpModal(lead)} size="sm" variant="outline" className="hover:bg-indigo-600 hover:text-white">
                      <Clock className="h-4 w-4" />
                    </Button>

                    <Button onClick={() => setActivityUserId(lead._id)} size="sm" variant="outline" className="hover:bg-green-600 hover:text-white">
                      <FileText className="h-4 w-4" />
                    </Button>

                    <Button onClick={() => onDeleteLead?.(lead._id)} size="sm" variant="destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No leads found with selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between px-4 pb-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>

        <span className="text-sm">
          Page {page} of {Math.max(1, Math.ceil(filteredLeads.length / pageSize))}
        </span>

        <Button disabled={page >= Math.ceil(filteredLeads.length / pageSize)} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[hsl(253.33_14.75%_11.96%)] rounded-lg shadow-xl p-6 w-96 space-y-3">
            <h2 className="text-lg font-semibold text-center">Edit Lead</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={editingLead.fullName || ""}
              onChange={(e) => setEditingLead({ ...editingLead, fullName: e.target.value })}
              className="w-full border p-2 rounded"
              style={{ backgroundColor: "hsl(250deg 13.04% 9.02%)" }}
            />

            <input
              type="email"
              placeholder="Email"
              value={editingLead.email || ""}
              onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
              className="w-full border p-2 rounded"
              style={{ backgroundColor: "hsl(250deg 13.04% 9.02%)" }}
            />

            <input
              type="text"
              placeholder="Phone"
              value={editingLead.phone || ""}
              onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
              className="w-full border p-2 rounded"
              style={{ backgroundColor: "hsl(250deg 13.04% 9.02%)" }}
            />

            <textarea
              placeholder="Message"
              value={editingLead.message || ""}
              onChange={(e) => setEditingLead({ ...editingLead, message: e.target.value })}
              className="w-full border p-2 rounded"
              style={{ backgroundColor: "hsl(250deg 13.04% 9.02%)" }}
            />

            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={() => setEditingLead(null)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={() => saveEditedLead(editingLead)} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-Up Modal */}
      {followUpLead && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[#1c1a23] rounded-lg shadow-xl p-6 w-[520px] max-w-full space-y-4">
            <h3 className="text-lg font-semibold">Follow-up — {followUpLead.fullName}</h3>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-sm">Date & Time</span>
                <input
                  type="datetime-local"
                  value={
                    followUpLead.followUp?.date
                      ? new Date(followUpLead.followUp.date).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFollowUpLead({
                      ...followUpLead,
                      followUp: { ...followUpLead.followUp, date: e.target.value ? new Date(e.target.value).toISOString() : null },
                    })
                  }
                  className="border p-2 rounded"
                  style={{ backgroundColor: "hsl(250deg 13.04% 9.02%)" }}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm">Recurrence</span>
                <select
                  value={followUpLead.followUp?.recurrence || ""}
                  onChange={(e) => setFollowUpLead({ ...followUpLead, followUp: { ...followUpLead.followUp, recurrence: e.target.value } })}
                  className="border p-2 rounded"
                  style={{ backgroundColor: "hsl(250deg 13.04% 9.02%)" }}
                >
                  <option value="">Once</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="3days">3 days</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>

              <label className="col-span-2 flex flex-col">
                <span className="text-sm">Message</span>
                <textarea
                  value={followUpLead.followUp?.message || ""}
                  onChange={(e) => setFollowUpLead({ ...followUpLead, followUp: { ...followUpLead.followUp, message: e.target.value } })}
                  className="border p-2 rounded min-h-[80px]"
                  style={{ backgroundColor: "hsl(250deg 13.04% 9.02%)" }}
                />
              </label>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!followUpLead.followUp?.whatsappOptIn}
                    onChange={(e) => setFollowUpLead({ ...followUpLead, followUp: { ...followUpLead.followUp, whatsappOptIn: e.target.checked } })}
                  />
                  <span className="text-sm">Send on WhatsApp</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!followUpLead.followUp?.active}
                    onChange={(e) => setFollowUpLead({ ...followUpLead, followUp: { ...followUpLead.followUp, active: e.target.checked } })}
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFollowUpLead(null)}>
                Cancel
              </Button>
              <Button onClick={() => saveFollowUp(followUpLead._id, followUpLead.followUp)} disabled={loading}>
                {loading ? "Saving..." : "Save Follow-up"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activityUserId && <AdminActivityModal userId={activityUserId} onClose={() => setActivityUserId(null)} />}

      {selectedLead && (
        <SendMessageModal
          lead={selectedLead}
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setSelectedLead(null);
          }}
          onSend={() => {
            alert(`Message sent to ${selectedLead.fullName}`);
            setIsMessageModalOpen(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
};

export default LeadTable;
