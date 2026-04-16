import { Play } from "lucide-react";
import { type UploadedFile, type Timestamp } from "@/lib/mock-data";

interface MediaViewerProps {
  file: UploadedFile;
  activeTimestamp: Timestamp | null;
  onTimestampClick: (ts: Timestamp) => void;
}

export function MediaViewer({ file, activeTimestamp, onTimestampClick }: MediaViewerProps) {
  const isMedia = file.type === "audio" || file.type === "video";

  return (
    <div className="flex-1 flex flex-col min-w-0 glass-panel-rounded overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-glass-border/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="px-2.5 py-1 rounded-full bg-white/5 text-[10px] uppercase tracking-widest text-text-secondary border border-white/5">
            {file.type}
          </div>
          <h1 className="text-lg font-light text-text-primary tracking-wide truncate">
            {file.name}
          </h1>
        </div>
        <div className="text-xs text-text-tertiary shrink-0">{file.size}</div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {isMedia ? (
          <div className="flex flex-col h-full">
            {/* Video/Audio placeholder */}
            <div className="relative flex-1 bg-obsidian-base m-2 rounded-3xl overflow-hidden min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-br from-aurora-violet/5 to-aurora-cyan/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="size-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-text-primary cursor-pointer hover:bg-white/20 transition-colors border border-white/5 aurora-glow-cyan">
                  <Play className="size-6 ml-1" />
                </button>
              </div>

              {/* Bottom overlay with time */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-obsidian-base to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-light text-text-primary">
                      {activeTimestamp?.time || "00:00"}{" "}
                      <span className="text-text-secondary text-lg">/ {file.type === "video" ? "48:22" : "32:15"}</span>
                    </div>
                  </div>
                  {activeTimestamp && (
                    <div className="text-sm font-light text-text-secondary">
                      Segment: <span className="text-text-primary font-medium">{activeTimestamp.label}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timestamp markers */}
            {file.timestamps && file.timestamps.length > 0 && (
              <div className="px-6 pb-4 flex gap-2 overflow-x-auto">
                {file.timestamps.map((ts) => (
                  <button
                    key={ts.seconds}
                    onClick={() => onTimestampClick(ts)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                      activeTimestamp?.seconds === ts.seconds
                        ? "bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan"
                        : "bg-obsidian-surface border border-glass-border text-text-secondary hover:text-text-primary hover:border-white/10"
                    }`}
                  >
                    <Play className="size-3" />
                    <span className="font-mono text-xs tabular-nums">{ts.time}</span>
                    <span>{ts.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* PDF Summary View */
          <div className="p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 rounded-full bg-aurora-violet/10 border border-aurora-violet/20 text-xs text-aurora-violet">
                Document Summary
              </div>
            </div>
            <p className="text-base font-light text-text-secondary leading-relaxed max-w-[65ch]">
              {file.summary}
            </p>
          </div>
        )}

        {/* Transcript segments for media */}
        {isMedia && file.transcriptSegments && (
          <div className="px-8 pb-8 flex flex-col gap-4">
            <div className="text-[10px] font-semibold tracking-[0.15em] text-text-tertiary uppercase">
              Transcript
            </div>
            {file.transcriptSegments.map((seg, i) => (
              <div
                key={i}
                className={`flex gap-4 p-3 rounded-xl transition-all ${
                  activeTimestamp && Math.abs(seg.seconds - activeTimestamp.seconds) < 10
                    ? "bg-aurora-cyan/5 border border-aurora-cyan/20"
                    : "border border-transparent"
                }`}
              >
                <span className="font-mono text-xs tabular-nums text-text-tertiary shrink-0 mt-0.5">
                  {seg.time}
                </span>
                <p className="text-sm font-light text-text-secondary leading-relaxed">
                  {seg.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Summary for media */}
        {isMedia && file.summary && (
          <div className="px-8 pb-8">
            <div className="p-4 rounded-2xl border border-glass-border bg-obsidian-surface/50">
              <div className="text-[10px] font-semibold tracking-[0.15em] text-text-tertiary uppercase mb-2">
                AI Summary
              </div>
              <p className="text-sm font-light text-text-secondary leading-relaxed">
                {file.summary}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
