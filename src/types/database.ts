export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          title: string;
          category: string;
          option_a_text: string;
          option_a_image_url: string;
          option_b_text: string;
          option_b_image_url: string;
          votes_a: number;
          votes_b: number;
          view_count: number;
          created_by: string;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category?: string;
          option_a_text: string;
          option_a_image_url?: string;
          option_b_text: string;
          option_b_image_url?: string;
          votes_a?: number;
          votes_b?: number;
          view_count?: number;
          created_by: string;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          option_a_text?: string;
          option_a_image_url?: string;
          option_b_text?: string;
          option_b_image_url?: string;
          votes_a?: number;
          votes_b?: number;
          view_count?: number;
          created_by?: string;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          topic_id: string;
          user_id: string;
          side: 'A' | 'B';
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          user_id: string;
          side: 'A' | 'B';
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          user_id?: string;
          side?: 'A' | 'B';
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          topic_id: string;
          user_id: string;
          side: 'A' | 'B';
          text: string;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          user_id: string;
          side: 'A' | 'B';
          text: string;
          likes_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          user_id?: string;
          side?: 'A' | 'B';
          text?: string;
          likes_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      comment_likes: {
        Row: {
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          comment_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          comment_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      topic_likes: {
        Row: {
          topic_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          topic_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          topic_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      topic_views: {
        Row: {
          topic_id: string;
          user_id: string;
          viewed_at: string;
        };
        Insert: {
          topic_id: string;
          user_id: string;
          viewed_at?: string;
        };
        Update: {
          topic_id?: string;
          user_id?: string;
          viewed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
