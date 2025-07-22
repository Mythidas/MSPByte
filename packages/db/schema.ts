export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      roles: {
        Row: {
          description: string
          id: string
          name: string
          rights: Json
          tenant_id: string | null
        }
        Insert: {
          description: string
          id?: string
          name: string
          rights?: Json
          tenant_id?: string | null
        }
        Update: {
          description?: string
          id?: string
          name?: string
          rights?: Json
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
      site_group_memberships: {
        Row: {
          group_id: string
          site_id: string
        }
        Insert: {
          group_id: string
          site_id: string
        }
        Update: {
          group_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "site_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_group_memberships_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_group_memberships_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_group_memberships_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "site_group_memberships_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "site_group_memberships_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_tenants_view"
            referencedColumns: ["parent_id"]
          },
        ]
      }
      site_groups: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
          tenant_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug?: string
          tenant_id: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
          tenant_id?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          id: string
          is_parent: boolean
          name: string
          parent_id: string | null
          parent_slug: string | null
          slug: string
          tenant_id: string
        }
        Insert: {
          id?: string
          is_parent?: boolean
          name: string
          parent_id?: string | null
          parent_slug?: string | null
          slug?: string
          tenant_id: string
        }
        Update: {
          id?: string
          is_parent?: boolean
          name?: string
          parent_id?: string | null
          parent_slug?: string | null
          slug?: string
          tenant_id?: string
        }
        Relationships: []
      }
      source_billings: {
        Row: {
          billing_type: string
          created_at: string | null
          currency: string
          end_date: string | null
          id: string
          metadata: Json | null
          quantity: number
          reference_code: string | null
          site_id: string
          sku: string
          source_id: string | null
          start_date: string
          tenant_id: string
          total_price: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          billing_type: string
          created_at?: string | null
          currency: string
          end_date?: string | null
          id?: string
          metadata?: Json | null
          quantity: number
          reference_code?: string | null
          site_id: string
          sku: string
          source_id?: string | null
          start_date: string
          tenant_id: string
          total_price?: number | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          billing_type?: string
          created_at?: string | null
          currency?: string
          end_date?: string | null
          id?: string
          metadata?: Json | null
          quantity?: number
          reference_code?: string | null
          site_id?: string
          sku?: string
          source_id?: string | null
          start_date?: string
          tenant_id?: string
          total_price?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_billings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_billings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_billings_tenant_id_fkey"
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
          source_id: string | null
          source_tenant_id: string
          sync_id: string | null
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
          source_id?: string | null
          source_tenant_id: string
          sync_id?: string | null
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
          source_id?: string | null
          source_tenant_id?: string
          sync_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_devices_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_devices_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_devices_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_devices_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_devices_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "source_sync_jobs"
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
      source_identities: {
        Row: {
          created_at: string | null
          email: string
          enabled: boolean
          enforcement_type: string
          external_id: string
          group_ids: string[]
          id: string
          last_activity: string | null
          license_skus: string[]
          metadata: Json | null
          mfa_enforced: boolean
          mfa_methods: Json | null
          name: string
          role_ids: string[]
          site_id: string
          source_id: string
          source_tenant_id: string | null
          sync_id: string | null
          tenant_id: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          enabled: boolean
          enforcement_type: string
          external_id: string
          group_ids?: string[]
          id?: string
          last_activity?: string | null
          license_skus: string[]
          metadata?: Json | null
          mfa_enforced: boolean
          mfa_methods?: Json | null
          name: string
          role_ids?: string[]
          site_id: string
          source_id: string
          source_tenant_id?: string | null
          sync_id?: string | null
          tenant_id: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          enabled?: boolean
          enforcement_type?: string
          external_id?: string
          group_ids?: string[]
          id?: string
          last_activity?: string | null
          license_skus?: string[]
          metadata?: Json | null
          mfa_enforced?: boolean
          mfa_methods?: Json | null
          name?: string
          role_ids?: string[]
          site_id?: string
          source_id?: string
          source_tenant_id?: string | null
          sync_id?: string | null
          tenant_id?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_identities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_identities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_identities_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_identities_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_identities_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "source_sync_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_identities_tenant_id_fkey"
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
          source_id: string | null
          tenant_id: string
          token: string | null
          token_expiration: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          source_id?: string | null
          tenant_id: string
          token?: string | null
          token_expiration?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          source_id?: string | null
          tenant_id?: string
          token?: string | null
          token_expiration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_integrations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_integrations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      source_license_info: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          services: string[]
          sku: string
          source_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          services: string[]
          sku: string
          source_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          services?: string[]
          sku?: string
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_license_info_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_license_info_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_metric_definitions: {
        Row: {
          created_at: string | null
          description: string
          filters: Json
          icon: string | null
          id: string
          order: number | null
          roc_positive: boolean | null
          source_id: string
          thresholds: Json
          unit: string
          updated_at: string | null
          visual: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          filters: Json
          icon?: string | null
          id: string
          order?: number | null
          roc_positive?: boolean | null
          source_id: string
          thresholds: Json
          unit: string
          updated_at?: string | null
          visual?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          filters?: Json
          icon?: string | null
          id?: string
          order?: number | null
          roc_positive?: boolean | null
          source_id?: string
          thresholds?: Json
          unit?: string
          updated_at?: string | null
          visual?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_metric_definitions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_metric_definitions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_metrics: {
        Row: {
          created_at: string | null
          delta: number | null
          id: string
          metric: number
          name: string
          site_id: string
          source_id: string | null
          source_tenant_id: string
          sync_id: string | null
          tenant_id: string
          total: number
        }
        Insert: {
          created_at?: string | null
          delta?: number | null
          id?: string
          metric: number
          name: string
          site_id: string
          source_id?: string | null
          source_tenant_id: string
          sync_id?: string | null
          tenant_id: string
          total: number
        }
        Update: {
          created_at?: string | null
          delta?: number | null
          id?: string
          metric?: number
          name?: string
          site_id?: string
          source_id?: string | null
          source_tenant_id?: string
          sync_id?: string | null
          tenant_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "source_metrics_name_source_id_fkey"
            columns: ["name", "source_id"]
            isOneToOne: false
            referencedRelation: "source_metric_definitions"
            referencedColumns: ["id", "source_id"]
          },
          {
            foreignKeyName: "source_metrics_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_metrics_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_metrics_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "source_sync_jobs"
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
      source_policies: {
        Row: {
          created_at: string | null
          external_id: string
          id: string
          metadata: Json | null
          name: string
          site_id: string
          source_id: string | null
          source_tenant_id: string
          status: string
          sync_id: string | null
          tenant_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          external_id: string
          id?: string
          metadata?: Json | null
          name: string
          site_id: string
          source_id?: string | null
          source_tenant_id: string
          status: string
          sync_id?: string | null
          tenant_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          external_id?: string
          id?: string
          metadata?: Json | null
          name?: string
          site_id?: string
          source_id?: string | null
          source_tenant_id?: string
          status?: string
          sync_id?: string | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_policies_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_policies_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_policies_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_policies_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_policies_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "source_sync_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      source_sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error: string | null
          est_duration: number
          id: string
          last_attempt_at: string | null
          retry_count: number
          site_id: string
          source_id: string
          source_tenant_id: string
          started_at: string | null
          state: Json
          status: string
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          est_duration?: number
          id?: string
          last_attempt_at?: string | null
          retry_count?: number
          site_id: string
          source_id: string
          source_tenant_id: string
          started_at?: string | null
          state?: Json
          status?: string
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          est_duration?: number
          id?: string
          last_attempt_at?: string | null
          retry_count?: number
          site_id?: string
          source_id?: string
          source_tenant_id?: string
          started_at?: string | null
          state?: Json
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_sync_jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_sync_jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_sync_jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_sync_jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_sync_jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_tenants_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_sync_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_sync_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_sync_jobs_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_sync_jobs_source_tenant_id_fkey"
            columns: ["source_tenant_id"]
            isOneToOne: false
            referencedRelation: "source_tenants_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_sync_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      source_tenants: {
        Row: {
          external_id: string
          external_name: string
          id: string
          last_sync: string | null
          metadata: Json | null
          site_id: string
          source_id: string
          tenant_id: string
        }
        Insert: {
          external_id: string
          external_name: string
          id?: string
          last_sync?: string | null
          metadata?: Json | null
          site_id: string
          source_id?: string
          tenant_id: string
        }
        Update: {
          external_id?: string
          external_name?: string
          id?: string
          last_sync?: string | null
          metadata?: Json | null
          site_id?: string
          source_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_source_mappings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_tenants_view"
            referencedColumns: ["parent_id"]
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
        }
        Insert: {
          category?: string | null
          color?: string | null
          config_schema?: Json | null
          description: string
          documentation_url?: string | null
          icon_url?: string | null
          id: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          product_url?: string | null
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
      user_options: {
        Row: {
          created_at: string
          id: string
          selected_source: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          selected_source?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          selected_source?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_options_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_options_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_options_selected_source_fkey"
            columns: ["selected_source"]
            isOneToOne: false
            referencedRelation: "source_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_options_selected_source_fkey"
            columns: ["selected_source"]
            isOneToOne: false
            referencedRelation: "source_integrations_view"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string
          id: string
          last_login: string | null
          metadata: Json
          name: string
          role_id: string
          status: string | null
          tenant_id: string
        }
        Insert: {
          email: string
          id?: string
          last_login?: string | null
          metadata?: Json
          name: string
          role_id: string
          status?: string | null
          tenant_id: string
        }
        Update: {
          email?: string
          id?: string
          last_login?: string | null
          metadata?: Json
          name?: string
          role_id?: string
          status?: string | null
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
      rollup_metrics_global: {
        Row: {
          created_at: string | null
          delta: number | null
          description: string | null
          filters: Json | null
          icon: string | null
          name: string | null
          roc_positive: boolean | null
          source_id: string | null
          thresholds: Json | null
          total: number | null
          unit: string | null
          value: number | null
          visual: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_metrics_name_source_id_fkey"
            columns: ["name", "source_id"]
            isOneToOne: false
            referencedRelation: "source_metric_definitions"
            referencedColumns: ["id", "source_id"]
          },
        ]
      }
      rollup_metrics_parent: {
        Row: {
          created_at: string | null
          delta: number | null
          description: string | null
          filters: Json | null
          icon: string | null
          name: string | null
          parent_id: string | null
          roc_positive: boolean | null
          source_id: string | null
          thresholds: Json | null
          total: number | null
          unit: string | null
          value: number | null
          visual: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_metrics_name_source_id_fkey"
            columns: ["name", "source_id"]
            isOneToOne: false
            referencedRelation: "source_metric_definitions"
            referencedColumns: ["id", "source_id"]
          },
        ]
      }
      rollup_metrics_site: {
        Row: {
          created_at: string | null
          delta: number | null
          description: string | null
          filters: Json | null
          icon: string | null
          name: string | null
          roc_positive: boolean | null
          site_id: string | null
          source_id: string | null
          thresholds: Json | null
          total: number | null
          unit: string | null
          value: number | null
          visual: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_metrics_name_source_id_fkey"
            columns: ["name", "source_id"]
            isOneToOne: false
            referencedRelation: "source_metric_definitions"
            referencedColumns: ["id", "source_id"]
          },
        ]
      }
      sites_view: {
        Row: {
          id: string | null
          is_parent: boolean | null
          name: string | null
          parent_id: string | null
          parent_name: string | null
          parent_slug: string | null
          slug: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      source_devices_view: {
        Row: {
          external_id: string | null
          hostname: string | null
          id: string | null
          metadata: Json | null
          os: string | null
          parent_id: string | null
          parent_name: string | null
          serial: string | null
          site_id: string | null
          site_name: string | null
          source_id: string | null
          source_name: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      source_identities_view: {
        Row: {
          created_at: string | null
          email: string | null
          enabled: boolean | null
          enforcement_type: string | null
          external_id: string | null
          group_ids: string[] | null
          id: string | null
          last_activity: string | null
          license_skus: string[] | null
          metadata: Json | null
          mfa_enforced: boolean | null
          mfa_method_count: number | null
          mfa_methods: Json | null
          name: string | null
          parent_id: string | null
          parent_name: string | null
          role_ids: string[] | null
          site_id: string | null
          site_name: string | null
          source_id: string | null
          tenant_id: string | null
          type: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_identities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_identities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_identities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      source_integrations_view: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string | null
          source_id: string | null
          source_name: string | null
          token: string | null
          token_expiration: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_integrations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_integrations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_metrics_newest: {
        Row: {
          created_at: string | null
          delta: number | null
          id: string | null
          metric: number | null
          name: string | null
          site_id: string | null
          source_id: string | null
          tenant_id: string | null
          total: number | null
        }
        Insert: {
          created_at?: string | null
          delta?: number | null
          id?: string | null
          metric?: number | null
          name?: string | null
          site_id?: string | null
          source_id?: string | null
          tenant_id?: string | null
          total?: number | null
        }
        Update: {
          created_at?: string | null
          delta?: number | null
          id?: string | null
          metric?: number | null
          name?: string | null
          site_id?: string | null
          source_id?: string | null
          tenant_id?: string | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "source_metrics_name_source_id_fkey"
            columns: ["name", "source_id"]
            isOneToOne: false
            referencedRelation: "source_metric_definitions"
            referencedColumns: ["id", "source_id"]
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
      source_tenants_view: {
        Row: {
          external_id: string | null
          external_name: string | null
          id: string | null
          last_sync: string | null
          metadata: Json | null
          parent_id: string | null
          parent_name: string | null
          site_id: string | null
          site_name: string | null
          source_id: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_source_mappings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_tenants_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_tenants_view"
            referencedColumns: ["parent_id"]
          },
        ]
      }
      user_view: {
        Row: {
          email: string | null
          id: string | null
          last_login: string | null
          metadata: Json | null
          name: string | null
          rights: Json | null
          selected_source: string | null
          status: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_options_selected_source_fkey"
            columns: ["selected_source"]
            isOneToOne: false
            referencedRelation: "source_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_options_selected_source_fkey"
            columns: ["selected_source"]
            isOneToOne: false
            referencedRelation: "source_integrations_view"
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
    Functions: {
      claim_sync_jobs: {
        Args: { max_est_duration: number }
        Returns: {
          completed_at: string | null
          created_at: string | null
          error: string | null
          est_duration: number
          id: string
          last_attempt_at: string | null
          retry_count: number
          site_id: string
          source_id: string
          source_tenant_id: string
          started_at: string | null
          state: Json
          status: string
          tenant_id: string
        }[]
      }
      gen_random_suuid: {
        Args: { length?: number }
        Returns: string
      }
      get_rollup_metrics: {
        Args: { _scope: string; _id: string; _source_id: string }
        Returns: {
          name: string
          value: number
          delta: number
          unit: string
          total: number
          source_id: string
          roc_positive: boolean
          description: string
          route: string
          visual: string
          icon: string
          filters: Json
          thresholds: Json
          created_at: string
        }[]
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
