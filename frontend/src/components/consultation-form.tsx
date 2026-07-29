import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/state/app-state";
import type { Consultation } from "@/mock/data";
import { Save, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConsultationFormProps {
  appointmentId: string;
  consultation?: Consultation;
  className?: string;
  rows?: number;
}

/**
 * Notes stay a private draft until the doctor sends them, so once a
 * consultation is shared there is no way back to draft — any further edit the
 * doctor saves is immediately visible to the patient.
 */
export function ConsultationForm({
  appointmentId,
  consultation,
  className,
  rows = 5,
}: ConsultationFormProps) {
  const { saveConsultation } = useAppState();
  const [notes, setNotes] = useState(consultation?.notes ?? "");
  const [busy, setBusy] = useState<"draft" | "send" | null>(null);

  const shared = Boolean(consultation?.shared);

  async function save(share: boolean) {
    setBusy(share ? "send" : "draft");
    try {
      await saveConsultation(appointmentId, notes, share);
      toast.success(share ? "Consultation sent to patient" : "Draft saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the consultation");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">Consultation notes</div>
        {consultation && (
          <Badge variant={shared ? "default" : "outline"} className={shared ? "bg-brand text-brand-foreground" : ""}>
            {shared ? "Sent to patient" : "Draft"}
          </Badge>
        )}
      </div>

      <Textarea
        rows={rows}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Diagnosis, prescription, follow-up instructions..."
      />

      <p className="text-xs text-muted-foreground">
        {shared
          ? "The patient can already see these notes. Saving changes updates what they see."
          : "Drafts are private. The patient only sees these notes once you send them."}
      </p>

      <div className="flex flex-wrap justify-end gap-2">
        {!shared && (
          <Button variant="outline" disabled={busy !== null} onClick={() => save(false)}>
            <Save className="size-4" />
            {busy === "draft" ? "Saving..." : "Save draft"}
          </Button>
        )}
        <Button
          className="bg-brand text-brand-foreground hover:bg-brand/90"
          disabled={busy !== null || !notes.trim()}
          onClick={() => save(true)}
        >
          <Send className="size-4" />
          {busy === "send" ? "Sending..." : shared ? "Save changes" : "Send to patient"}
        </Button>
      </div>
    </div>
  );
}
