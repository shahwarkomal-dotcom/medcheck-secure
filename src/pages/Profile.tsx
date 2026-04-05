import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      supabase
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setReports(data || []));
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning text-warning-foreground";
      case "reviewed": return "bg-primary text-primary-foreground";
      case "fake_confirmed": return "bg-destructive text-destructive-foreground";
      default: return "";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{profile?.name || "User"}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              {role && <Badge variant="secondary" className="mt-1 capitalize">{role}</Badge>}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          {role === "admin" && (
            <Button variant="outline" className="flex-1" onClick={() => navigate("/admin")}>
              Admin Dashboard
            </Button>
          )}
          {role === "pharmacist" && (
            <Button variant="outline" className="flex-1" onClick={() => navigate("/pharmacist")}>
              Pharmacist Panel
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No reports submitted yet.</p>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{r.medicine_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={statusColor(r.status)}>
                    {r.status.replace("_", " ")}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </AppLayout>
  );
}
