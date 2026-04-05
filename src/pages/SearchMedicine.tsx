import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import MedicineCard from "@/components/MedicineCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchMedicine() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .ilike("name", `%${query}%`);

    if (error) {
      setResults([]);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Search Medicine</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Enter medicine name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {loading && <p className="text-sm text-muted-foreground text-center">Searching...</p>}

        {searched && !loading && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No medicines found matching your search.</p>
        )}

        <div className="space-y-3">
          {results.map((med) => (
            <MedicineCard
              key={med.id}
              name={med.name}
              manufacturer={med.manufacturer}
              barcode={med.barcode}
              expiryDate={med.expiry_date}
              isVerified={med.is_verified}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
