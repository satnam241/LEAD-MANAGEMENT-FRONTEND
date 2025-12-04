
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
  SelectSeparator,
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
import { Lead, updateLead, fetchLeads } from "@/utils/api";
import SendMessageModal from "@/components/SendMessageModal";
import AdminActivityModal from "@/components/AdminActivityModal";

interface LeadTableProps {
  leads: Lead[];
  onSendMessage?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
  onLeadsChange?: (newLeads: Lead[]) => void;
  onUpdateStatus?: (leadId: string, status: Lead["status"]) => Promise<void> | void;
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
  const [leads, setLeads] = useState<Lead[]>(propLeads ?? []);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [activityUserId, setActivityUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualCheck, setManualCheck] = useState<Record<string, boolean>>({});

  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);

// Load on page open


  const pageSize = 15;

  useEffect(() => {
    setLeads(propLeads ?? []);
    setPage(1);
  }, [propLeads]);
// State

// Load on page open
useEffect(() => {
  const saved = localStorage.getItem("manualCheckedLeads");
  if (saved) {
    setManualCheck(JSON.parse(saved));
  }
}, []);

// Toggle function
const toggleManualCheck = (id: string) => {
  setManualCheck(prev => {
    const updated = {
      ...prev,
      [id]: !prev[id],
    };

    localStorage.setItem("manualCheckedLeads", JSON.stringify(updated));

    return updated;
  });
}; 




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

  // -----------------------------------------------------
  // ❗ FINAL — NO FRONTEND FILTERING ANYMORE
  // -----------------------------------------------------
  const filteredLeads = leads;

  // Pagination stays same
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, page]);

  // -----------------------------------------------------
  // LOAD LEADS FROM BACKEND WITH FOLLOW-UP FILTER MAPPING
  // -----------------------------------------------------
  const loadLeads = async () => {
    const token = sessionStorage.getItem("token") || "";

    let followupFilter: string | undefined = undefined;
    if (statusFilter === "followup_today") followupFilter = "today";
    if (statusFilter === "followup_missed") followupFilter = "missed";
    if (statusFilter === "followup_week") followupFilter = "week";
    if (statusFilter === "followup_next24") followupFilter = "next24";

    const data = await fetchLeads(token, page, 10, {
      statusFilter,
      followupFilter,
      search,
      startDate,
      endDate,
    });

    setLeads(data.leads ?? []);
  };

  useEffect(() => {
    loadLeads();
  }, [page, statusFilter, search, startDate, endDate]);

  // -----------------------------------------------------
  // Update Lead Status
  // -----------------------------------------------------
  const handleLocalStatusChange = async (leadId: string, newStatus: Lead["status"]) => {
    setLoading(true);
    const token = sessionStorage.getItem("token") || "";

    const prev = leads;
    const updated = leads.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l));
    setLeads(updated);

    onLeadsChange?.(updated);
    refreshStats?.();

    try {
      if (onUpdateStatus) {
        await onUpdateStatus(leadId, newStatus);
      } else {
        const ok = await updateLead(leadId, { status: newStatus }, token);
        if (!ok) {
          setLeads(prev);
          onLeadsChange?.(prev);
          refreshStats?.();
          alert("Failed");
        } else {
          refreshStats?.();
        }
      }
    } catch {
      setLeads(prev);
      onLeadsChange?.(prev);
      refreshStats?.();
    } finally {
      setLoading(false);
    }
  };

  
  
  
  

  // -----------------------------------------------------
  // Follow-up
  // -----------------------------------------------------
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
    };
    setFollowUpLead(safeLead);
  };

  const saveFollowUp = async (leadId: string, followUp: any) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || "";
      const ok = await updateLead(leadId, { followUp }, token);

      if (!ok) return alert("Failed to save");

      const updated = leads.map((l) => (l._id === leadId ? { ...l, followUp } : l));
      setLeads(updated);
      onLeadsChange?.(updated);
      setFollowUpLead(null);
      refreshStats?.();
    } catch {
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // Edit Lead
  // -----------------------------------------------------
  const saveEditedLead = async (lead: Lead) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || "";
      const ok = await updateLead(lead._id, lead, token);

      if (!ok) return alert("Failed to save");

      const updated = leads.map((l) => (l._id === lead._id ? lead : l));
      setLeads(updated);
      onLeadsChange?.(updated);
      setEditingLead(null);
      refreshStats?.();
    } catch {
      alert("Error updating");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------

  return (
    <div className="relative flex flex-col gap-4">

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end justify-between border-b pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px]"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter Status / Follow-Up" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>

            <SelectSeparator />

            <SelectItem value="followup_today">Follow-Up Today</SelectItem>
            <SelectItem value="followup_missed">Missed Follow-Ups</SelectItem>
            <SelectItem value="followup_week">This Week Follow-Ups</SelectItem>
            <SelectItem value="followup_next24">Next 24 Hours</SelectItem>
          </SelectContent>
        </Select>

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
              <TableHead>Mark</TableHead>
              <TableHead>Follow-Up</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedLeads.length > 0 ? (
              paginatedLeads.map((lead) => (
                <TableRow key={lead._id}>

                  <TableCell>{lead.fullName}</TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <Mail className="inline h-3 w-3 mr-1" /> {lead.email || "—"} <br />
                      <Phone className="inline h-3 w-3 mr-1" /> {lead.phone || "—"}
                    </div>
                  </TableCell>

                  <TableCell className="max-w-xs truncate">
                    {lead.message || "—"}
                  </TableCell>

                  <TableCell>
                    {lead.createdAt
                      ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(v) =>
                        handleLocalStatusChange(lead._id, v as Lead["status"])
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue>
                          <Badge variant={getStatusBadgeVariant(lead.status)}>
                            {lead.status}
                          </Badge>
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
                  <input
  type="checkbox"
  checked={manualCheck[lead._id] || false}
  onChange={() => toggleManualCheck(lead._id)}
/>

</TableCell>


                  <TableCell>
                    {lead.followUp?.active && lead.followUp?.date ? (
                      <Badge className="bg-blue-600 text-white">
                        {formatDistanceToNow(new Date(lead.followUp.date), {
                          addSuffix: true,
                        })}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">No Follow-up</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsMessageModalOpen(true);
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingLead(lead)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openFollowUpModal(lead)}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActivityUserId(lead._id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteLead?.(lead._id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between px-4 py-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>

        <span>
          Page {page} of {Math.max(1, Math.ceil(filteredLeads.length / pageSize))}
        </span>

        <Button
          disabled={page >= Math.ceil(filteredLeads.length / pageSize)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[#1c1a23] p-6 rounded-lg w-96">
          
            <h2 className="text-lg font-semibold mb-3">Edit Lead</h2>

            <input
              type="text"
              value={editingLead.fullName ?? ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, fullName: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              style={{ backgroundColor: "#0d0c10", color: "white", borderColor: "#333" }}
              />

            <input
              type="email"
              value={editingLead.email ?? ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, email: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              style={{ backgroundColor: "#0d0c10", color: "white", borderColor: "#333" }}
              />

            <input
              type="text"
              value={editingLead.phone ?? ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, phone: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              style={{ backgroundColor: "#0d0c10", color: "white", borderColor: "#333" }}
              />

            <textarea
              value={editingLead.message ?? ""}
              onChange={(e) =>
                setEditingLead({ ...editingLead, message: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              style={{ backgroundColor: "#0d0c10", color: "white", borderColor: "#333" }}
              />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingLead(null)}>
                Cancel
              </Button>
              <Button onClick={() => saveEditedLead(editingLead)}>
                Save
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Follow-Up Modal */}
      {followUpLead && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[#1c1a23] p-6 rounded-lg w-[420px]">

            <h2 className="text-lg font-semibold mb-3">
              Follow-Up — {followUpLead.fullName}
            </h2>

            <input
              type="datetime-local"
              value={
                followUpLead.followUp?.date
                  ? new Date(followUpLead.followUp.date)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setFollowUpLead({
                  ...followUpLead,
                  followUp: {
                    ...followUpLead.followUp,
                    date: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  },
                })
              }
              className="w-full p-2 border rounded mb-2"
              style={{ backgroundColor: "#0d0c10", color: "white", borderColor: "#333" }}
              />

            <select
              value={followUpLead.followUp?.recurrence ?? ""}
              onChange={(e) =>
                setFollowUpLead({
                  ...followUpLead,
                  followUp: {
                    ...followUpLead.followUp,
                    recurrence: e.target.value,
                  },
                })
              }
              className="w-full p-2 border rounded mb-2"
              style={{ backgroundColor: "#0d0c10", color: "white", borderColor: "#333" }}
              >
              <option value="">Once</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="3days">3 Days</option>
              <option value="weekly">Weekly</option>
            </select>

            <textarea
              value={followUpLead.followUp?.message ?? ""}
              onChange={(e) =>
                setFollowUpLead({
                  ...followUpLead,
                  followUp: {
                    ...followUpLead.followUp,
                    message: e.target.value,
                  },
                })
              }
              className="w-full p-2 border rounded mb-3"
              style={{ backgroundColor: "#0d0c10", color: "white", borderColor: "#333" }}
              />

            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!followUpLead.followUp?.whatsappOptIn}
                  onChange={(e) =>
                    setFollowUpLead({
                      ...followUpLead,
                      followUp: {
                        ...followUpLead.followUp,
                        whatsappOptIn: e.target.checked,
                      },
                    })
                  }
                />
                WhatsApp
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!followUpLead.followUp?.active}
                  onChange={(e) =>
                    setFollowUpLead({
                      ...followUpLead,
                      followUp: {
                        ...followUpLead.followUp,
                        active: e.target.checked,
                      },
                    })
                  }
                />
                Active
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFollowUpLead(null)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  saveFollowUp(followUpLead._id, followUpLead.followUp)
                }
              >
                Save Follow-Up
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Activity Modal */}
      {activityUserId && (
        <AdminActivityModal
          userId={activityUserId}
          onClose={() => setActivityUserId(null)}
        />
      )}

      {/* Message Modal */}
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
          }}
        />
      )}

    </div>
  );
};

export default LeadTable;
