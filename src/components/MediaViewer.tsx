import { Play } from "lucide-react";
import { type Asset, type ApiTimestamp } from "@/lib/api";

const MAX_VIDEO_H = "min(35vh, 260px)";

interface MediaViewerProps {
  asset: Asset | null;
  summary: string | null;
  summaryLoading: boolean;
  activeTimestamp: ApiTimestamp | null;
  playUrl: string | null;
  onTimestampClick: (ts: ApiTimestamp) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "00")}:${String(s).padStart(2, "00")}`;
}

/**
 * Renders a summary string that may contain bullet points (•, -, *)
 * or newline-separated text as a proper bulleted list.
 * Each bullet point appears on its own line with visible, bright text.
 */
function SummaryBody({ text }: { text: string }) {
  // Remove any leading intro like "Here are N bullet points...:"
  const cleaned = text.replace(/^[^•\-*\n]*:\s*/u, "").trim();

  // Split on bullet chars or newlines, filter empty
  const bullets = cleaned
    .split(/[•\n]|(?<=\S)\s*[\-\*]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (bullets.length <= 1) {
    // No detectable bullets — render as a paragraph
    return (
      <p className="text-sm text-text-primary leading-relaxed font-light">
        {text.trim()}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {bullets.map((point, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-1.5 size-1.5 rounded-full bg-aurora-cyan shrink-0" />
          <span className="text-sm text-text-primary leading-relaxed font-light">{point}</span>
        </li>
      ))}
    </ul>
  );
}


export function MediaViewer({
  asset,
  summary,
  summaryLoading,
  activeTimestamp,
  playUrl,
  onTimestampClick,
}: MediaViewerProps) {
  if (!asset) {
    return (
      <div className="h-full glass-panel-rounded flex items-center justify-center">
        <p className="text-text-tertiary text-sm">Select a file to view</p>
      </div>
    );
  }

  const assetType = asset.assetType?.toLowerCase() ?? "";
  const isVideo = assetType.includes("video") || assetType.includes("mp4");
  const isAudio = assetType.includes("audio") || assetType.includes("mp3") || assetType.includes("wav");
  const isMedia = isVideo || isAudio;

  return (
    <div className="h-full glass-panel-rounded flex flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-glass-border/50 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] uppercase tracking-widest text-text-secondary border border-white/5 shrink-0">
            {asset.assetType}
          </div>
          <h1 className="text-sm font-light text-text-primary tracking-wide truncate">
            {asset.originalFilename}
          </h1>
        </div>
        {asset.fileSize && (
          <div className="text-[10px] text-text-tertiary shrink-0 ml-3">
            {(asset.fileSize / 1024 / 1024).toFixed(1)} MB
          </div>
        )}
      </div>

      {/* ── Content (scrollable) ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {isVideo ? (
          <div className="flex flex-col gap-3 p-3">
            {/* ── Video player — constrained height so summary is always visible ── */}
            <div className="rounded-xl overflow-hidden bg-obsidian-base" style={{ maxHeight: MAX_VIDEO_H }}>
              {playUrl ? (
                <video
                  key={playUrl}
                  src={playUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  style={{ maxHeight: MAX_VIDEO_H }}
                />
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-aurora-violet/5 to-aurora-cyan/5"
                  style={{ height: MAX_VIDEO_H }}
                >
                  <button className="size-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-text-primary hover:bg-white/20 transition-colors border border-white/5 aurora-glow-cyan">
                    <Play className="size-5 ml-1" />
                  </button>
                  <p className="text-xs text-text-tertiary">Select a file or click a timestamp</p>
                </div>
              )}
            </div>

            {/* ── Active timestamp pill (below video, not overlapping controls) ── */}
            {activeTimestamp && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-aurora-cyan/5 border border-aurora-cyan/20">
                <span className="font-mono text-sm text-aurora-cyan tabular-nums">
                  {activeTimestamp.time ?? formatTime(activeTimestamp.seconds)}
                </span>
                <span className="text-sm text-text-secondary font-light">
                  {activeTimestamp.label || activeTimestamp.description}
                </span>
              </div>
            )}

            {/* ── AI Summary (always below video) ──────────────────────────── */}
            <div className="rounded-2xl border border-glass-border bg-obsidian-surface/50 p-4">
              <div className="text-[9px] font-semibold tracking-[0.15em] text-text-tertiary uppercase mb-2">
                AI Summary
              </div>
              {summaryLoading ? (
                <div className="flex flex-col gap-2">
                  {[80, 95, 65].map((w, i) => (
                    <div key={i} className="h-3 rounded bg-obsidian-surface-hover animate-pulse" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : summary ? (
                <SummaryBody text={summary} />
              ) : (
                <p className="text-xs text-text-tertiary">Processing…</p>
              )}
            </div>
          </div>

        ) : isAudio ? (
          <div className="flex flex-col gap-3 p-3">
            {/* ── Audio player ─────────────────────────────────────────── */}
            <div className="rounded-2xl bg-obsidian-base overflow-hidden">
              {playUrl ? (
                <div className="p-4">
                  <audio
                    key={playUrl}
                    src={playUrl}
                    controls
                    autoPlay
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="h-28 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-aurora-violet/5 to-aurora-cyan/5">
                  {/* Static waveform decoration */}
                  <div className="flex items-end gap-0.5 h-10">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-aurora-cyan/25"
                        style={{ height: `${16 + Math.sin(i * 0.7) * 14}px` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-tertiary">Click a timestamp to start playback</p>
                </div>
              )}
            </div>

            {/* Active timestamp */}
            {activeTimestamp && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-aurora-violet/5 border border-aurora-violet/20">
                <span className="font-mono text-sm text-aurora-violet tabular-nums">
                  {activeTimestamp.time ?? formatTime(activeTimestamp.seconds)}
                </span>
                <span className="text-sm text-text-secondary font-light">
                  {activeTimestamp.label || activeTimestamp.description}
                </span>
              </div>
            )}

            {/* AI Summary */}
            <div className="rounded-2xl border border-glass-border bg-obsidian-surface/50 p-4">
              <div className="text-[9px] font-semibold tracking-[0.15em] text-text-tertiary uppercase mb-2">
                AI Summary
              </div>
              {summaryLoading ? (
                <div className="flex flex-col gap-2">
                  {[80, 95, 65].map((w, i) => (
                    <div key={i} className="h-3 rounded bg-obsidian-surface-hover animate-pulse" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : summary ? (
                <SummaryBody text={summary} />
              ) : (
                <p className="text-xs text-text-tertiary">Processing…</p>
              )}
            </div>
          </div>

        ) : (
          /* ── PDF / Document ──────────────────────────────────────── */
          <div className="p-5 flex flex-col gap-4">
            <div className="px-3 py-1 rounded-full bg-aurora-violet/10 border border-aurora-violet/20 text-xs text-aurora-violet w-fit">
              Document Summary
            </div>
            {summaryLoading ? (
              <div className="flex flex-col gap-3">
                {[90, 75, 60].map((w, i) => (
                  <div key={i} className="h-4 rounded bg-obsidian-surface animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : summary ? (
              <SummaryBody text={summary} />
            ) : (
              <p className="text-sm text-text-tertiary">No summary available yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
