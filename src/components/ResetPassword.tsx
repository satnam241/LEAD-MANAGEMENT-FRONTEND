import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/utils/api";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast({ title: "Invalid Link", variant: "destructive" });
    setLoading(true);
    try {
      const data = await resetPassword(token, password);
      if (data.success) {
        toast({ title: "Password Reset", description: "You can login now" });
        navigate("/");
      } else toast({ title: "Error", description: data.error || "Failed", variant: "destructive" });
    } catch { toast({ title: "Server Error", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#242328]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <p className="text-gray-500 text-center">Enter your new password</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password" type="password" placeholder="Enter new password"
                value={password} onChange={(e) => setPassword(e.target.value)} required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
