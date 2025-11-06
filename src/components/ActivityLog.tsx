import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash, Edit, Save, PlusCircle } from "lucide-react";

interface LogEntry {
  id: string;
  text: string;
  date: string;
  isEditing?: boolean;
}

const AdminActivityLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [newLog, setNewLog] = useState("");

  // 🔹 Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("adminActivityLogs");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  // 🔹 Save to localStorage whenever logs change
  useEffect(() => {
    localStorage.setItem("adminActivityLogs", JSON.stringify(logs));
  }, [logs]);

  // ➕ Add new log
  const handleAddLog = () => {
    if (!newLog.trim()) return alert("Please write something!");
    const newEntry: LogEntry = {
      id: Date.now().toString(),
      text: newLog.trim(),
      date: new Date().toLocaleString(),
    };
    setLogs([newEntry, ...logs]);
    setNewLog("");
  };

  // ✏️ Edit existing log
  const handleEditLog = (id: string) => {
    setLogs(
      logs.map((log) =>
        log.id === id ? { ...log, isEditing: !log.isEditing } : log
      )
    );
  };

  // 💾 Save edited log
  const handleSaveEdit = (id: string, newText: string) => {
    setLogs(
      logs.map((log) =>
        log.id === id
          ? { ...log, text: newText, isEditing: false, date: new Date().toLocaleString() }
          : log
      )
    );
  };

  // 🗑️ Delete log
  const handleDeleteLog = (id: string) => {
    if (confirm("Delete this activity?")) {
      setLogs(logs.filter((log) => log.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        🧾 Admin Activity Log
      </h2>

      {/* New Log Input */}
      <div className="flex items-start gap-2 mb-6">
        <Textarea
          placeholder="Write a new activity note..."
          value={newLog}
          onChange={(e) => setNewLog(e.target.value)}
          className="flex-1 min-h-[80px]"
        />
        <Button onClick={handleAddLog} className="h-12">
          <PlusCircle className="h-5 w-5 mr-1" /> Add
        </Button>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No activity yet. Write something above!
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                {log.isEditing ? (
                  <Textarea
                    defaultValue={log.text}
                    onChange={(e) => (log.text = e.target.value)}
                    className="flex-1 mr-2"
                  />
                ) : (
                  <p className="text-gray-800 whitespace-pre-line flex-1">
                    {log.text}
                  </p>
                )}

                <div className="flex gap-2">
                  {log.isEditing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveEdit(log.id, log.text)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditLog(log.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Last updated: {log.date}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminActivityLog;
