import { useNavigate } from "react-router-dom";
import { ScanLine, Search, AlertTriangle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";

const actions = [
  { icon: ScanLine, label: "Scan Medicine", description: "Scan barcode to verify", path: "/scan", color: "text-primary" },
  { icon: Search, label: "Search Medicine", description: "Search by name", path: "/search", color: "text-success" },
  { icon: AlertTriangle, label: "Report Fake", description: "Report suspicious medicine", path: "/report", color: "text-destructive" },
];

export default function Index() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MedsConnect</h1>
            <p className="text-sm text-muted-foreground">
              Welcome{profile?.name ? `, ${profile.name}` : ""}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</h2>
          {actions.map(({ icon: Icon, label, description, path, color }) => (
            <Card key={path} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(path)}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
