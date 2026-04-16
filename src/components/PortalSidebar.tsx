import { useState, useEffect } from "react";
import { Upload, FileText, Headphones, Video, LogOut, MessageSquare, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { type Asset } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

const PAGE_SIZE = 7;

interface PortalSidebarProps {
  assets: Asset[];
  loading: boolean;
  error: string;
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
  onUploadClick: () => void;
  onRetry: () => void;
}

function assetTypeKind(assetType: string): "pdf" | "audio" | "video" | "file" {
  const t = assetType?.toLowerCase() ?? "";
  if (t.includes("pdf")) return "pdf";
  if (t.includes("audio") || t.includes("mp3") || t.includes("wav")) return "audio";
  if (t.includes("video") || t.includes("mp4")) return "video";
  return "file";
}

const FileIcon = ({ type }: { type: ReturnType<typeof assetTypeKind> }) => {
  switch (type) {
    case "pdf":   return <FileText className="size-3.5 shrink-0" />;
    case "audio": return <Headphones className="size-3.5 shrink-0" />;
    case "video": return <Video className="size-3.5 shrink-0" />;
    default:      return <FileText className="size-3.5 shrink-0" />;
  }
};

export function PortalSidebar({
  assets,
  loading,
  error,
  selectedAssetId,
  onSelectAsset,
  onUploadClick,
  onRetry,
}: PortalSidebarProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  // Reset to first page whenever the asset list changes
  useEffect(() => { setPage(0); }, [assets.length]);

  const totalPages = Math.ceil(assets.length / PAGE_SIZE);
  const pageAssets = assets.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <nav className="h-full flex flex-col gap-2">

      {/* ── Brand ─────────────────────────────────────────────────── */}

      {/* ── Active mode pill ──────────────────────────────────────── */}
      <div className="px-3 py-2 rounded-xl bg-obsidian-surface-hover border border-glass-border text-text-primary text-xs font-medium flex justify-between items-center shrink-0">
        <span className="flex items-center gap-2">
          <MessageSquare className="size-3.5" />
          <span className="hidden lg:inline">Synthesis</span>
        </span>
        <div className="size-1.5 rounded-full bg-aurora-cyan shadow-[0_0_8px_var(--aurora-cyan)]" />
      </div>

      {/* ── File list (paginated, scrollable) ────────────────────── */}
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-1 shrink-0">
          <div className="text-[9px] font-semibold tracking-[0.15em] text-text-tertiary uppercase">
            Indexed Files
          </div>
          {!loading && !error && (
            <button onClick={onRetry} className="text-text-tertiary hover:text-aurora-cyan transition-colors" title="Refresh">
              <RefreshCw className="size-3" />
            </button>
          )}
        </div>

        {/* File rows */}
        <div className="flex flex-col gap-1 overflow-y-auto min-h-0">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-9 rounded-xl bg-obsidian-surface animate-pulse border border-glass-border" />
            ))
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center px-2">
              <AlertCircle className="size-4 text-destructive opacity-70" />
              <p className="text-[10px] text-text-tertiary leading-snug">{error}</p>
              <button onClick={onRetry} className="text-[10px] text-aurora-cyan hover:underline">
                Try again
              </button>
            </div>
          ) : assets.length === 0 ? (
            <p className="text-[10px] text-text-tertiary px-1">No files yet. Upload one!</p>
          ) : (
            pageAssets.map((a) => {
              const kind = assetTypeKind(a.assetType);
              const isActive = String(a.id) === selectedAssetId;
              return (
                <button
                  key={a.id}
                  onClick={() => onSelectAsset(String(a.id))}
                  title={a.originalFilename}
                  className={`px-3 py-2 rounded-xl text-xs font-light text-left flex items-center gap-2 transition-all w-full ${
                    isActive
                      ? "bg-obsidian-surface-hover border border-glass-border text-text-primary"
                      : "text-text-secondary hover:bg-obsidian-surface hover:text-text-primary"
                  }`}
                >
                  <FileIcon type={kind} />
                  <span className="truncate">{a.originalFilename}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1 shrink-0">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded-lg text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="text-[9px] text-text-tertiary tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded-lg text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom actions (always visible) ──────────────────────── */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* Upload button */}
        <button
          onClick={onUploadClick}
          className="w-full py-3 rounded-2xl border border-dashed border-glass-border bg-obsidian-surface/50 flex flex-col items-center justify-center gap-1.5 cursor-pointer group hover:border-aurora-cyan/40 hover:bg-aurora-cyan/5 transition-all"
        >
          <div className="size-7 rounded-full bg-obsidian-surface-hover border border-glass-border flex items-center justify-center text-text-secondary group-hover:text-aurora-cyan transition-colors">
            <Upload className="size-3.5" />
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-text-primary">Ingest Data</div>
            <div className="text-[9px] text-text-tertiary">PDF · Audio · Video</div>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate({ to: "/login" }); }}
          className="px-3 py-2 rounded-xl text-xs font-light text-text-tertiary hover:text-text-secondary flex items-center gap-2 transition-colors"
        >
          <LogOut className="size-3.5" />
          <span className="hidden lg:inline">Disconnect</span>
        </button>
      </div>
    </nav>
  );
}
