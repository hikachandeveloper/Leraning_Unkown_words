export interface Word {
  id: string;
  text: string;
  memo: string | null;
  summary: string | null;
  detail: string | null;
  category_id: string | null;
  view_count: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface OfflineWord {
  text: string;
  memo: string | null;
  created_at: string;
}
