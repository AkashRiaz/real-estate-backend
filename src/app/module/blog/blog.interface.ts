export interface ICreateBlogPostPayload {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  isPublished: boolean;
}

export type IUpdateBlogPostPayload = Partial<ICreateBlogPostPayload>;
