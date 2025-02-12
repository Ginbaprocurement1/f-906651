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
      cart_items: {
        Row: {
          created_at: string
          custom_address: string | null
          custom_city: string | null
          custom_country: string | null
          custom_location_name: string | null
          custom_postal_code: string | null
          delivery_location_id: number | null
          delivery_method: string | null
          id: number
          payment_method: string | null
          pickup_location_id: number | null
          product_id: number | null
          quantity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom_address?: string | null
          custom_city?: string | null
          custom_country?: string | null
          custom_location_name?: string | null
          custom_postal_code?: string | null
          delivery_location_id?: number | null
          delivery_method?: string | null
          id?: number
          payment_method?: string | null
          pickup_location_id?: number | null
          product_id?: number | null
          quantity?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom_address?: string | null
          custom_city?: string | null
          custom_country?: string | null
          custom_location_name?: string | null
          custom_postal_code?: string | null
          delivery_location_id?: number | null
          delivery_method?: string | null
          id?: number
          payment_method?: string | null
          pickup_location_id?: number | null
          product_id?: number | null
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_delivery_location_id_fkey"
            columns: ["delivery_location_id"]
            isOneToOne: false
            referencedRelation: "master_client_locations"
            referencedColumns: ["delivery_location_id"]
          },
          {
            foreignKeyName: "cart_items_pickup_location_id_fkey"
            columns: ["pickup_location_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_locations"
            referencedColumns: ["pickup_location_id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_product"
            referencedColumns: ["product_id"]
          },
        ]
      }
      delivery_province_distance: {
        Row: {
          created_at: string
          distance_km: number | null
          id: number
          province_id_A: string | null
          province_id_B: string | null
        }
        Insert: {
          created_at?: string
          distance_km?: number | null
          id?: number
          province_id_A?: string | null
          province_id_B?: string | null
        }
        Update: {
          created_at?: string
          distance_km?: number | null
          id?: number
          province_id_A?: string | null
          province_id_B?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_province_distance_province_id_A_fkey"
            columns: ["province_id_A"]
            isOneToOne: false
            referencedRelation: "master_province"
            referencedColumns: ["province_id"]
          },
          {
            foreignKeyName: "delivery_province_distance_province_id_B_fkey"
            columns: ["province_id_B"]
            isOneToOne: false
            referencedRelation: "master_province"
            referencedColumns: ["province_id"]
          },
        ]
      }
      delivery_times: {
        Row: {
          delivery_days: string | null
          id: number
          province_id_a: string | null
          province_id_b: string | null
          supplier_id: number | null
        }
        Insert: {
          delivery_days?: string | null
          id?: number
          province_id_a?: string | null
          province_id_b?: string | null
          supplier_id?: number | null
        }
        Update: {
          delivery_days?: string | null
          id?: number
          province_id_a?: string | null
          province_id_b?: string | null
          supplier_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_times_province_id_a_fkey"
            columns: ["province_id_a"]
            isOneToOne: false
            referencedRelation: "master_province"
            referencedColumns: ["province_id"]
          },
          {
            foreignKeyName: "delivery_times_province_id_b_fkey"
            columns: ["province_id_b"]
            isOneToOne: false
            referencedRelation: "master_province"
            referencedColumns: ["province_id"]
          },
          {
            foreignKeyName: "delivery_times_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      email_messages: {
        Row: {
          body: string | null
          created_at: string
          destination_email: string
          email_id: number
          email_in: boolean
          rfq_id: number | null
          sender_email: string
          summary: string | null
          supplier_name: string | null
          tittle: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          destination_email: string
          email_id?: number
          email_in?: boolean
          rfq_id?: number | null
          sender_email: string
          summary?: string | null
          supplier_name?: string | null
          tittle?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          destination_email?: string
          email_id?: number
          email_in?: boolean
          rfq_id?: number | null
          sender_email?: string
          summary?: string | null
          supplier_name?: string | null
          tittle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "email_messages_view"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "email_messages_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "invoice_totals"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "email_messages_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "email_messages_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "requests_and_products_view"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "email_messages_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "rfq_card_supplier_price_status"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "email_messages_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "unique_rfq_suppliers"
            referencedColumns: ["supplier_name"]
          },
        ]
      }
      invoice_header: {
        Row: {
          company_id: number | null
          created_at: string
          invoice_date: string
          invoice_due_date: string
          invoice_id: string
          pdf_url: string | null
          po_id: string | null
          status: string
          supplier_id: number | null
        }
        Insert: {
          company_id?: number | null
          created_at?: string
          invoice_date: string
          invoice_due_date: string
          invoice_id?: string
          pdf_url?: string | null
          po_id?: string | null
          status: string
          supplier_id?: number | null
        }
        Update: {
          company_id?: number | null
          created_at?: string
          invoice_date?: string
          invoice_due_date?: string
          invoice_id?: string
          pdf_url?: string | null
          po_id?: string | null
          status?: string
          supplier_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_header_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "master_client_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "invoice_header_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "po_header"
            referencedColumns: ["po_id"]
          },
          {
            foreignKeyName: "invoice_header_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      invoice_line: {
        Row: {
          created_at: string
          id: number
          invoice_id: string | null
          price_with_vat: number
          price_without_vat: number
          product_id: number | null
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: never
          invoice_id?: string | null
          price_with_vat: number
          price_without_vat: number
          product_id?: number | null
          quantity: number
        }
        Update: {
          created_at?: string
          id?: never
          invoice_id?: string | null
          price_with_vat?: number
          price_without_vat?: number
          product_id?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_header"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_totals"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_product"
            referencedColumns: ["product_id"]
          },
        ]
      }
      master_client_company: {
        Row: {
          address: string | null
          CIF: string | null
          company_email: string | null
          company_id: number
          company_name: string | null
          country: string | null
          created_at: string
          logo_URL: string | null
          pricing_plan: string
          province: string | null
          town: string | null
          zip_code: number | null
        }
        Insert: {
          address?: string | null
          CIF?: string | null
          company_email?: string | null
          company_id?: number
          company_name?: string | null
          country?: string | null
          created_at?: string
          logo_URL?: string | null
          pricing_plan?: string
          province?: string | null
          town?: string | null
          zip_code?: number | null
        }
        Update: {
          address?: string | null
          CIF?: string | null
          company_email?: string | null
          company_id?: number
          company_name?: string | null
          country?: string | null
          created_at?: string
          logo_URL?: string | null
          pricing_plan?: string
          province?: string | null
          town?: string | null
          zip_code?: number | null
        }
        Relationships: []
      }
      master_client_contacts: {
        Row: {
          alias: string
          company_id: number | null
          contact_id: string
          contact_name: string
          created_at: string
          phone_number: string
        }
        Insert: {
          alias: string
          company_id?: number | null
          contact_id?: string
          contact_name: string
          created_at?: string
          phone_number: string
        }
        Update: {
          alias?: string
          company_id?: number | null
          contact_id?: string
          contact_name?: string
          created_at?: string
          phone_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_client_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "master_client_company"
            referencedColumns: ["company_id"]
          },
        ]
      }
      master_client_locations: {
        Row: {
          address: string | null
          company_id: number | null
          country: string | null
          created_at: string
          delivery_location_id: number
          location_name: string | null
          province_id: string | null
          town: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          company_id?: number | null
          country?: string | null
          created_at?: string
          delivery_location_id?: number
          location_name?: string | null
          province_id?: string | null
          town?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          company_id?: number | null
          country?: string | null
          created_at?: string
          delivery_location_id?: number
          location_name?: string | null
          province_id?: string | null
          town?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_client_locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "master_client_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "master_client_locations_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "master_province"
            referencedColumns: ["province_id"]
          },
        ]
      }
      master_product: {
        Row: {
          created_at: string
          delivery_days: number | null
          manufacturer: string | null
          manufacturer_logo: string | null
          price_with_vat: number | null
          price_without_vat: number | null
          product_category_l1: string | null
          product_category_l2: string | null
          product_description: string | null
          product_id: number
          product_image_url: string | null
          product_name: string | null
          product_uom: string | null
          ref_supplier: string | null
          stock_demand_category: string | null
          stock_quantity: number | null
          supplier_name: string | null
        }
        Insert: {
          created_at?: string
          delivery_days?: number | null
          manufacturer?: string | null
          manufacturer_logo?: string | null
          price_with_vat?: number | null
          price_without_vat?: number | null
          product_category_l1?: string | null
          product_category_l2?: string | null
          product_description?: string | null
          product_id?: number
          product_image_url?: string | null
          product_name?: string | null
          product_uom?: string | null
          ref_supplier?: string | null
          stock_demand_category?: string | null
          stock_quantity?: number | null
          supplier_name?: string | null
        }
        Update: {
          created_at?: string
          delivery_days?: number | null
          manufacturer?: string | null
          manufacturer_logo?: string | null
          price_with_vat?: number | null
          price_without_vat?: number | null
          product_category_l1?: string | null
          product_category_l2?: string | null
          product_description?: string | null
          product_id?: number
          product_image_url?: string | null
          product_name?: string | null
          product_uom?: string | null
          ref_supplier?: string | null
          stock_demand_category?: string | null
          stock_quantity?: number | null
          supplier_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_product_product_category_l1_fkey"
            columns: ["product_category_l1"]
            isOneToOne: false
            referencedRelation: "master_product_category"
            referencedColumns: ["product_category"]
          },
          {
            foreignKeyName: "master_product_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "email_messages_view"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_product_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "invoice_totals"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_product_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_product_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "requests_and_products_view"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_product_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "rfq_card_supplier_price_status"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_product_supplier_name_fkey"
            columns: ["supplier_name"]
            isOneToOne: false
            referencedRelation: "unique_rfq_suppliers"
            referencedColumns: ["supplier_name"]
          },
        ]
      }
      master_product_category: {
        Row: {
          created_at: string
          icon_link: string | null
          product_category: string
        }
        Insert: {
          created_at?: string
          icon_link?: string | null
          product_category: string
        }
        Update: {
          created_at?: string
          icon_link?: string | null
          product_category?: string
        }
        Relationships: []
      }
      master_province: {
        Row: {
          province: string | null
          province_id: string
        }
        Insert: {
          province?: string | null
          province_id: string
        }
        Update: {
          province?: string | null
          province_id?: string
        }
        Relationships: []
      }
      master_suppliers_company: {
        Row: {
          address: string | null
          CIF: string | null
          country: string | null
          created_at: string
          iban: string | null
          province: string | null
          supplier_category_l1: string | null
          supplier_category_l2: string | null
          supplier_email: string | null
          supplier_id: number
          supplier_median_delivery_days: number | null
          supplier_name: string | null
          supplier_rating: number | null
          town: string | null
          zip_code: number | null
        }
        Insert: {
          address?: string | null
          CIF?: string | null
          country?: string | null
          created_at?: string
          iban?: string | null
          province?: string | null
          supplier_category_l1?: string | null
          supplier_category_l2?: string | null
          supplier_email?: string | null
          supplier_id?: number
          supplier_median_delivery_days?: number | null
          supplier_name?: string | null
          supplier_rating?: number | null
          town?: string | null
          zip_code?: number | null
        }
        Update: {
          address?: string | null
          CIF?: string | null
          country?: string | null
          created_at?: string
          iban?: string | null
          province?: string | null
          supplier_category_l1?: string | null
          supplier_category_l2?: string | null
          supplier_email?: string | null
          supplier_id?: number
          supplier_median_delivery_days?: number | null
          supplier_name?: string | null
          supplier_rating?: number | null
          town?: string | null
          zip_code?: number | null
        }
        Relationships: []
      }
      master_suppliers_locations: {
        Row: {
          address: string | null
          country: string | null
          created_at: string
          location_name: string | null
          pickup_location_id: number
          pickup_location_image: string | null
          province_id: string | null
          supplier_id: number | null
          town: string | null
          zip_code: number | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string
          location_name?: string | null
          pickup_location_id?: number
          pickup_location_image?: string | null
          province_id?: string | null
          supplier_id?: number | null
          town?: string | null
          zip_code?: number | null
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string
          location_name?: string | null
          pickup_location_id?: number
          pickup_location_image?: string | null
          province_id?: string | null
          supplier_id?: number | null
          town?: string | null
          zip_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "master_suppliers_locations_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "master_province"
            referencedColumns: ["province_id"]
          },
          {
            foreignKeyName: "master_suppliers_locations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      master_suppliers_user: {
        Row: {
          created_at: string
          supplier_company_id: number | null
          supplier_company_name: string | null
          supplier_official_email: string | null
          supplier_user_email: string | null
          supplier_user_id: number
          supplier_user_name: string | null
        }
        Insert: {
          created_at?: string
          supplier_company_id?: number | null
          supplier_company_name?: string | null
          supplier_official_email?: string | null
          supplier_user_email?: string | null
          supplier_user_id?: number
          supplier_user_name?: string | null
        }
        Update: {
          created_at?: string
          supplier_company_id?: number | null
          supplier_company_name?: string | null
          supplier_official_email?: string | null
          supplier_user_email?: string | null
          supplier_user_id?: number
          supplier_user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_suppliers_user_supplier_company_id_fkey"
            columns: ["supplier_company_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_id"]
          },
          {
            foreignKeyName: "master_suppliers_user_supplier_company_name_fkey"
            columns: ["supplier_company_name"]
            isOneToOne: false
            referencedRelation: "email_messages_view"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_suppliers_user_supplier_company_name_fkey"
            columns: ["supplier_company_name"]
            isOneToOne: false
            referencedRelation: "invoice_totals"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_suppliers_user_supplier_company_name_fkey"
            columns: ["supplier_company_name"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_suppliers_user_supplier_company_name_fkey"
            columns: ["supplier_company_name"]
            isOneToOne: false
            referencedRelation: "requests_and_products_view"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_suppliers_user_supplier_company_name_fkey"
            columns: ["supplier_company_name"]
            isOneToOne: false
            referencedRelation: "rfq_card_supplier_price_status"
            referencedColumns: ["supplier_name"]
          },
          {
            foreignKeyName: "master_suppliers_user_supplier_company_name_fkey"
            columns: ["supplier_company_name"]
            isOneToOne: false
            referencedRelation: "unique_rfq_suppliers"
            referencedColumns: ["supplier_name"]
          },
        ]
      }
      master_user: {
        Row: {
          company_id: number | null
          created_at: string
          id: string
          supplier_id: number | null
          user_email: string | null
          user_name: string | null
          user_role: string | null
          user_surname: string | null
        }
        Insert: {
          company_id?: number | null
          created_at?: string
          id: string
          supplier_id?: number | null
          user_email?: string | null
          user_name?: string | null
          user_role?: string | null
          user_surname?: string | null
        }
        Update: {
          company_id?: number | null
          created_at?: string
          id?: string
          supplier_id?: number | null
          user_email?: string | null
          user_name?: string | null
          user_role?: string | null
          user_surname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_user_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "master_client_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "master_user_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      pickup_times: {
        Row: {
          created_at: string
          id: number
          pickup_location_id: number | null
          time_limit: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          pickup_location_id?: number | null
          time_limit?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          pickup_location_id?: number | null
          time_limit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pickup_times_pickup_location_id_fkey"
            columns: ["pickup_location_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_locations"
            referencedColumns: ["pickup_location_id"]
          },
        ]
      }
      po_header: {
        Row: {
          address: string
          company_id: number | null
          contact_name: string
          country: string
          created_at: string | null
          delivery_method: string
          location_name: string
          payment_method: string
          phone_number: string
          po_id: string
          supplier_id: number | null
          town: string
          zip_code: string
        }
        Insert: {
          address: string
          company_id?: number | null
          contact_name: string
          country: string
          created_at?: string | null
          delivery_method: string
          location_name: string
          payment_method: string
          phone_number: string
          po_id: string
          supplier_id?: number | null
          town: string
          zip_code: string
        }
        Update: {
          address?: string
          company_id?: number | null
          contact_name?: string
          country?: string
          created_at?: string | null
          delivery_method?: string
          location_name?: string
          payment_method?: string
          phone_number?: string
          po_id?: string
          supplier_id?: number | null
          town?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "po_header_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "master_client_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "po_header_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      po_line: {
        Row: {
          created_at: string | null
          id: number
          po_id: string | null
          price_with_vat: number
          price_without_vat: number
          product_id: number | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          po_id?: string | null
          price_with_vat: number
          price_without_vat: number
          product_id?: number | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: number
          po_id?: string | null
          price_with_vat?: number
          price_without_vat?: number
          product_id?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "po_line_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "po_header"
            referencedColumns: ["po_id"]
          },
          {
            foreignKeyName: "po_line_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_product"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string
          id: number
          product_id: number | null
          rating: number
          review_text: string | null
          reviewer_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          product_id?: number | null
          rating: number
          review_text?: string | null
          reviewer_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          product_id?: number | null
          rating?: number
          review_text?: string | null
          reviewer_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_product"
            referencedColumns: ["product_id"]
          },
        ]
      }
      requests_and_products: {
        Row: {
          company_id: number | null
          created_at: string
          estimated_arrival_date: string | null
          payment_terms: string | null
          price: number | null
          product_id: number | null
          request_id: number
          rfq_id: number | null
          rfq_name: string | null
          status: string
          supplier_id: number
          units: number | null
        }
        Insert: {
          company_id?: number | null
          created_at?: string
          estimated_arrival_date?: string | null
          payment_terms?: string | null
          price?: number | null
          product_id?: number | null
          request_id?: number
          rfq_id?: number | null
          rfq_name?: string | null
          status?: string
          supplier_id: number
          units?: number | null
        }
        Update: {
          company_id?: number | null
          created_at?: string
          estimated_arrival_date?: string | null
          payment_terms?: string | null
          price?: number | null
          product_id?: number | null
          request_id?: number
          rfq_id?: number | null
          rfq_name?: string | null
          status?: string
          supplier_id?: number
          units?: number | null
        }
        Relationships: []
      }
      supplier_stock: {
        Row: {
          created_at: string
          location_id: number | null
          product_id: number | null
          quantity: number | null
          stock_id: string
          supplier_id: number | null
        }
        Insert: {
          created_at?: string
          location_id?: number | null
          product_id?: number | null
          quantity?: number | null
          stock_id?: string
          supplier_id?: number | null
        }
        Update: {
          created_at?: string
          location_id?: number | null
          product_id?: number | null
          quantity?: number | null
          stock_id?: string
          supplier_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_locations"
            referencedColumns: ["pickup_location_id"]
          },
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "master_product"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
    }
    Views: {
      delivery_dates_calculation: {
        Row: {
          base_delivery_days: number | null
          cart_item_id: number | null
          client_province_id: string | null
          delivery_location_id: number | null
          delivery_method: string | null
          pickup_location_id: number | null
          pickup_time_limit: string | null
          supplier_province_id: string | null
          total_delivery_days: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_delivery_location_id_fkey"
            columns: ["delivery_location_id"]
            isOneToOne: false
            referencedRelation: "master_client_locations"
            referencedColumns: ["delivery_location_id"]
          },
          {
            foreignKeyName: "cart_items_pickup_location_id_fkey"
            columns: ["pickup_location_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_locations"
            referencedColumns: ["pickup_location_id"]
          },
          {
            foreignKeyName: "master_client_locations_province_id_fkey"
            columns: ["client_province_id"]
            isOneToOne: false
            referencedRelation: "master_province"
            referencedColumns: ["province_id"]
          },
          {
            foreignKeyName: "master_suppliers_locations_province_id_fkey"
            columns: ["supplier_province_id"]
            isOneToOne: false
            referencedRelation: "master_province"
            referencedColumns: ["province_id"]
          },
        ]
      }
      email_messages_view: {
        Row: {
          body: string | null
          created_at: string | null
          destination_email: string | null
          email_id: number | null
          email_in: boolean | null
          rfq_id: number | null
          sender_email: string | null
          summary: string | null
          supplier_name: string | null
          supplier_user_name: string | null
        }
        Relationships: []
      }
      invoice_totals: {
        Row: {
          company_id: number | null
          invoice_date: string | null
          invoice_due_date: string | null
          invoice_id: string | null
          pdf_url: string | null
          status: string | null
          supplier_id: number | null
          supplier_name: string | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_header_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "master_client_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "invoice_header_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "master_suppliers_company"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      requests_and_products_view: {
        Row: {
          company_id: number | null
          estimated_arrival_date: string | null
          num_suppliers: number | null
          payment_terms: string | null
          price: number | null
          product_name: string | null
          product_uom: string | null
          rfq_id: number | null
          rfq_name: string | null
          supplier_name: string | null
          supplier_rating: number | null
          units: number | null
        }
        Relationships: []
      }
      rfq_card: {
        Row: {
          company_id: number | null
          fecha_creacion: string | null
          num_en_espera: number | null
          num_por_contestar: number | null
          num_presupuestos: number | null
          num_sin_respuesta: number | null
          num_suppliers: number | null
          progreso: number | null
          rfq_id: number | null
          rfq_name: string | null
        }
        Relationships: []
      }
      rfq_card_supplier_price_status: {
        Row: {
          company_id: number | null
          request_status: string | null
          rfq_id: number | null
          rfq_name: string | null
          status_presupuesto: number | null
          supplier_id: number | null
          supplier_name: string | null
        }
        Relationships: []
      }
      unique_rfq_products: {
        Row: {
          company_id: number | null
          product_name: string | null
          product_uom: string | null
          rfq_id: number | null
          rfq_name: string | null
          units: number | null
        }
        Relationships: []
      }
      unique_rfq_suppliers: {
        Row: {
          rfq_id: number | null
          supplier_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bytea_to_text: {
        Args: {
          data: string
        }
        Returns: string
      }
      http: {
        Args: {
          request: Database["public"]["CompositeTypes"]["http_request"]
        }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete:
        | {
            Args: {
              uri: string
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
      http_get:
        | {
            Args: {
              uri: string
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
      http_head: {
        Args: {
          uri: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: {
          field: string
          value: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post:
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
        | {
            Args: {
              uri: string
              data: Json
              content_type: string
            }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
          }
      http_put: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: {
          curlopt: string
          value: string
        }
        Returns: boolean
      }
      text_to_bytea: {
        Args: {
          data: string
        }
        Returns: string
      }
      urlencode:
        | {
            Args: {
              data: Json
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
