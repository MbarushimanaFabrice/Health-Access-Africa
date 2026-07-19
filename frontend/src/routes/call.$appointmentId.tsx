import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/state/auth";
import { getOrCreateVideoRoom } from "@/lib/api/consultations";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/call/$appointmentId")({
  component: VideoCallPage,
  head: () => ({ meta: [{ title: "Video Consultation — Health Access Africa" }] }),
});

// NOTE: The unguessable room name (revealed only to the appointment's doctor
// and patient by the backend) is the access control on the public server.
//
// We use meet.jit.si — the only public instance that officially allows iframe
// embedding (community instances like meet.ffmuc.net block it via CSP
// frame-ancestors). meet.jit.si asks the FIRST participant to log in
// (Google/GitHub) to become moderator: in our flow that's the doctor, who logs
// in once (the browser remembers it); the patient joins afterwards with no
// login. A self-hosted Jitsi instance removes the prompt entirely — override
// with VITE_JITSI_DOMAIN when you have one.
const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || "meet.jit.si";

function VideoCallPage() {
  const { appointmentId } = Route.useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // JitsiMeeting injects an external script and needs `window`; render it only
  // after mount so SSR/hydration stays clean.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !currentUser) navigate({ to: "/login" });
  }, [mounted, currentUser, navigate]);

  const roomQuery = useQuery({
    queryKey: ["video-room", appointmentId],
    queryFn: () => getOrCreateVideoRoom(appointmentId),
    enabled: Boolean(currentUser),
    retry: false,
    staleTime: Infinity,
  });

  if (!mounted || !currentUser) return null;

  const backTo = currentUser.role === "doctor" ? "/doctor/appointments" : "/patient/appointments";

  if (roomQuery.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> Preparing your video consultation...
        </div>
      </div>
    );
  }

  if (roomQuery.isError || !roomQuery.data?.videoRoomId) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-xl font-semibold">Call not available</h1>
          <p className="text-sm text-muted-foreground">
            {roomQuery.error instanceof Error
              ? roomQuery.error.message
              : "The video call for this appointment is not available yet."}
          </p>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => navigate({ to: backTo })}
          >
            <ArrowLeft className="size-4" /> Back to appointments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black">
      <JitsiMeeting
        domain={JITSI_DOMAIN}
        roomName={roomQuery.data.videoRoomId}
        userInfo={{ displayName: currentUser.name, email: "" }}
        configOverwrite={{
          prejoinConfig: { enabled: false },
          startWithAudioMuted: false,
          disableDeepLinking: true,
          toolbarButtons: [
            "microphone",
            "camera",
            "chat",
            "desktop",
            "fullscreen",
            "tileview",
            "hangup",
          ],
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          MOBILE_APP_PROMO: false,
        }}
        onReadyToClose={() => navigate({ to: backTo })}
        getIFrameRef={(node) => {
          node.style.height = "100%";
          node.style.width = "100%";
        }}
      />
    </div>
  );
}
