import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck, Pill } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ReportStatus = Database["public"]["Enums"]["report_status"];

export default function Admin() {
  const [reports, setReports] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [newMed, setNewMed] = useState({ name: "", barcode: "", manufacturer: "", expiry_date: "", is_verified: true });

  const fetchReports = async () => {
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    setReports(data || []);
  };

  const fetchMedicines = async () => {
    const { data } = await supabase.from("medicines").select("*").order("name");
    setMedicines(data || []);
  };

  useEffect(() => {
    fetchReports();
    fetchMedicines();
  }, []);

  const updateReportStatus = async (id: string, status: ReportStatus) => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchReports();
    }
  };

  const addMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("medicines").insert(newMed);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Medicine added");
      setNewMed({ name: "", barcode: "", manufacturer: "", expiry_date: "", is_verified: true });
      fetchMedicines();
    }
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
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="reports">
          <TabsList className="w-full">
            <TabsTrigger value="reports" className="flex-1">Reports</TabsTrigger>
            <TabsTrigger value="medicines" className="flex-1">Medicines</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-3 mt-4">
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No reports yet.</p>
            ) : (
              reports.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{r.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={statusColor(r.status)}>{r.status.replace("_", " ")}</Badge>
                    </div>
                    {r.image_url && (
                      <img src={r.image_url} alt="Report" className="w-full rounded-md max-h-40 object-cover" />
                    )}
                    <Select
                      value={r.status}
                      onValueChange={(val) => updateReportStatus(r.id, val as ReportStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="fake_confirmed">Fake Confirmed</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="medicines" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4" /> Add Medicine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addMedicine} className="space-y-3">
                  <div className="space-y-1">
                    <Label>Name</Label>
                    <Input value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Barcode</Label>
                    <Input value={newMed.barcode} onChange={(e) => setNewMed({ ...newMed, barcode: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Manufacturer</Label>
                    <Input value={newMed.manufacturer} onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Expiry Date</Label>
                    <Input type="date" value={newMed.expiry_date} onChange={(e) => setNewMed({ ...newMed, expiry_date: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full">Add Medicine</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {medicines.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.manufacturer} · {m.barcode}</p>
                    </div>
                    <Badge variant={m.is_verified ? "default" : "secondary"}>
                      {m.is_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
