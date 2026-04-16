import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useRef } from "react";
import { getStoredAuth, logout } from "@/lib/auth";
import { apiListAssets, apiGetSummary, apiAskQuestion, apiGetPlayLink, type Asset, type ApiTimestamp } from "@/lib/api";
import { PortalSidebar } from "@/components/PortalSidebar";
import { MediaViewer } from "@/components/MediaViewer";
import { ChatPanel } from "@/components/ChatPanel";
import { UploadModal } from "@/components/UploadModal";

export const Route = createFileRoute("/portal")({
  component: PortalPage,
});

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamps?: ApiTimestamp[];
}

function PortalPage() {
  const navigate = useNavigate();

  // ── Auth: start false on BOTH server and client to avoid hydration mismatch ─
  // The SSR pass has no localStorage; initialising to false means server HTML
  // matches the first client render (spinner). After mount the effect checks
  // localStorage and either redirects or flips to true.
  const [isAuthed, setIsAuthed] = useState(false);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState("");

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const selectedAssetIdRef = useRef<string | null>(null);
  selectedAssetIdRef.current = selectedAssetId;

  const [assetSummary, setAssetSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [activeTimestamp, setActiveTimestamp] = useState<ApiTimestamp | null>(null);
  const [playUrl, setPlayUrl] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);

  // ── Stable fetch (reads current selection via ref, never recreated) ─────────
  const fetchAssets = useCallback(async () => {
    setAssetsLoading(true);
    setAssetsError("");
    try {
      const data = await apiListAssets();
      setAssets(data);
      if (data.length > 0 && !selectedAssetIdRef.current) {
        setSelectedAssetId(String(data[0].id));
      }
    } catch (err: any) {
      setAssetsError(err.message || "Failed to load assets");
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  // ── On mount: auth check (client-only) then initial fetch ─────────────────
  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      navigate({ to: "/login" });
    } else {
      setIsAuthed(true);
      fetchAssets();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch summary + play link when selected asset changes ─────────────────
  useEffect(() => {
    if (!selectedAssetId) return;
    setAssetSummary(null);
    setMessages([]);
    setActiveTimestamp(null);
    setPlayUrl(null);

    const selectedAsset = assets.find((a) => String(a.id) === selectedAssetId);
    const isMedia =
      selectedAsset &&
      (selectedAsset.assetType?.toLowerCase().includes("video") ||
        selectedAsset.assetType?.toLowerCase().includes("audio"));

    setSummaryLoading(true);
    apiGetSummary(selectedAssetId)
      .then((r) => setAssetSummary(r.summary))
      .catch(() => setAssetSummary(null))
      .finally(() => setSummaryLoading(false));

    if (isMedia) {
      apiGetPlayLink(selectedAssetId, 0)
        .then((r) => setPlayUrl(r.playableUrl))
        .catch(() => setPlayUrl(null));
    }
  }, [selectedAssetId]); // only re-runs when user picks a different file

  // ── Chat ─────────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!selectedAssetId) return;
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: text }]);
      setChatLoading(true);
      try {
        const res = await apiAskQuestion(selectedAssetId, text);
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: res.answer, timestamps: res.timestamps },
        ]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: `⚠ ${err.message || "Failed to get answer"}` },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [selectedAssetId]
  );

  // ── Timestamp click → play-link ───────────────────────────────────────────
  const handleTimestampClick = useCallback(
    async (ts: ApiTimestamp) => {
      setActiveTimestamp(ts);
      if (!selectedAssetId) return;
      try {
        const res = await apiGetPlayLink(selectedAssetId, ts.seconds);
        setPlayUrl(res.playableUrl);
      } catch { /* keep existing url */ }
    },
    [selectedAssetId]
  );

  // ── Upload complete ───────────────────────────────────────────────────────
  const handleUploadComplete = useCallback((newAsset: Asset) => {
    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAssetId(String(newAsset.id));
  }, []);

  // Show a neutral loading screen while auth is being checked client-side.
  // Critically, this must render the SAME HTML on server and client to avoid
  // a hydration mismatch.
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-obsidian-base flex items-center justify-center">
        <div className="size-2 rounded-full bg-aurora-cyan animate-pulse" />
      </div>
    );
  }

  const selectedAsset = assets.find((a) => String(a.id) === selectedAssetId) ?? null;
  const user = getStoredAuth()?.user;

  return (
    <div className="h-dvh w-full bg-obsidian-base font-sans flex flex-col overflow-hidden">
      {/* ── Top header bar ───────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-5 py-2.5 border-b border-glass-border/60 bg-obsidian-base/80 backdrop-blur-md shrink-0">
        <div className="text-xs font-semibold tracking-[0.2em] text-aurora-cyan uppercase">
          Axiom // Core
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-[11px] text-text-tertiary">
              {user.name || user.email}
            </span>
          )}
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="text-[11px] text-text-tertiary hover:text-aurora-cyan transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Ambient glows */}
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none opacity-10 blur-[120px] z-0" style={{ background: "var(--aurora-violet)" }} />
      <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full pointer-events-none opacity-8 blur-[140px] z-0" style={{ background: "var(--aurora-cyan)" }} />

      {/* ── 3-panel body ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 min-h-0 p-3 gap-2 overflow-hidden">

      {/* Sidebar — fixed width, collapses label text on small screens */}
      <div className="relative z-10 w-48 lg:w-56 xl:w-64 shrink-0 flex flex-col min-h-0">
        <PortalSidebar
          assets={assets}
          loading={assetsLoading}
          error={assetsError}
          selectedAssetId={selectedAssetId}
          onSelectAsset={setSelectedAssetId}
          onUploadClick={() => setUploadOpen(true)}
          onRetry={fetchAssets}
        />
      </div>

      {/* Media viewer — takes remaining space */}
      <div className="relative z-10 flex-1 min-w-0 flex flex-col">
        <MediaViewer
          asset={selectedAsset}
          summary={assetSummary}
          summaryLoading={summaryLoading}
          activeTimestamp={activeTimestamp}
          playUrl={playUrl}
          onTimestampClick={handleTimestampClick}
        />
      </div>

      {/* Chat panel — fixed width, shrinks on small screens */}
      <div className="relative z-10 w-64 lg:w-72 xl:w-[360px] shrink-0 flex flex-col min-h-0">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          onTimestampClick={handleTimestampClick}
          loading={chatLoading}
        />
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
      </div>
    </div>
  );
}
