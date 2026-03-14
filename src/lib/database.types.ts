export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'agent'
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'agent'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'manager' | 'agent'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          lifetime_value: number | null
          churn_risk_score: number | null
          vip_status: boolean | null
          personality_summary: string | null
          custom_fields: Record<string, Json> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          lifetime_value?: number | null
          churn_risk_score?: number | null
          vip_status?: boolean | null
          personality_summary?: string | null
          custom_fields?: Record<string, Json> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          lifetime_value?: number | null
          churn_risk_score?: number | null
          vip_status?: boolean | null
          personality_summary?: string | null
          custom_fields?: Record<string, Json> | null
          created_at?: string
          updated_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          customer_id: string
          agent_id: string | null
          type: 'email' | 'chat' | 'call' | 'note' | 'ticket'
          direction: 'inbound' | 'outbound' | 'internal'
          content: string
          sentiment_score: number | null
          ai_summary: string | null
          interaction_date: string
        }
        Insert: {
          id?: string
          customer_id: string
          agent_id?: string | null
          type: 'email' | 'chat' | 'call' | 'note' | 'ticket'
          direction: 'inbound' | 'outbound' | 'internal'
          content: string
          sentiment_score?: number | null
          ai_summary?: string | null
          interaction_date?: string
        }
        Update: {
          id?: string
          customer_id?: string
          agent_id?: string | null
          type?: 'email' | 'chat' | 'call' | 'note' | 'ticket'
          direction?: 'inbound' | 'outbound' | 'internal'
          content?: string
          sentiment_score?: number | null
          ai_summary?: string | null
          interaction_date?: string
        }
      }
      transactions: {
        Row: {
          id: string
          customer_id: string
          amount: number
          currency: string | null
          status: 'completed' | 'pending' | 'refunded' | 'failed'
          transaction_date: string
        }
        Insert: {
          id?: string
          customer_id: string
          amount: number
          currency?: string | null
          status: 'completed' | 'pending' | 'refunded' | 'failed'
          transaction_date?: string
        }
        Update: {
          id?: string
          customer_id?: string
          amount?: number
          currency?: string | null
          status?: 'completed' | 'pending' | 'refunded' | 'failed'
          transaction_date?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string | null
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
        }
      }
      customer_tags: {
        Row: {
          customer_id: string
          tag_id: string
          applied_at: string
        }
        Insert: {
          customer_id: string
          tag_id: string
          applied_at?: string
        }
        Update: {
          customer_id?: string
          tag_id?: string
          applied_at?: string
        }
      }
      sf_profiles: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      sf_roles: {
        Row: {
          id: string
          name: string
          parent_role_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          parent_role_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          parent_role_id?: string | null
          created_at?: string
        }
      }
      sf_users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          alias: string
          email: string
          username: string
          nickname: string | null
          title: string | null
          company: string | null
          department: string | null
          role_id: string | null
          profile_id: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          alias: string
          email: string
          username: string
          nickname?: string | null
          title?: string | null
          company?: string | null
          department?: string | null
          role_id?: string | null
          profile_id?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          alias?: string
          email?: string
          username?: string
          nickname?: string | null
          title?: string | null
          company?: string | null
          department?: string | null
          role_id?: string | null
          profile_id?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      sf_objects: {
        Row: {
          id: string
          label: string
          plural_label: string
          api_name: string
          is_custom: boolean
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          plural_label: string
          api_name: string
          is_custom?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          plural_label?: string
          api_name?: string
          is_custom?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sf_fields: {
        Row: {
          id: string
          object_id: string
          field_label: string
          field_api_name: string
          data_type: 'Text' | 'Number' | 'Picklist' | 'Checkbox' | 'Date' | 'Lookup'
          target_object_id: string | null
          is_required: boolean
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          object_id: string
          field_label: string
          field_api_name: string
          data_type: 'Text' | 'Number' | 'Picklist' | 'Checkbox' | 'Date' | 'Lookup'
          target_object_id?: string | null
          is_required?: boolean
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          object_id?: string
          field_label?: string
          field_api_name?: string
          data_type?: 'Text' | 'Number' | 'Picklist' | 'Checkbox' | 'Date' | 'Lookup'
          target_object_id?: string | null
          is_required?: boolean
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sf_records: {
        Row: {
          id: string
          object_id: string
          owner_id: string | null
          record_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          object_id: string
          owner_id?: string | null
          record_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          object_id?: string
          owner_id?: string | null
          record_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      sf_activities: {
        Row: {
          id: string
          record_id: string
          user_id: string | null
          type: string
          subject: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          record_id: string
          user_id?: string | null
          type: string
          subject: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          record_id?: string
          user_id?: string | null
          type?: string
          subject?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sf_activities_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "sf_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sf_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sf_users"
            referencedColumns: ["id"]
          },
        ]
      }
      sf_flows: {
        Row: {
          id: string
          name: string
          object_id: string
          trigger_type: 'onCreate' | 'onUpdate' | 'onSave'
          conditions: any
          actions: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          object_id: string
          trigger_type: 'onCreate' | 'onUpdate' | 'onSave'
          conditions?: any
          actions?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          object_id?: string
          trigger_type?: 'onCreate' | 'onUpdate' | 'onSave'
          conditions?: any
          actions?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sf_flows_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "sf_objects"
            referencedColumns: ["id"]
          }
        ]
      }
      sf_apps: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sf_app_tabs: {
        Row: {
          id: string
          app_id: string
          object_id: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          object_id: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          object_id?: string
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sf_app_tabs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "sf_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sf_app_tabs_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "sf_objects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
