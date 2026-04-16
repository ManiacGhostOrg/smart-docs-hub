import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { getStoredAuth } from "@/lib/auth";
import { mockFiles, mockChatMessages, type UploadedFile, type ChatMessage, type Timestamp } from "@/lib/mock-data";
import { PortalSidebar } from "@/components/PortalSidebar";
import { MediaViewer } from "@/components/MediaViewer";
import { ChatPanel } from "@/components/ChatPanel";
import { UploadModal } from "@/components/UploadModal";

export const Route = createFileRoute("/portal")({
  component: PortalPage,
});

function PortalPage() {
  const navigate = useNavigate();
  const [files] = useState<UploadedFile[]>(mockFiles);
  const [isAuthed] = useState(() => !!getStoredAuth());

  useEffect(() => {
    if (!isAuthed) navigate({ to: "/login" });
  }, [isAuthed, navigate]);
  const [selectedFileId, setSelectedFileId] = useState<string>(mockFiles[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTimestamp, setActiveTimestamp] = useState<Timestamp | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];

  const handleSendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    // Mock AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on the indexed content of "${selectedFile.name}", I've synthesized the following insight: The query relates to key structural elements identified during analysis. Further context is available in the transcript segments.`,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setChatLoading(false);
    }, 1500);
  }, [selectedFile]);

  const handleTimestampClick = useCallback((ts: Timestamp) => {
    setActiveTimestamp(ts);
    // In production, this would seek the media player to ts.seconds
  }, []);

  const handleUpload = useCallback((_files: File[]) => {
    // In production: POST files to your backend for processing
    console.log("Uploading files:", _files.map((f) => f.name));
  }, []);

  if (!isAuthed) {
    return <div className="min-h-screen bg-obsidian-base flex items-center justify-center"><div className="size-2 rounded-full bg-aurora-cyan animate-pulse" /></div>;
  }

  return (
    <div className="relative h-dvh w-full bg-obsidian-base overflow-hidden font-sans flex p-4 gap-4 box-border">
      {/* Ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none opacity-15 blur-[120px]" style={{ background: "var(--aurora-violet)" }} />
      <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full pointer-events-none opacity-10 blur-[140px]" style={{ background: "var(--aurora-cyan)" }} />

      <PortalSidebar
        files={files}
        selectedFileId={selectedFileId}
        onSelectFile={setSelectedFileId}
        onUploadClick={() => setUploadOpen(true)}
      />

      <MediaViewer
        file={selectedFile}
        activeTimestamp={activeTimestamp}
        onTimestampClick={handleTimestampClick}
      />

      <ChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        onTimestampClick={handleTimestampClick}
        loading={chatLoading}
      />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
