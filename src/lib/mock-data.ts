export interface UploadedFile {
  id: string;
  name: string;
  type: "pdf" | "audio" | "video";
  size: string;
  uploadedAt: string;
  summary?: string;
  timestamps?: Timestamp[];
  transcriptSegments?: TranscriptSegment[];
}

export interface Timestamp {
  time: string;
  seconds: number;
  label: string;
}

export interface TranscriptSegment {
  time: string;
  seconds: number;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  relatedTimestamp?: Timestamp;
}

export const mockFiles: UploadedFile[] = [
  {
    id: "1",
    name: "Q3 Neural Architecture Review.mp4",
    type: "video",
    size: "248 MB",
    uploadedAt: "2 hours ago",
    summary:
      "A recorded colloquium discussing generative architecture scaling limits. Dr. Aris identifies a critical KV cache bottleneck at 12:45, proposing a fluid decay matrix. Dr. Chen counters with aggressive 4-bit quantization for older attention layers.",
    timestamps: [
      { time: "02:15", seconds: 135, label: "Introduction & Agenda" },
      { time: "12:45", seconds: 765, label: "Pruning Strategy Bottleneck" },
      { time: "28:40", seconds: 1720, label: "Q&A: Memory Constraints" },
      { time: "41:10", seconds: 2470, label: "Closing Remarks" },
    ],
    transcriptSegments: [
      {
        time: "12:40",
        seconds: 760,
        text: "Moving to the core issue. We've been hitting a wall with the pruning phase in our latest models.",
      },
      {
        time: "12:45",
        seconds: 765,
        text: "The theoretical limit is governed strictly by the bandwidth between the ALUs and high-bandwidth memory. If we cannot compress the KV cache by at least 4x, scaling context windows becomes economically inviable.",
      },
      {
        time: "13:02",
        seconds: 782,
        text: "I propose what I'm calling a fluid decay matrix — synaptic weights degrade organically based on access frequency, rather than global culling.",
      },
    ],
  },
  {
    id: "2",
    name: "Board Meeting Notes - April 2026.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedAt: "1 day ago",
    summary:
      "Quarterly board meeting covering financial projections, new market expansion into APAC, and strategic partnerships. Key decision: approved $12M allocation for next-gen infrastructure.",
  },
  {
    id: "3",
    name: "Investor Call Recording.mp3",
    type: "audio",
    size: "45 MB",
    uploadedAt: "3 days ago",
    summary:
      "Investor call discussing Q3 earnings, revenue guidance of $340M, and supply chain mitigation strategies.",
    timestamps: [
      { time: "00:30", seconds: 30, label: "Opening Remarks" },
      { time: "05:12", seconds: 312, label: "Revenue Guidance" },
      { time: "14:10", seconds: 850, label: "Supply Chain Update" },
      { time: "22:04", seconds: 1324, label: "Q&A Session" },
    ],
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "I've analyzed the uploaded files. The Q3 Neural Architecture Review contains key insights about scaling bottlenecks. What would you like to explore?",
  },
  {
    id: "2",
    role: "user",
    content:
      "Where did Dr. Aris outline the pruning bottleneck solution?",
  },
  {
    id: "3",
    role: "assistant",
    content:
      'She addresses the pruning bottleneck precisely at **12:45**. The core thesis is that rigid thresholding destroys latent connections. Instead, she proposes a **fluid decay matrix** where synaptic weights degrade organically based on access frequency, rather than global culling.',
    relatedTimestamp: { time: "12:45", seconds: 765, label: "Pruning Strategy Bottleneck" },
  },
];
