import { useState, useEffect } from "react";
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
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Lead, updateLead } from "@/utils/api";
import SendMessageModal from "@/components/SendMessageModal";

// 🧩 Local storage activity logger
const useActivityLog = () => {
  const [logs, setLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem("activityLogs");
    return saved ? JSON.parse(saved) : [];
  });

  const addLog = (entry: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLogs = [`[${timestamp}] ${entry}`, ...logs].slice(0, 100);
    setLogs(newLogs);
    localStorage.setItem("activityLogs", JSON.stringify(newLogs));
  };

  return { logs, addLog };
};

// 🧩 Frontend-only counter
const ContactCounter = ({
  initialCount = 0,
  onChange,
  onLog,
}: {
  initialCount?: number;
  onChange?: (newCount: number) => void;
  onLog?: (msg: string) => void;
}) => {
  const [count, setCount] = useState(initialCount);

  const handleChange = (val: number, action: string) => {
    const newCount = Math.max(val, 0);
    setCount(newCount);
    onChange?.(newCount);
    onLog?.(`Contact count ${action} → ${newCount}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleChange(count - 1, "decremented")}
        className="px-2 py-1 text-lg"
      >
        −
      </Button>

      <Badge variant="outline" className="text-xs px-3 py-1">
        {count}
      </Badge>

      <Button
        size="sm"
        variant="outline"
        onClick={() => handleChange(count + 1, "incremented")}
        className="px-2 py-1 text-lg"
      >
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
  const [loading, setLoading] = useState(false);
  const { logs, addLog } = useActivityLog();

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

  const handleSaveEdit = async () => {
    if (!editingLead) return;
    setLoading(true);
    addLog(`Edited lead: ${editingLead.fullName}`);

    const success = await updateLead(editingLead._id, editingLead, token);

    if (success) {
      alert("✅ Lead updated successfully!");
      setEditingLead(null);
    } else {
      alert("❌ Failed to update lead.");
    }
    setLoading(false);
  };

  const handleSendMessage = (lead: Lead) => {
    setSelectedLead(lead);
    setIsMessageModalOpen(true);
    addLog(`Opened message modal for: ${lead.fullName}`);
  };

  const handleDeleteLead = (id: string) => {
    onDeleteLead(id);
    addLog(`Deleted lead with ID: ${id}`);
  };

  return (
    <div className="flex gap-6 relative">
      {/* Left side: Leads Table */}
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
            {leads.map((lead) => (
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
                  <p
                    className="text-sm truncate max-w-xs"
                    title={lead.message || "N/A"}
                  >
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
                    onValueChange={(value: Lead["status"]) => {
                      onUpdateStatus(lead._id, value);
                      addLog(
                        `Status changed for ${lead.fullName} → ${value.toUpperCase()}`
                      );
                    }}
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
                    onLog={(msg) => addLog(`${lead.fullName}: ${msg}`)}
                  />
                </TableCell>

                <TableCell className="text-right space-x-1">
                  <Button
                    onClick={() => handleSendMessage(lead)}
                    size="sm"
                    variant="outline"
                    className="hover:bg-blue-600 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => {
                      setEditingLead(lead);
                      addLog(`Editing lead: ${lead.fullName}`);
                    }}
                    size="sm"
                    variant="outline"
                    className="hover:bg-amber-500 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => handleDeleteLead(lead._id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Lead Modal */}
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
      </div>

      {/* Right side: Activity Log */}
      <div className="w-80 bg-muted/40 border-l rounded-lg p-3 h-[80vh] overflow-y-auto text-xs font-mono shadow-inner">
        <h3 className="font-semibold mb-2 text-center text-sm">
          🧾 Activity Log
        </h3>
        {logs.length > 0 ? (
          logs.map((log, i) => <div key={i}>{log}</div>)
        ) : (
          <p className="text-muted-foreground text-center">No activity yet.</p>
        )}
      </div>

      {/* Message Modal */}
      {selectedLead && (
        <SendMessageModal
          lead={selectedLead}
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          onSend={() => {
            addLog(`Message sent to ${selectedLead.fullName}`);
            setIsMessageModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default LeadTable;
