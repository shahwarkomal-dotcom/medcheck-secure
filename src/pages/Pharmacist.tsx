import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import MedicineCard from "@/components/MedicineCard";
import { Input } from "@/components/ui/input";
import { Pill } from "lucide-react";

export default function Pharmacist() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    supabase.from("medicines").select("*").order("name").then(({ data }) => {
      setMedicines(data || []);
    });
  }, []);

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(filter.toLowerCase()) ||
    m.barcode.includes(filter)
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Medicine Inventory</h1>
        </div>
        <Input
          placeholder="Filter by name or barcode..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="space-y-3">
          {filtered.map((med) => (
            <MedicineCard
              key={med.id}
              name={med.name}
              manufacturer={med.manufacturer}
              barcode={med.barcode}
              expiryDate={med.expiry_date}
              isVerified={med.is_verified}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No medicines found.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
