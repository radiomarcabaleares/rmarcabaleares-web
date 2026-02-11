export type UserRole = 'superadmin' | 'copywriter' | 'publicista';
export type BentoSlot = 'large' | 'horizontal' | 'small_1' | 'small_2' | 'futbol_1' | 'futbol_2' | 'futbol_3';
export type MediaType = 'image' | 'video';
export type AdPosition = 'left' | 'right' | 'both' | 'horizontal_1' | 'horizontal_2';
export type ContactDepartment = 'atencion_cliente' | 'comercial';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_image_width: number | null;
  cover_image_height: number | null;
  category_id: string | null;
  author_id: string | null;
  is_featured: boolean;
  is_favorite: boolean;
  bento_slot: BentoSlot | null;
  has_drop_cap: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  author?: Profile;
  media?: NewsMedia[];
}

export interface NewsMedia {
  id: string;
  news_id: string;
  media_type: MediaType;
  url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
}

export interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  position: AdPosition;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_path: string | null;
  days: string[];
  start_hour: number;
  end_hour: number;
  is_coming_soon: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  department: ContactDepartment;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      news: {
        Row: News;
        Insert: Omit<News, 'id' | 'created_at' | 'updated_at' | 'category' | 'author' | 'media'>;
        Update: Partial<Omit<News, 'id' | 'created_at' | 'updated_at' | 'category' | 'author' | 'media'>>;
      };
      news_media: {
        Row: NewsMedia;
        Insert: Omit<NewsMedia, 'id' | 'created_at'>;
        Update: Partial<Omit<NewsMedia, 'id' | 'created_at'>>;
      };
      ads: {
        Row: Ad;
        Insert: Omit<Ad, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Ad, 'id' | 'created_at' | 'updated_at'>>;
      };
      programs: {
        Row: Program;
        Insert: Omit<Program, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Program, 'id' | 'created_at' | 'updated_at'>>;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: Omit<ContactSubmission, 'id' | 'created_at'>;
        Update: Partial<Omit<ContactSubmission, 'id' | 'created_at'>>;
      };
    };
  };
}
