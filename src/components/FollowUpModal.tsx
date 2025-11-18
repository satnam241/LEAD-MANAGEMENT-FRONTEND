import { useState } from "react";
import { Button } from "@/components/ui/button";

const FollowUpModal = ({ lead, onClose, onSave }) => {
  const [date, setDate] = useState(lead?.followUp?.date || "");
  const [recurrence, setRecurrence] = useState(lead?.followUp?.recurrence || "once");
  const [message, setMessage] = useState(lead?.followUp?.message || "");

  const handleSave = () => {
    onSave({
      date,
      recurrence,
      message,
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold text-center">Schedule Follow-Up</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Follow-Up Date</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Recurrence</label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="once">Once</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="3days">After 3 Days</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border p-2 rounded"
          ></textarea>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;
