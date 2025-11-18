import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Trash, Edit, Save, PlusCircle, X, Filter } from "lucide-react";
import {
  fetchActivities,
  addActivity,
  updateActivity,
  deleteActivity,
} from "@/utils/api";

interface Activity {
  _id: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  isEditing?: boolean;
}

interface Props {
  userId: string;
  onClose: () => void;
}

const AdminActivityModal = ({ userId, onClose }: Props) => {
  const [logs, setLogs] = useState<Activity[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Activity[]>([]);
  const [newLog, setNewLog] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔍 Filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🧩 Fetch all activities from backend
  const loadLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const data = await fetchActivities(userId + (queryParams ? `?${queryParams}` : ""));
      setLogs(data);
      setFilteredLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [userId, startDate, endDate]);

  // 🔹 Apply text filter
  useEffect(() => {
    if (!search.trim()) setFilteredLogs(logs);
    else {
      const term = search.toLowerCase();
      setFilteredLogs(
        logs.filter((log) => log.text.toLowerCase().includes(term))
      );
    }
  }, [search, logs]);

  // ➕ Add new log
  const handleAddLog = async () => {
    if (!newLog.trim()) return alert("Please write something!");
    try {
      const newEntry = await addActivity({ userId, text: newLog.trim() });
      setLogs([newEntry, ...logs]);
      setNewLog("");
    } catch {
      alert("Error adding activity");
    }
  };

  // ✏️ Edit log
  const handleEditLog = (id: string) => {
    setLogs(logs.map((l) => (l._id === id ? { ...l, isEditing: !l.isEditing } : l)));
  };

  // 💾 Save edit
  const handleSaveEdit = async (id: string, text: string) => {
    try {
      const updated = await updateActivity(id, text);
      setLogs(logs.map((l) => (l._id === id ? updated : l)));
    } catch {
      alert("Error updating");
    }
  };

  // 🗑️ Delete log
  const handleDeleteLog = async (id: string) => {
    if (!confirm("Delete this activity?")) return;
    try {
      await deleteActivity(id);
      setLogs(logs.filter((l) => l._id !== id));
    } catch {
      alert("Error deleting activity");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
     <div className="bg-[#1c1a23] p-6 rounded-2xl shadow-xl w-[700px] max-h-[85vh] overflow-y-auto relative">
   {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">
          🧾 Activity Log for User
        </h2>

        {/* 🔍 Filter Controls */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[200px]"
            />
          </div>

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
              loadLogs();
            }}
          >
            Reset
          </Button>
        </div>

        {/* ➕ Add new activity */}
        <div className="flex items-start gap-2 mb-4">
          <Textarea
            placeholder="Write a new activity note..."
            value={newLog}
            onChange={(e) => setNewLog(e.target.value)}
            className="flex-1 min-h-[70px]"
          />
          <Button onClick={handleAddLog} disabled={loading}>
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {/* 🧩 Activity List */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No activities found.
          </p>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log._id}
              className="border p-3 rounded-lg mb-2 flex justify-between items-start"
            >
              {log.isEditing ? (
                <Textarea
                  defaultValue={log.text}
                  onChange={(e) => (log.text = e.target.value)}
                  className="flex-1 mr-2"
                />
              ) : (
                <div className="flex-1">
                  <p className="text-gray-800">{log.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {log.isEditing ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveEdit(log._id, log.text)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditLog(log._id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteLog(log._id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminActivityModal;
