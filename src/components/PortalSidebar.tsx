import { Upload, FileText, Headphones, Video, LogOut, MessageSquare } from "lucide-react";
import { type UploadedFile } from "@/lib/mock-data";
import { logout } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

interface PortalSidebarProps {
  files: UploadedFile[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  onUploadClick: () => void;
}

const fileIcon = (type: UploadedFile["type"]) => {
  switch (type) {
    case "pdf": return <FileText className="size-4" />;
    case "audio": return <Headphones className="size-4" />;
    case "video": return <Video className="size-4" />;
  }
};

export function PortalSidebar({ files, selectedFileId, onSelectFile, onUploadClick }: PortalSidebarProps) {
  const navigate = useNavigate();

  return (
    <nav className="relative z-10 w-64 flex flex-col justify-between shrink-0">
      <div className="flex flex-col gap-8">
        <div className="text-xs font-semibold tracking-[0.2em] text-aurora-cyan uppercase">
          Axiom // Core
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1">
          <div className="px-4 py-3 rounded-2xl bg-obsidian-surface-hover border border-glass-border text-text-primary text-sm font-medium flex justify-between items-center cursor-pointer">
            <span className="flex items-center gap-2"><MessageSquare className="size-4" /> Synthesis Stream</span>
            <div className="size-1.5 rounded-full bg-aurora-cyan shadow-[0_0_8px_var(--aurora-cyan)]" />
          </div>
        </div>

        {/* Files list */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold tracking-[0.15em] text-text-tertiary uppercase px-1">
            Indexed Files
          </div>
          {files.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelectFile(f.id)}
              className={`px-4 py-3 rounded-2xl text-sm font-light text-left flex items-center gap-3 transition-all ${
                f.id === selectedFileId
                  ? "bg-obsidian-surface-hover border border-glass-border text-text-primary"
                  : "text-text-secondary hover:bg-obsidian-surface hover:text-text-primary"
              }`}
            >
              {fileIcon(f.type)}
              <span className="truncate">{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Upload dropzone */}
        <button
          onClick={onUploadClick}
          className="h-32 rounded-3xl border border-dashed border-glass-border bg-obsidian-surface/50 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:border-aurora-cyan/30 transition-all"
        >
          <div className="size-8 rounded-full bg-obsidian-surface-hover border border-glass-border flex items-center justify-center text-text-secondary group-hover:text-aurora-cyan transition-colors">
            <Upload className="size-4" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-text-primary">Ingest Data</div>
            <div className="text-xs text-text-tertiary mt-0.5">PDF, Audio, Video</div>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate({ to: "/login" }); }}
          className="px-4 py-3 rounded-2xl text-sm font-light text-text-tertiary hover:text-text-secondary flex items-center gap-2 transition-colors"
        >
          <LogOut className="size-4" /> Disconnect
        </button>
      </div>
    </nav>
  );
}
