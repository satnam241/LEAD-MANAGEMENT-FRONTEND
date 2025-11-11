import { useState, useEffect, useMemo } from "react";
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
import {
  Input
} from "@/components/ui/input";
import {
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash,
  FileText,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Lead, updateLead } from "@/utils/api";
import SendMessageModal from "@/components/SendMessageModal";
import AdminActivityModal from "@/components/AdminActivityModal";

// 🧩 Contact Counter
const ContactCounter = ({
  initialCount = 0,
  onChange,
}: {
  initialCount?: number;
  onChange?: (newCount: number) => void;
}) => {
  const [count, setCount] = useState(initialCount);
  const handleChange = (val: number) => {
    const newCount = Math.max(val, 0);
    setCount(newCount);
    onChange?.(newCount);
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => handleChange(count - 1)}>
        −
      </Button>
      <Badge variant="outline" className="text-xs px-3 py-1">
        {count}
      </Badge>
      <Button size="sm" variant="outline" onClick={() => handleChange(count + 1)}>
        +
      </Button>
    </div>
  );
};

interface LeadTableProps {
  leads: Lead[];
  onSendMessage: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: Lead["status"]) => void;
  onDeleteLead: (leadId: string) => void;
}

const LeadTable = ({
  leads,
  onSendMessage,
  onUpdateStatus,
  onDeleteLead,
}: LeadTableProps) => {
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [activityUserId, setActivityUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token");

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

  // 🔍 Filtered Leads (frontend filtering)
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        search === "" ||
        lead.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(search.toLowerCase())) ||
        (lead.phone && lead.phone.includes(search));

        const matchStatus =
        !statusFilter || statusFilter === "all" || lead.status === statusFilter;
      
      const leadDate = new Date(lead.createdAt);
      const matchDate =
        (!startDate || leadDate >= new Date(startDate)) &&
        (!endDate || leadDate <= new Date(endDate + "T23:59:59"));

      return matchSearch && matchStatus && matchDate;
    });
  }, [leads, search, statusFilter, startDate, endDate]);

  // ✅ Save Lead Edit
  const handleSaveEdit = async () => {
    if (!editingLead) return;
    setLoading(true);
    const success = await updateLead(editingLead._id, editingLead, token);
    if (success) {
      alert("✅ Lead updated successfully!");
      setEditingLead(null);
    } else {
      alert("❌ Failed to update lead.");
    }
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col gap-4">

      {/* 🔍 FILTER BAR */}
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
        <Select
  value={statusFilter}
  onValueChange={(v) => setStatusFilter(v)}
>
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


        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-[150px]"
        />

        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-[150px]"
        />

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

      {/* 🧾 Leads Table */}
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <TableRow key={lead._id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{lead.fullName}</div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {lead.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        {lead.phone}
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
                      {lead.createdAt
                        ? formatDistanceToNow(new Date(lead.createdAt), {
                            addSuffix: true,
                          })
                        : "N/A"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value: Lead["status"]) =>
                        onUpdateStatus(lead._id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
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
                    <ContactCounter
                      initialCount={lead.extraFields?.contactCount || 0}
                    />
                  </TableCell>

                  <TableCell className="text-right space-x-1">
                    <Button
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsMessageModalOpen(true);
                      }}
                      
                      size="sm"
                      variant="outline"
                      className="hover:bg-blue-600 hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() => setEditingLead(lead)}
                      size="sm"
                      variant="outline"
                      className="hover:bg-amber-500 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() => setActivityUserId(lead._id)}
                      size="sm"
                      variant="outline"
                      className="hover:bg-green-600 hover:text-white"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() => onDeleteLead(lead._id)}
                      size="sm"
                      variant="destructive"
                    >
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

      {/* ✅ Modals */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 space-y-3">
            <h2 className="text-lg font-semibold text-center">Edit Lead</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={editingLead.fullName}
              onChange={(e) =>
                setEditingLead({ ...editingLead, fullName: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={editingLead.email}
              onChange={(e) =>
                setEditingLead({ ...editingLead, email: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Phone"
              value={editingLead.phone}
              onChange={(e) =>
                setEditingLead({ ...editingLead, phone: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <textarea
              placeholder="Message"
              value={editingLead.message}
              onChange={(e) =>
                setEditingLead({ ...editingLead, message: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => setEditingLead(null)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activityUserId && (
        <AdminActivityModal
          userId={activityUserId}
          onClose={() => setActivityUserId(null)}
        />
      )}

      {selectedLead && (
        <SendMessageModal
          lead={selectedLead}
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          onSend={() => {
            alert(`Message sent to ${selectedLead.fullName}`);
            setIsMessageModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default LeadTable;
