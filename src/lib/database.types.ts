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
    }
  }
}
