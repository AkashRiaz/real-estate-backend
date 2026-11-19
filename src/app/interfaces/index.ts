export interface IQuery {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
  sortBy?: string;
  fields?: string;

  // any other filter fields
  [key: string]: string | undefined;
}

export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
