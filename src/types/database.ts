export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          role_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string
          id: string
          name: string
          rights: Json | null
          tenant_id: string | null
        }
        Insert: {
          description: string
          id?: string
          name: string
          rights?: Json | null
          tenant_id?: string | null
        }
        Update: {
          description?: string
          id?: string
          name?: string
          rights?: Json | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_source_mappings: {
        Row: {
          external_id: string
          external_name: string
          id: string
          metadata: Json | null
          site_id: string
          source_id: string
          tenant_id: string
        }
        Insert: {
          external_id: string
          external_name: string
          id?: string
          metadata?: Json | null
          site_id: string
          source_id: string
          tenant_id: string
        }
        Update: {
          external_id?: string
          external_name?: string
          id?: string
          metadata?: Json | null
          site_id?: string
          source_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_source_mappings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_source_mappings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_source_mappings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          client_id: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          client_id: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          client_id?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      source_devices: {
        Row: {
          external_id: string
          hostname: string
          id: string
          metadata: Json | null
          os: string
          serial: string
          site_id: string
          source_id: string
          tenant_id: string
        }
        Insert: {
          external_id: string
          hostname: string
          id?: string
          metadata?: Json | null
          os: string
          serial: string
          site_id: string
          source_id: string
          tenant_id: string
        }
        Update: {
          external_id?: string
          hostname?: string
          id?: string
          metadata?: Json | null
          os?: string
          serial?: string
          site_id?: string
          source_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_devices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_devices_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      source_integrations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          last_sync_at: string | null
          source_id: string
          status: string | null
          tenant_id: string
          token: string | null
          token_expiration: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          source_id: string
          status?: string | null
          tenant_id: string
          token?: string | null
          token_expiration?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          source_id?: string
          status?: string | null
          tenant_id?: string
          token?: string | null
          token_expiration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      source_metrics: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          metadata: Json | null
          metric: number
          name: string
          site_id: string
          source_id: string
          tenant_id: string
          total: number | null
          unit: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          metadata?: Json | null
          metric: number
          name: string
          site_id: string
          source_id: string
          tenant_id: string
          total?: number | null
          unit: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          metadata?: Json | null
          metric?: number
          name?: string
          site_id?: string
          source_id?: string
          tenant_id?: string
          total?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          category: string | null
          color: string | null
          config_schema: Json | null
          description: string
          documentation_url: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          product_url: string | null
          slug: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          config_schema?: Json | null
          description: string
          documentation_url?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          product_url?: string | null
          slug: string
        }
        Update: {
          category?: string | null
          color?: string | null
          config_schema?: Json | null
          description?: string
          documentation_url?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          product_url?: string | null
          slug?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string
          id: string
          last_login: string | null
          name: string
          role_id: string
          tenant_id: string
        }
        Insert: {
          email: string
          id: string
          last_login?: string | null
          name: string
          role_id: string
          tenant_id: string
        }
        Update: {
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          role_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_access: {
        Args: { module: string; access: string }
        Returns: boolean
      }
      is_tenant: {
        Args: { id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
