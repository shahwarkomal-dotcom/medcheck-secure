import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function Report() {
  const { user } = useAuth();
  const [medicineName, setMedicineName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to report");
      return;
    }
    setLoading(true);

    try {
      let imageUrl: string | null = null;

      if (image) {
        const ext = image.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("report-images")
          .upload(path, image);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("report-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("reports").insert({
        user_id: user.id,
        medicine_name: medicineName,
        description,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast.success("Report submitted successfully");
      setMedicineName("");
      setDescription("");
      setImage(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle>Report Fake Medicine</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medicine Name</Label>
              <Input
                id="med-name"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
                placeholder="Enter medicine name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe why you think this medicine is fake..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Upload Image (optional)</Label>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="image"
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  {image ? image.name : "Choose file"}
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
