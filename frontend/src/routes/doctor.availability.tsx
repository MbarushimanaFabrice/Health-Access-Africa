import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { DoctorLayout } from "@/components/doctor-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import * as availabilityApi from "@/lib/api/availability";
import type { ApiAvailabilitySlot } from "@/lib/api/types";
import { CalendarPlus, Clock, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctor/availability")({
  component: DoctorAvailability,
  head: () => ({ meta: [{ title: "Availability — Doctor" }] }),
});

const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

const SLOTS_KEY = ["availability", "me"] as const;

function DoctorAvailability() {
  const queryClient = useQueryClient();
  const [dates, setDates] = useState<Date[]>([]);
  const [times, setTimes] = useState<string[]>([]);

  const slotsQuery = useQuery({
    queryKey: SLOTS_KEY,
    queryFn: () => availabilityApi.getMySlots(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: SLOTS_KEY });

  const createMutation = useMutation({
    mutationFn: (input: availabilityApi.CreateSlotsInput) => availabilityApi.createSlots(input),
    onSuccess: (result) => {
      invalidate();
      setDates([]);
      setTimes([]);
      const skipped = result.skipped ? ` (${result.skipped} already existed)` : "";
      toast.success(`${result.created} slot${result.created === 1 ? "" : "s"} created${skipped}`);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not create slots"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => availabilityApi.deleteSlot(id),
    onSuccess: () => {
      invalidate();
      toast.success("Slot removed");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not remove slot"),
  });

  const slots = slotsQuery.data ?? [];
  const byDate = useMemo(() => {
    const map = new Map<string, ApiAvailabilitySlot[]>();
    for (const slot of slots) {
      const key = slot.date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  const bookedCount = slots.filter((s) => s.appointmentId).length;
  const totalNew = dates.length * times.length;

  const toggleTime = (t: string) =>
    setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()));

  const submit = () => {
    createMutation.mutate({
      dates: dates.map((d) => format(d, "yyyy-MM-dd")).sort(),
      times,
    });
  };

  return (
    <DoctorLayout>
      <PageHeader
        title="My Availability"
        subtitle="Pick the days and times you are available. Patients can only book these slots."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/60 shadow-[var(--shadow-card)] xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Create slots</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-medium">1. Select days</div>
              <Calendar
                mode="multiple"
                selected={dates}
                onSelect={(d) => setDates(d ?? [])}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                className="pointer-events-auto rounded-md border"
              />
              {dates.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[...dates]
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((d) => (
                      <Badge key={d.toISOString()} variant="outline" className="gap-1 rounded-full">
                        {format(d, "d MMM")}
                        <button
                          onClick={() => setDates((prev) => prev.filter((x) => x.getTime() !== d.getTime()))}
                          aria-label={`Remove ${format(d, "d MMM")}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">2. Select times</span>
                <button
                  className="text-xs text-brand hover:underline"
                  onClick={() => setTimes(times.length === TIME_OPTIONS.length ? [] : [...TIME_OPTIONS])}
                >
                  {times.length === TIME_OPTIONS.length ? "Clear all" : "Select all"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTime(t)}
                    className={cn(
                      "rounded-lg border py-2 text-sm font-medium transition",
                      times.includes(t)
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <Separator className="my-4" />

              <p className="text-sm text-muted-foreground">
                {totalNew > 0
                  ? `${totalNew} slot${totalNew === 1 ? "" : "s"} will be created (${dates.length} day${dates.length === 1 ? "" : "s"} × ${times.length} time${times.length === 1 ? "" : "s"}).`
                  : "Select at least one day and one time."}
              </p>
              <Button
                className="mt-3 w-full bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={totalNew === 0 || createMutation.isPending}
                onClick={submit}
              >
                <CalendarPlus className="size-4" />
                {createMutation.isPending ? "Creating…" : "Create slots"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">
              Upcoming slots
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {slots.length - bookedCount} open · {bookedCount} booked
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {slotsQuery.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {!slotsQuery.isLoading && byDate.length === 0 && (
              <div className="rounded-xl bg-muted/60 p-6 text-center text-sm text-muted-foreground">
                No upcoming availability yet.
              </div>
            )}
            {byDate.map(([date, daySlots]) => (
              <div key={date}>
                <div className="mb-2 text-sm font-semibold">
                  {format(parseISO(date), "EEEE, d MMMM yyyy")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm",
                        slot.appointmentId
                          ? "border-brand/40 bg-brand-soft text-brand"
                          : "border-border"
                      )}
                      title={
                        slot.appointment
                          ? `Booked by ${slot.appointment.patient.fullName}`
                          : "Open slot"
                      }
                    >
                      <Clock className="size-3.5" />
                      {slot.startTime}
                      {slot.appointmentId ? (
                        <span className="text-xs">· {slot.appointment?.patient.fullName}</span>
                      ) : (
                        <button
                          onClick={() => deleteMutation.mutate(slot.id)}
                          disabled={deleteMutation.isPending}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${slot.startTime} slot`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}
