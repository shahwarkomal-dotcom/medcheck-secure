import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MedicineCardProps {
  name: string;
  manufacturer: string;
  barcode: string;
  expiryDate: string;
  isVerified: boolean;
}

export default function MedicineCard({ name, manufacturer, barcode, expiryDate, isVerified }: MedicineCardProps) {
  const isExpired = new Date(expiryDate) < new Date();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{manufacturer}</p>
          </div>
          {isVerified ? (
            <Badge className="bg-success text-success-foreground gap-1">
              <CheckCircle className="h-3 w-3" /> Verified
            </Badge>
          ) : (
            <Badge className="bg-warning text-warning-foreground gap-1">
              <AlertTriangle className="h-3 w-3" /> Unverified
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Barcode: {barcode}</span>
          <span className={isExpired ? "text-destructive font-medium" : "text-success font-medium"}>
            {isExpired ? (
              <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Expired</span>
            ) : (
              <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Safe</span>
            )}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Expiry: {new Date(expiryDate).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
