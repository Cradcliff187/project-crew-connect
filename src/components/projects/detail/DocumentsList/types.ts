export interface ProjectDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  description?: string;
  category?: string;
}
