import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import MedicineCard from "@/components/MedicineCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Camera } from "lucide-react";
import { toast } from "sonner";

export default function Scan() {
  const [scanning, setScanning] = useState(false);
  const [medicine, setMedicine] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setMedicine(null);
    setNotFound(false);
    setScanning(true);

    try {
      const scanner = new Html5Qrcode("scanner");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          await scanner.stop();
          scannerRef.current = null;
          setScanning(false);
          lookupBarcode(decodedText);
        },
        () => {}
      );
    } catch (err) {
      toast.error("Camera access denied or unavailable");
      setScanning(false);
    }
  };

  const lookupBarcode = async (barcode: string) => {
    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .eq("barcode", barcode)
      .limit(1);

    if (error) {
      toast.error("Error looking up medicine");
      return;
    }

    if (data && data.length > 0) {
      setMedicine(data[0]);
      setNotFound(false);
    } else {
      setMedicine(null);
      setNotFound(true);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Scan Medicine</h1>
        <p className="text-sm text-muted-foreground">
          Use your camera to scan a medicine barcode
        </p>

        {!scanning && !medicine && !notFound && (
          <Button onClick={startScanner} className="w-full gap-2">
            <Camera className="h-4 w-4" /> Start Scanner
          </Button>
        )}

        <div id="scanner" className={scanning ? "rounded-lg overflow-hidden" : "hidden"} />

        {scanning && (
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              if (scannerRef.current) await scannerRef.current.stop();
              scannerRef.current = null;
              setScanning(false);
            }}
          >
            Stop Scanner
          </Button>
        )}

        {medicine && (
          <MedicineCard
            name={medicine.name}
            manufacturer={medicine.manufacturer}
            barcode={medicine.barcode}
            expiryDate={medicine.expiry_date}
            isVerified={medicine.is_verified}
          />
        )}

        {notFound && (
          <Card className="border-warning">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <h3 className="font-semibold">Medicine Not Verified</h3>
                <p className="text-sm text-muted-foreground">
                  This barcode was not found in our verified database. Exercise caution.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {(medicine || notFound) && (
          <Button variant="outline" className="w-full" onClick={startScanner}>
            Scan Another
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
