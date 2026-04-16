import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Headphones, Video, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { apiUploadAsset, type Asset } from "@/lib/api";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete: (asset: Asset) => void;
}

interface FileUploadState {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

const getFileIcon = (type: string) => {
  if (type.includes("pdf"))   return <FileText className="size-4" />;
  if (type.includes("audio")) return <Headphones className="size-4" />;
  if (type.includes("video")) return <Video className="size-4" />;
  return <FileText className="size-4" />;
};

const MAX_FILE_MB = 25;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;


export function UploadModal({ open, onClose, onUploadComplete }: UploadModalProps) {
  // ── ALL hooks must be declared before any conditional return ────────────────
  const [dragOver, setDragOver]   = useState(false);
  const [uploads, setUploads]     = useState<FileUploadState[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    setUploads((prev) => [
      ...prev,
      ...files.map((f) =>
        f.size > MAX_FILE_BYTES
          ? {
              file: f,
              status: "error" as const,
              progress: 0,
              error: `File exceeds the ${MAX_FILE_MB} MB limit (${(f.size / 1024 / 1024).toFixed(1)} MB)`,
            }
          : { file: f, status: "pending" as const, progress: 0 }
      ),
    ]);
  }, []);

  const removeFile = useCallback((idx: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Guard ref prevents concurrent invocations (double-click, etc.)
  const uploadingRef = useRef(false);

  const handleUploadAll = useCallback(async () => {
    // Hard guard — if somehow called twice, the second call exits immediately
    if (uploadingRef.current) return;
    uploadingRef.current = true;
    setUploading(true);

    // `uploads` is captured from the closure at click time (it's in the deps array below).
    // We do NOT use setState updaters to read state — React may call those multiple times.
    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].status !== "pending") continue;

      setUploads((prev) =>
        prev.map((u, idx) => (idx === i ? { ...u, status: "uploading" } : u))
      );

      try {
        const asset = await apiUploadAsset(uploads[i].file, (pct) => {
          setUploads((prev) =>
            prev.map((u, idx) => (idx === i ? { ...u, progress: pct } : u))
          );
        });
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i ? { ...u, status: "done", progress: 100 } : u
          )
        );
        onUploadComplete(asset);
      } catch (err: any) {
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? { ...u, status: "error", error: err?.message ?? "Upload failed" }
              : u
          )
        );
      }
    }

    uploadingRef.current = false;
    setUploading(false);
  }, [uploads, onUploadComplete]); // uploads in deps = closure snapshot at click time



  const handleClose = useCallback(() => {
    if (uploading) return;
    setUploads([]);
    setDragOver(false);
    onClose();
  }, [uploading, onClose]);

  // ── Early return AFTER all hooks ────────────────────────────────────────────
  if (!open) return null;

  const pendingCount = uploads.filter((u) => u.status === "pending").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-base/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="glass-panel-rounded w-full max-w-lg mx-4 p-8 aurora-glow-violet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-light text-text-primary">Ingest Data</h2>
          {!uploading && (
            <button onClick={handleClose} className="text-text-tertiary hover:text-text-secondary transition-colors">
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${
            uploading
              ? "cursor-not-allowed opacity-50 border-glass-border"
              : dragOver
              ? "border-aurora-cyan/50 bg-aurora-cyan/5 cursor-pointer"
              : "border-glass-border bg-obsidian-base hover:border-aurora-cyan/30 cursor-pointer"
          }`}
        >
          <Upload className={`size-6 ${dragOver ? "text-aurora-cyan" : "text-text-tertiary"}`} />
          <div className="text-center">
            <div className="text-sm text-text-primary">Drop files or click to browse</div>
            <div className="text-xs text-text-tertiary mt-1">PDF · MP3 · MP4 · WAV and more</div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.mp3,.mp4,.wav,.m4a,.avi,.mov,.webm"
          onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
          className="hidden"
        />

        {/* File list */}
        {uploads.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 max-h-52 overflow-y-auto">
            {uploads.map((u, i) => (
              <div key={i} className="rounded-xl bg-obsidian-surface border border-glass-border overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-text-secondary min-w-0">
                    {getFileIcon(u.file.type)}
                    <span className="truncate max-w-[220px]">{u.file.name}</span>
                    <span className="text-text-tertiary text-xs shrink-0">
                      ({(u.file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {u.status === "uploading" && (
                      <div className="flex items-center gap-1 text-aurora-cyan text-xs">
                        <Loader2 className="size-3 animate-spin" />
                        <span>{u.progress}%</span>
                      </div>
                    )}
                    {u.status === "done"  && <CheckCircle className="size-4 text-aurora-cyan" />}
                    {u.status === "error" && <AlertCircle className="size-4 text-destructive" title={u.error} />}
                    {u.status === "pending" && !uploading && (
                      <button onClick={() => removeFile(i)} className="text-text-tertiary hover:text-destructive transition-colors">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                {u.status === "uploading" && (
                  <div className="h-0.5 bg-obsidian-base">
                    <div className="h-full bg-aurora-cyan transition-all duration-300" style={{ width: `${u.progress}%` }} />
                  </div>
                )}
                {u.status === "error" && (
                  <div className="px-3 pb-2 text-xs text-destructive">{u.error}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {(() => {
          const allDone = !uploading && pendingCount === 0 && uploads.some((u) => u.status === "done");
          return (
            <div className="mt-6 flex gap-3 justify-end">
              {/* Cancel — only while there are still pending files and not yet uploading */}
              {!uploading && pendingCount > 0 && (
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              )}

              {/* Primary action button */}
              <button
                onClick={allDone ? handleClose : handleUploadAll}
                disabled={!allDone && (pendingCount === 0 || uploading)}
                className="px-6 py-2.5 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan text-sm font-medium hover:bg-aurora-cyan/20 transition-all disabled:opacity-30 flex items-center gap-2"
              >
                {uploading && <Loader2 className="size-4 animate-spin" />}
                {uploading
                  ? "Uploading…"
                  : allDone
                  ? "✓ Done — Go to file"
                  : pendingCount > 0
                  ? `Process ${pendingCount} file${pendingCount > 1 ? "s" : ""}`
                  : "All done"}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
