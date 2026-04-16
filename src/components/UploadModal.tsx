import { useState, useRef } from "react";
import { Upload, X, FileText, Headphones, Video } from "lucide-react";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

export function UploadModal({ open, onClose, onUpload }: UploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="size-4" />;
    if (type.includes("audio")) return <Headphones className="size-4" />;
    if (type.includes("video")) return <Video className="size-4" />;
    return <FileText className="size-4" />;
  };

  const handleUpload = () => {
    onUpload(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-base/80 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel-rounded w-full max-w-lg mx-4 p-8 aurora-glow-violet" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-light text-text-primary">Ingest Data</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            dragOver
              ? "border-aurora-cyan/50 bg-aurora-cyan/5"
              : "border-glass-border bg-obsidian-base hover:border-aurora-cyan/30"
          }`}
        >
          <Upload className={`size-6 ${dragOver ? "text-aurora-cyan" : "text-text-tertiary"}`} />
          <div className="text-center">
            <div className="text-sm text-text-primary">Drop files or click to browse</div>
            <div className="text-xs text-text-tertiary mt-1">PDF, MP3, MP4, WAV, and more</div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.mp3,.mp4,.wav,.m4a,.avi,.mov,.webm"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Selected files */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-obsidian-surface border border-glass-border">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  {getFileIcon(f.type)}
                  <span className="truncate max-w-[280px]">{f.name}</span>
                  <span className="text-text-tertiary text-xs">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button onClick={() => removeFile(i)} className="text-text-tertiary hover:text-destructive transition-colors">
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            className="px-6 py-2.5 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan text-sm font-medium hover:bg-aurora-cyan/20 transition-all disabled:opacity-30"
          >
            Process {selectedFiles.length > 0 ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
