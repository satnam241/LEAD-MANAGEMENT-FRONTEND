// src/components/AddLeadPage.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createLeadPublic } from "@/utils/api";

const AddLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, source: "admin-manual" };
      const res = await createLeadPublic(payload);
      if (res.success) {
        toast.success("Lead added");
        navigate("/dashboard");
      } else {
        console.error(res);
        toast.error(res.error || "Failed to add lead");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to add lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background p-4">
      <Card className="w-full max-w-md border border-muted">
        <CardHeader>
          <CardTitle>Add New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="fullName" placeholder="Full Name" onChange={handleChange} required value={form.fullName} />
            <Input name="email" placeholder="Email" type="email" onChange={handleChange} required value={form.email} />
            <Input name="phone" placeholder="Phone" onChange={handleChange} required value={form.phone} />
            <Input name="message" placeholder="Message" onChange={handleChange} value={form.message} />
            <Button type="submit" className="w-full bg-primary text-white" disabled={loading}>
              {loading ? "Adding..." : "Add Lead"}
            </Button>
          </form>
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={() => navigate("/dashboard")}
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLeadPage;
