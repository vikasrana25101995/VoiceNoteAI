export interface TranscriptionResponse {
  text: string;
}

export interface AnalysisResponse {
  note: {
    id: string;
    title: string;
    content: string;
    summary?: string | null;
    bulletPoints?: string | null;
    actionItems?: string | null;
    audioUrl?: string | null;
    tags: string[];
    folderId?: string | null;
    createdAt: string;
  };
  tasks: Array<{
    id: string;
    content: string;
    isCompleted: boolean;
  }>;
}
