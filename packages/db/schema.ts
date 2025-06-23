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
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "site_source_mappings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_source_mappings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_source_mappings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "site_source_mappings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "site_source_mappings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "site_source_mappings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
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
          id: string
          is_parent: boolean
          name: string
          parent_id: string | null
          tenant_id: string
        }
        Insert: {
          id?: string
          is_parent?: boolean
          name: string
          parent_id?: string | null
          tenant_id: string
        }
        Update: {
          id?: string
          is_parent?: boolean
          name?: string
          parent_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
        ]
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
          source_id: string
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
          source_id: string
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
          source_id?: string
          start_date?: string
          tenant_id?: string
          total_price?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_billings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_billings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_billings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_billings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_billings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_billings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
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
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_devices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_devices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_devices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_devices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_devices_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
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
          id: string
          last_activity: string | null
          license_skus: string[]
          metadata: Json | null
          mfa_enforced: boolean
          mfa_methods: Json | null
          name: string
          site_id: string
          source_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          enabled: boolean
          enforcement_type: string
          external_id: string
          id?: string
          last_activity?: string | null
          license_skus: string[]
          metadata?: Json | null
          mfa_enforced: boolean
          mfa_methods?: Json | null
          name: string
          site_id: string
          source_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          enabled?: boolean
          enforcement_type?: string
          external_id?: string
          id?: string
          last_activity?: string | null
          license_skus?: string[]
          metadata?: Json | null
          mfa_enforced?: boolean
          mfa_methods?: Json | null
          name?: string
          site_id?: string
          source_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_identities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
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
      source_integrations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          last_sync_at: string | null
          progress: number | null
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
          progress?: number | null
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
          progress?: number | null
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
      source_licenses: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          services: string[]
          sku: string
          source_id: string
          tags: string[]
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          services: string[]
          sku: string
          source_id: string
          tags: string[]
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          services?: string[]
          sku?: string
          source_id?: string
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "source_licenses_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_licenses_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_licenses_source_id_fkey"
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
          filters: Json | null
          id: string
          is_historic: boolean
          metadata: Json | null
          metric: number
          name: string
          route: string | null
          site_id: string
          source_id: string
          tenant_id: string
          thresholds: Json | null
          total: number | null
          unit: string
          visual: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_historic?: boolean
          metadata?: Json | null
          metric: number
          name: string
          route?: string | null
          site_id: string
          source_id: string
          tenant_id: string
          thresholds?: Json | null
          total?: number | null
          unit: string
          visual?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_historic?: boolean
          metadata?: Json | null
          metric?: number
          name?: string
          route?: string | null
          site_id?: string
          source_id?: string
          tenant_id?: string
          thresholds?: Json | null
          total?: number | null
          unit?: string
          visual?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
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
      source_policies: {
        Row: {
          created_at: string | null
          external_id: string
          id: string
          metadata: Json | null
          name: string
          site_id: string
          source_id: string
          status: string
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
          source_id: string
          status: string
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
          source_id?: string
          status?: string
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_policies_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_policies_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_policies_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_policies_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_policies_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_policies_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
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
            foreignKeyName: "source_policies_tenant_id_fkey"
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
      site_mappings_view: {
        Row: {
          external_id: string | null
          external_name: string | null
          id: string | null
          is_parent: boolean | null
          metadata: Json | null
          parent_id: string | null
          parent_name: string | null
          site_id: string | null
          site_name: string | null
          source_id: string | null
          source_name: string | null
          source_slug: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
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
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "site_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
        ]
      }
      source_identities_view: {
        Row: {
          created_at: string | null
          email: string | null
          enabled: boolean | null
          enforcement_type: string | null
          external_id: string | null
          id: string | null
          last_activity: string | null
          license_skus: string[] | null
          metadata: Json | null
          mfa_enforced: boolean | null
          mfa_methods: Json | null
          name: string | null
          parent_id: string | null
          parent_name: string | null
          site_id: string | null
          site_name: string | null
          source_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_identities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_identities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
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
          last_sync_at: string | null
          source_id: string | null
          source_name: string | null
          source_slug: string | null
          status: string | null
          tenant_id: string | null
          token: string | null
          token_expiration: string | null
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
      source_metrics_aggregated: {
        Row: {
          filters: Json | null
          metric: number | null
          name: string | null
          route: string | null
          source_id: string | null
          thresholds: Json | null
          total: number | null
          unit: string | null
          visual: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_metrics_aggregated_grouped: {
        Row: {
          filters: Json | null
          metric: number | null
          name: string | null
          parent_id: string | null
          route: string | null
          source_id: string | null
          thresholds: Json | null
          total: number | null
          unit: string | null
          visual: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "sites_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
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
          filters: Json | null
          id: string | null
          is_historic: boolean | null
          metadata: Json | null
          metric: number | null
          name: string | null
          route: string | null
          site_id: string | null
          source_id: string | null
          tenant_id: string | null
          thresholds: Json | null
          total: number | null
          unit: string | null
          visual: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["site_id"]
          },
          {
            foreignKeyName: "source_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "source_identities_view"
            referencedColumns: ["parent_id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "site_mappings_view"
            referencedColumns: ["source_id"]
          },
          {
            foreignKeyName: "source_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source_devices_view"
            referencedColumns: ["source_id"]
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
