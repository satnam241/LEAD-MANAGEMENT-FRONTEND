import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ImportLeadsModal: React.FC<Props> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a CSV file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:4520/api/leads/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      alert(data.message);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">Import Leads (CSV)</h2>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full border p-2 rounded"
        />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleUpload} disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            {loading ? "Importing..." : "Upload CSV"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportLeadsModal;
