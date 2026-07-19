# Project 2: Access Health Africa - Fabrice Mbarushimana (Standup 2)

## Status:

Continued from the last update: the platform is now deployed and the video consultation feature is implemented.

## Key Achievements (since last update):

- Deployed the backend and PostgreSQL database to Render, and the frontend to Vercel — the platform is now live.
- Implemented the video consultation feature using Jitsi Meet: a doctor starts a secure video call from a confirmed appointment, and the patient joins the same call from their appointments page.
- Added validations and access control around video calls:
  - Only the appointment's own doctor and patient can join a call.
  - Calls can only be started for confirmed appointments, and not for completed consultations.
  - The patient cannot join before the doctor has started the call.
  - Each call uses a randomly generated, unguessable room ID stored with the consultation record.
- When a doctor starts a call, the patient automatically receives an in-app notification with a link to join.
- Starting a video call automatically moves the consultation to "in progress" with its start time recorded.

## Challenges:

- The video meeting depends on an external service (Jitsi). On the free public server, the first participant (the doctor) must authenticate with a Google/GitHub account to become moderator, which adds friction. Avoiding this requires self-hosting Jitsi.
- There is no way to record or transcribe the call and save the transcript into the system, which blocks the AI consultation feature.
- All capable AI models are paid services, and their free trials only last a few days, which is not sustainable for development and testing
  ▎  because of this, the AI assistant has not been integrated yet.
- 
- Next Steps:
- Do live end-to-end testing on the deployed platform.
- Implement real-time notifications on the backend and frontend.
- Implement SMS reminders for upcoming meetings and appointments.
- Integrate the AI-assisted consultation feature using free options instead of paid models — such as the browser's built-in Web Speech API for live transcription, or open-source models like Whisper (self-hosted) and free-tier APIs like Google Gemini for symptom summaries.
- Build a new custom video consultation feature (e.g., using WebRTC) to replace Jitsi, so the call can support live transcription and saving the transcript into the system.
