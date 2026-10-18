// ============================================================================
// MSOT Clubs — Supabase Database Types
// ============================================================================

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
      campuses: {
        Row: {
          id: string;
          code: string;
          name: string;
          timezone: string;
          address: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          timezone?: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          timezone?: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          student_id: string | null;
          full_name: string;
          email: string;
          campus_id: string | null;
          year: string | null;
          section: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          student_id?: string | null;
          full_name: string;
          email: string;
          campus_id?: string | null;
          year?: string | null;
          section?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          full_name?: string;
          email?: string;
          campus_id?: string | null;
          year?: string | null;
          section?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'student' | 'coordinator' | 'president' | 'advisor' | 'campus_manager' | 'admin';
          campus_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'student' | 'coordinator' | 'president' | 'advisor' | 'campus_manager' | 'admin';
          campus_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'student' | 'coordinator' | 'president' | 'advisor' | 'campus_manager' | 'admin';
          campus_id?: string | null;
          created_at?: string;
        };
      };
      clubs: {
        Row: {
          id: string;
          campus_id: string;
          name: string;
          code: string;
          category: string;
          description: string | null;
          capacity: number;
          status: 'active' | 'inactive' | 'pending_approval';
          faculty_advisor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          name: string;
          code: string;
          category?: string;
          description?: string | null;
          capacity?: number;
          status?: 'active' | 'inactive' | 'pending_approval';
          faculty_advisor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          name?: string;
          code?: string;
          category?: string;
          description?: string | null;
          capacity?: number;
          status?: 'active' | 'inactive' | 'pending_approval';
          faculty_advisor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      club_coordinator_applications: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          answers: Json;
          statement_of_purpose: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
          reviewer_id: string | null;
          reviewer_comment: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          answers?: Json;
          statement_of_purpose?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'withdrawn';
          reviewer_id?: string | null;
          reviewer_comment?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
          answers?: Json;
          statement_of_purpose?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'withdrawn';
          reviewer_id?: string | null;
          reviewer_comment?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      club_memberships: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          role: 'coordinator';
          status: 'active' | 'inactive' | 'resigned';
          joined_at: string;
          resigned_at: string | null;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          role?: 'coordinator';
          status?: 'active' | 'inactive' | 'resigned';
          joined_at?: string;
          resigned_at?: string | null;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
          role?: 'coordinator';
          status?: 'active' | 'inactive' | 'resigned';
          joined_at?: string;
          resigned_at?: string | null;
        };
      };
      club_presidencies: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          status: 'active' | 'past';
          appointed_by: string | null;
          appointed_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          status?: 'active' | 'past';
          appointed_by?: string | null;
          appointed_at?: string;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
          status?: 'active' | 'past';
          appointed_by?: string | null;
          appointed_at?: string;
          ended_at?: string | null;
        };
      };
      club_permission_delegations: {
        Row: {
          id: string;
          club_id: string;
          grantor_id: string;
          recipient_id: string;
          permission: string;
          is_revoked: boolean;
          granted_at: string;
          revoked_at: string | null;
          revoke_reason: string | null;
        };
        Insert: {
          id?: string;
          club_id: string;
          grantor_id: string;
          recipient_id: string;
          permission: string;
          is_revoked?: boolean;
          granted_at?: string;
          revoked_at?: string | null;
          revoke_reason?: string | null;
        };
        Update: {
          id?: string;
          club_id?: string;
          grantor_id?: string;
          recipient_id?: string;
          permission?: string;
          is_revoked?: boolean;
          granted_at?: string;
          revoked_at?: string | null;
          revoke_reason?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_table: string;
          target_id: string | null;
          previous_state: Json | null;
          new_state: Json | null;
          reason: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_table: string;
          target_id?: string | null;
          previous_state?: Json | null;
          new_state?: Json | null;
          reason?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: never; // Append-only!
      };
    };
  };
}
