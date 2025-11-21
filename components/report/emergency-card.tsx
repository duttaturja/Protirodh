// components/report/emergency-card.tsx
import { Phone } from "lucide-react";

const CONTACTS: Record<string, { police: string, hospital: string }> = {
  "Dhaka": { police: "999", hospital: "10655" },
  "Chittagong": { police: "031-620111", hospital: "031-619400" },
  "Rajshahi": { police: "0721-774444", hospital: "0721-772633" },
  // Default fallback
  "default": { police: "999", hospital: "16263" }
};

export function EmergencyCard({ division }: { division: string }) {
  const info = CONTACTS[division] || CONTACTS["default"];

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mt-6">
      <h3 className="font-bold text-destructive mb-3 flex items-center gap-2">
         <Phone className="w-4 h-4" /> Emergency Contacts ({division})
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <a href={`tel:${info.police}`} className="flex flex-col items-center bg-background p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
           <span className="text-sm font-bold">Police</span>
           <span className="text-lg font-black text-primary">{info.police}</span>
        </a>
        <a href={`tel:${info.hospital}`} className="flex flex-col items-center bg-background p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
           <span className="text-sm font-bold">Ambulance</span>
           <span className="text-lg font-black text-primary">{info.hospital}</span>
        </a>
      </div>
    </div>
  );
}