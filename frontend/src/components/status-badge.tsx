import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  Confirmed: "bg-brand-soft text-brand border-brand/20",
  Completed: "bg-brand-soft text-brand border-brand/20",
  Published: "bg-brand-soft text-brand border-brand/20",
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Draft: "bg-amber-100 text-amber-800 border-amber-200",
  Waiting: "bg-amber-100 text-amber-800 border-amber-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  Cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  "Not Started": "bg-slate-100 text-slate-700 border-slate-200",
  Active: "bg-brand-soft text-brand border-brand/20",
  Inactive: "bg-slate-100 text-slate-700 border-slate-200",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", map[status] ?? "", className)}
    >
      {status}
    </Badge>
  );
}
