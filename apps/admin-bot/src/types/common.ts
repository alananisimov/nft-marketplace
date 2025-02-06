export interface PaginationOptions {
  page: number;
  itemsPerPage: number;
}

export interface FileUploadOptions {
  filename?: string;
  width?: number;
  height?: number;
  quality?: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
