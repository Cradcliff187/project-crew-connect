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
      activitylog: {
        Row: {
          action: string | null
          created_at: string
          detailsjson: string | null
          logid: string | null
          moduletype: string | null
          previousstatus: string | null
          referenceid: string | null
          status: string | null
          timestamp: string | null
          updated_at: string
          useremail: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          detailsjson?: string | null
          logid?: string | null
          moduletype?: string | null
          previousstatus?: string | null
          referenceid?: string | null
          status?: string | null
          timestamp?: string | null
          updated_at?: string
          useremail?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          detailsjson?: string | null
          logid?: string | null
          moduletype?: string | null
          previousstatus?: string | null
          referenceid?: string | null
          status?: string | null
          timestamp?: string | null
          updated_at?: string
          useremail?: string | null
        }
        Relationships: []
      }
      change_order_items: {
        Row: {
          change_order_id: string
          created_at: string
          custom_type: string | null
          description: string
          document_id: string | null
          expense_type: string | null
          id: string
          impact_days: number | null
          item_type: string | null
          quantity: number
          subcontractor_id: string | null
          total_price: number
          trade_type: string | null
          unit_price: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          change_order_id: string
          created_at?: string
          custom_type?: string | null
          description: string
          document_id?: string | null
          expense_type?: string | null
          id?: string
          impact_days?: number | null
          item_type?: string | null
          quantity?: number
          subcontractor_id?: string | null
          total_price: number
          trade_type?: string | null
          unit_price: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          change_order_id?: string
          created_at?: string
          custom_type?: string | null
          description?: string
          document_id?: string | null
          expense_type?: string | null
          id?: string
          impact_days?: number | null
          item_type?: string | null
          quantity?: number
          subcontractor_id?: string | null
          total_price?: number
          trade_type?: string | null
          unit_price?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_order_items_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_order_items_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders_with_items"
            referencedColumns: ["id"]
          },
        ]
      }
      change_order_status_history: {
        Row: {
          change_order_id: string
          changed_by: string | null
          changed_date: string | null
          created_at: string
          id: string
          notes: string | null
          previous_status: string | null
          status: string
        }
        Insert: {
          change_order_id: string
          changed_by?: string | null
          changed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          status: string
        }
        Update: {
          change_order_id?: string
          changed_by?: string | null
          changed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_order_status_history_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_order_status_history_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders_with_items"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          approval_notes: string | null
          approved_by: string | null
          approved_date: string | null
          change_order_number: string | null
          created_at: string
          description: string | null
          document_id: string | null
          entity_id: string
          entity_type: string
          id: string
          impact_days: number | null
          new_completion_date: string | null
          original_completion_date: string | null
          requested_by: string | null
          requested_date: string | null
          status: string
          title: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          approval_notes?: string | null
          approved_by?: string | null
          approved_date?: string | null
          change_order_number?: string | null
          created_at?: string
          description?: string | null
          document_id?: string | null
          entity_id: string
          entity_type: string
          id?: string
          impact_days?: number | null
          new_completion_date?: string | null
          original_completion_date?: string | null
          requested_by?: string | null
          requested_date?: string | null
          status?: string
          title: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          approval_notes?: string | null
          approved_by?: string | null
          approved_date?: string | null
          change_order_number?: string | null
          created_at?: string
          description?: string | null
          document_id?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          impact_days?: number | null
          new_completion_date?: string | null
          original_completion_date?: string | null
          requested_by?: string | null
          requested_date?: string | null
          status?: string
          title?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_interactions: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          id: string
          interaction_date: string
          interaction_type: string
          notes: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          interaction_date?: string
          interaction_type: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          interaction_date?: string
          interaction_type?: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_performance_metrics: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          metric_date: string
          metric_type: string
          notes: string | null
          score: number
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          metric_date?: string
          metric_type: string
          notes?: string | null
          score: number
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          metric_date?: string
          metric_type?: string
          notes?: string | null
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_performance_metrics_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_relationships: {
        Row: {
          created_at: string
          from_contact_id: string
          id: string
          notes: string | null
          relationship_type: string
          to_contact_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_contact_id: string
          id?: string
          notes?: string | null
          relationship_type: string
          to_contact_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_contact_id?: string
          id?: string
          notes?: string | null
          relationship_type?: string
          to_contact_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_relationships_from_contact_id_fkey"
            columns: ["from_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_relationships_to_contact_id_fkey"
            columns: ["to_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_status_history: {
        Row: {
          changed_by: string | null
          changed_date: string | null
          contact_id: string
          created_at: string
          id: string
          notes: string | null
          previous_status: string | null
          status: string
          updated_at: string
        }
        Insert: {
          changed_by?: string | null
          changed_date?: string | null
          contact_id: string
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          changed_by?: string | null
          changed_date?: string | null
          contact_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          contact_type: string
          created_at: string
          email: string | null
          hourly_rate: number | null
          id: string
          last_contact: string | null
          materials: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          role: string | null
          specialty: string | null
          state: string | null
          status: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          contact_type: string
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          last_contact?: string | null
          materials?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          role?: string | null
          specialty?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          last_contact?: string | null
          materials?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          role?: string | null
          specialty?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          contactemail: string | null
          created_at: string
          createdby: string | null
          createdon: string | null
          customerid: string
          customername: string | null
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contactemail?: string | null
          created_at?: string
          createdby?: string | null
          createdon?: string | null
          customerid: string
          customername?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contactemail?: string | null
          created_at?: string
          createdby?: string | null
          createdon?: string | null
          customerid?: string
          customername?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      document_access_logs: {
        Row: {
          access_timestamp: string
          accessed_by: string | null
          action: string
          document_id: string
          id: string
        }
        Insert: {
          access_timestamp?: string
          accessed_by?: string | null
          action: string
          document_id: string
          id?: string
        }
        Update: {
          access_timestamp?: string
          accessed_by?: string | null
          action?: string
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
        ]
      }
      document_relationships: {
        Row: {
          created_at: string
          id: string
          relationship_metadata: Json | null
          relationship_type: string
          source_document_id: string
          target_document_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          relationship_metadata?: Json | null
          relationship_type: string
          source_document_id: string
          target_document_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          relationship_metadata?: Json | null
          relationship_type?: string
          source_document_id?: string
          target_document_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_relationships_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "document_relationships_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "document_relationships_target_document_id_fkey"
            columns: ["target_document_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "document_relationships_target_document_id_fkey"
            columns: ["target_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
        ]
      }
      documents: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string
          document_id: string
          entity_id: string
          entity_type: string
          expense_date: string | null
          expense_type: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          is_expense: boolean | null
          is_latest_version: boolean | null
          mime_type: string | null
          notes: string | null
          parent_document_id: string | null
          storage_path: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
          vendor_id: string | null
          vendor_type: string | null
          version: number | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string
          document_id?: string
          entity_id: string
          entity_type: string
          expense_date?: string | null
          expense_type?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          is_expense?: boolean | null
          is_latest_version?: boolean | null
          mime_type?: string | null
          notes?: string | null
          parent_document_id?: string | null
          storage_path: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          vendor_id?: string | null
          vendor_type?: string | null
          version?: number | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string
          document_id?: string
          entity_id?: string
          entity_type?: string
          expense_date?: string | null
          expense_type?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          is_expense?: boolean | null
          is_latest_version?: boolean | null
          mime_type?: string | null
          notes?: string | null
          parent_document_id?: string | null
          storage_path?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          vendor_id?: string | null
          vendor_type?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          email: string | null
          employee_id: string
          first_name: string
          hourly_rate: number | null
          last_name: string
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          employee_id?: string
          first_name: string
          hourly_rate?: number | null
          last_name: string
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          employee_id?: string
          first_name?: string
          hourly_rate?: number | null
          last_name?: string
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      estimate_documents: {
        Row: {
          created_at: string
          estimate_id: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          estimate_id: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          estimate_id?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_documents_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["estimateid"]
          },
        ]
      }
      estimate_email_settings: {
        Row: {
          body_template: string
          created_at: string
          id: string
          is_default: boolean | null
          subject_template: string
          template_name: string
          updated_at: string
        }
        Insert: {
          body_template: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          subject_template: string
          template_name: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          subject_template?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      estimate_items: {
        Row: {
          cost: number | null
          created_at: string
          description: string
          document_id: string | null
          estimate_id: string
          gross_margin: number | null
          gross_margin_percentage: number | null
          id: string
          item_category: string | null
          item_type: string | null
          markup_amount: number | null
          markup_percentage: number | null
          notes: string | null
          original_item_id: string | null
          quantity: number
          revision_id: string | null
          subcontractor_id: string | null
          total_price: number
          unit_price: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description: string
          document_id?: string | null
          estimate_id: string
          gross_margin?: number | null
          gross_margin_percentage?: number | null
          id?: string
          item_category?: string | null
          item_type?: string | null
          markup_amount?: number | null
          markup_percentage?: number | null
          notes?: string | null
          original_item_id?: string | null
          quantity?: number
          revision_id?: string | null
          subcontractor_id?: string | null
          total_price: number
          unit_price: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string
          document_id?: string | null
          estimate_id?: string
          gross_margin?: number | null
          gross_margin_percentage?: number | null
          id?: string
          item_category?: string | null
          item_type?: string | null
          markup_amount?: number | null
          markup_percentage?: number | null
          notes?: string | null
          original_item_id?: string | null
          quantity?: number
          revision_id?: string | null
          subcontractor_id?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "estimate_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["estimateid"]
          },
          {
            foreignKeyName: "estimate_items_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "estimate_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "subcontractors"
            referencedColumns: ["subid"]
          },
          {
            foreignKeyName: "estimate_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendorid"]
          },
        ]
      }
      estimate_revisions: {
        Row: {
          amount: number | null
          count: number | null
          created_at: string
          document_id: string | null
          estimate_id: string
          id: string
          is_current: boolean | null
          notes: string | null
          revision_by: string | null
          revision_date: string
          sent_date: string | null
          sent_to: string | null
          status: string | null
          updated_at: string
          version: number
        }
        Insert: {
          amount?: number | null
          count?: number | null
          created_at?: string
          document_id?: string | null
          estimate_id: string
          id?: string
          is_current?: boolean | null
          notes?: string | null
          revision_by?: string | null
          revision_date?: string
          sent_date?: string | null
          sent_to?: string | null
          status?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          amount?: number | null
          count?: number | null
          created_at?: string
          document_id?: string | null
          estimate_id?: string
          id?: string
          is_current?: boolean | null
          notes?: string | null
          revision_by?: string | null
          revision_date?: string
          sent_date?: string | null
          sent_to?: string | null
          status?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_revisions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "estimate_revisions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "fk_estimate_revisions_estimateid"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["estimateid"]
          },
        ]
      }
      estimates: {
        Row: {
          approveddate: string | null
          contingency_percentage: number | null
          contingencyamount: number | null
          created_at: string
          createdby: string | null
          customerid: string | null
          customername: string | null
          datecreated: string | null
          docid: string | null
          docurl: string | null
          estimateamount: number | null
          estimateid: string
          isactive: boolean | null
          "job description": string | null
          "po#": string | null
          projectid: string | null
          projectname: string | null
          sentdate: string | null
          sitelocationaddress: string | null
          sitelocationcity: string | null
          sitelocationstate: string | null
          sitelocationzip: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          approveddate?: string | null
          contingency_percentage?: number | null
          contingencyamount?: number | null
          created_at?: string
          createdby?: string | null
          customerid?: string | null
          customername?: string | null
          datecreated?: string | null
          docid?: string | null
          docurl?: string | null
          estimateamount?: number | null
          estimateid: string
          isactive?: boolean | null
          "job description"?: string | null
          "po#"?: string | null
          projectid?: string | null
          projectname?: string | null
          sentdate?: string | null
          sitelocationaddress?: string | null
          sitelocationcity?: string | null
          sitelocationstate?: string | null
          sitelocationzip?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          approveddate?: string | null
          contingency_percentage?: number | null
          contingencyamount?: number | null
          created_at?: string
          createdby?: string | null
          customerid?: string | null
          customername?: string | null
          datecreated?: string | null
          docid?: string | null
          docurl?: string | null
          estimateamount?: number | null
          estimateid?: string
          isactive?: boolean | null
          "job description"?: string | null
          "po#"?: string | null
          projectid?: string | null
          projectname?: string | null
          sentdate?: string | null
          sitelocationaddress?: string | null
          sitelocationcity?: string | null
          sitelocationstate?: string | null
          sitelocationzip?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_estimates_customerid"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customerid"]
          },
          {
            foreignKeyName: "fk_estimates_projectid"
            columns: ["projectid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["projectid"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          budget_item_id: string | null
          created_at: string
          created_by: string | null
          description: string
          document_id: string | null
          entity_id: string
          entity_type: string
          expense_date: string
          expense_type: string
          id: string
          is_billable: boolean | null
          is_receipt: boolean | null
          notes: string | null
          parent_expense_id: string | null
          quantity: number
          status: string | null
          time_entry_id: string | null
          unit_price: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount: number
          budget_item_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          document_id?: string | null
          entity_id: string
          entity_type: string
          expense_date?: string
          expense_type: string
          id?: string
          is_billable?: boolean | null
          is_receipt?: boolean | null
          notes?: string | null
          parent_expense_id?: string | null
          quantity?: number
          status?: string | null
          time_entry_id?: string | null
          unit_price: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          budget_item_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          document_id?: string | null
          entity_id?: string
          entity_type?: string
          expense_date?: string
          expense_type?: string
          id?: string
          is_billable?: boolean | null
          is_receipt?: boolean | null
          notes?: string | null
          parent_expense_id?: string | null
          quantity?: number
          status?: string | null
          time_entry_id?: string | null
          unit_price?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: []
      }
      maintenance_work_orders: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_date: string | null
          created_at: string
          customer_id: string | null
          description: string | null
          due_by_date: string | null
          location_id: string | null
          materials_cost: number | null
          po_number: string | null
          priority: string | null
          progress: number
          project_id: string | null
          scheduled_date: string | null
          status: string | null
          time_estimate: number | null
          title: string
          total_cost: number | null
          updated_at: string
          work_order_id: string
          work_order_number: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_by_date?: string | null
          location_id?: string | null
          materials_cost?: number | null
          po_number?: string | null
          priority?: string | null
          progress?: number
          project_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          time_estimate?: number | null
          title: string
          total_cost?: number | null
          updated_at?: string
          work_order_id?: string
          work_order_number?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_by_date?: string | null
          location_id?: string | null
          materials_cost?: number | null
          po_number?: string | null
          priority?: string | null
          progress?: number
          project_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          time_estimate?: number | null
          title?: string
          total_cost?: number | null
          updated_at?: string
          work_order_id?: string
          work_order_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "maintenance_work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customerid"]
          },
          {
            foreignKeyName: "maintenance_work_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "site_locations"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "maintenance_work_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["projectid"]
          },
        ]
      }
      project_budget_items: {
        Row: {
          actual_amount: number | null
          category: string
          created_at: string | null
          description: string | null
          estimated_amount: number
          id: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          actual_amount?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          estimated_amount?: number
          id?: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          actual_amount?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_amount?: number
          id?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_budget_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["projectid"]
          },
        ]
      }
      project_milestones: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          projectid: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          projectid: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          projectid?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_projectid_fkey"
            columns: ["projectid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["projectid"]
          },
        ]
      }
      project_progress: {
        Row: {
          created_at: string
          id: string
          progress_percentage: number
          projectid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          progress_percentage?: number
          projectid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          progress_percentage?: number
          projectid?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_progress_projectid_fkey"
            columns: ["projectid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["projectid"]
          },
        ]
      }
      project_status_history: {
        Row: {
          changed_by: string | null
          changed_date: string | null
          created_at: string
          id: string
          notes: string | null
          previous_status: string | null
          projectid: string
          status: string
          updated_at: string
        }
        Insert: {
          changed_by?: string | null
          changed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          projectid: string
          status: string
          updated_at?: string
        }
        Update: {
          changed_by?: string | null
          changed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          projectid?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_status: string | null
          created_at: string
          createdby: string | null
          createdon: string | null
          current_expenses: number | null
          customerid: string | null
          customername: string | null
          docurl: string | null
          due_date: string | null
          estimatesfolderid: string | null
          folderid: string | null
          jobdescription: string | null
          jobid: string | null
          lastmodified: string | null
          lastmodifiedby: string | null
          materialsfolderid: string | null
          projectid: string
          projectname: string | null
          sitelocationaddress: string | null
          sitelocationcity: string | null
          sitelocationstate: string | null
          sitelocationzip: string | null
          status: string | null
          subinvoicesfolderid: string | null
          total_budget: number | null
          updated_at: string
        }
        Insert: {
          budget_status?: string | null
          created_at?: string
          createdby?: string | null
          createdon?: string | null
          current_expenses?: number | null
          customerid?: string | null
          customername?: string | null
          docurl?: string | null
          due_date?: string | null
          estimatesfolderid?: string | null
          folderid?: string | null
          jobdescription?: string | null
          jobid?: string | null
          lastmodified?: string | null
          lastmodifiedby?: string | null
          materialsfolderid?: string | null
          projectid: string
          projectname?: string | null
          sitelocationaddress?: string | null
          sitelocationcity?: string | null
          sitelocationstate?: string | null
          sitelocationzip?: string | null
          status?: string | null
          subinvoicesfolderid?: string | null
          total_budget?: number | null
          updated_at?: string
        }
        Update: {
          budget_status?: string | null
          created_at?: string
          createdby?: string | null
          createdon?: string | null
          current_expenses?: number | null
          customerid?: string | null
          customername?: string | null
          docurl?: string | null
          due_date?: string | null
          estimatesfolderid?: string | null
          folderid?: string | null
          jobdescription?: string | null
          jobid?: string | null
          lastmodified?: string | null
          lastmodifiedby?: string | null
          materialsfolderid?: string | null
          projectid?: string
          projectname?: string | null
          sitelocationaddress?: string | null
          sitelocationcity?: string | null
          sitelocationstate?: string | null
          sitelocationzip?: string | null
          status?: string | null
          subinvoicesfolderid?: string | null
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_customerid"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customerid"]
          },
        ]
      }
      site_locations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          customer_id: string | null
          is_active: boolean | null
          location_id: string
          location_name: string | null
          state: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_id?: string | null
          is_active?: boolean | null
          location_id?: string
          location_name?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_id?: string | null
          is_active?: boolean | null
          location_id?: string
          location_name?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_locations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customerid"]
          },
        ]
      }
      status_definitions: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          id: number
          label: string
          status_code: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          id?: number
          label: string
          status_code: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          id?: number
          label?: string
          status_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_transitions: {
        Row: {
          created_at: string
          description: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          from_status: string
          id: number
          label: string
          to_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          from_status: string
          id?: number
          label: string
          to_status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          from_status?: string
          id?: number
          label?: string
          to_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcontractor_associations: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          document_id: string | null
          entity_id: string
          entity_type: string
          id: string
          subcontractor_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          entity_id: string
          entity_type: string
          id?: string
          subcontractor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          subcontractor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcontractor_associations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "subcontractor_associations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "subcontractor_associations_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "subcontractors"
            referencedColumns: ["subid"]
          },
        ]
      }
      subcontractor_specialties: {
        Row: {
          capacity_rating: number | null
          created_at: string
          description: string | null
          id: string
          parent_specialty_id: string | null
          service_area: string | null
          specialty: string
          updated_at: string
        }
        Insert: {
          capacity_rating?: number | null
          created_at?: string
          description?: string | null
          id?: string
          parent_specialty_id?: string | null
          service_area?: string | null
          specialty: string
          updated_at?: string
        }
        Update: {
          capacity_rating?: number | null
          created_at?: string
          description?: string | null
          id?: string
          parent_specialty_id?: string | null
          service_area?: string | null
          specialty?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcontractor_specialties_parent_specialty_id_fkey"
            columns: ["parent_specialty_id"]
            isOneToOne: false
            referencedRelation: "subcontractor_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractors: {
        Row: {
          address: string | null
          city: string | null
          contactemail: string | null
          contract_expiration: string | null
          contract_on_file: boolean | null
          created_at: string
          hourly_rate: number | null
          insurance_expiration: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_performance_review: string | null
          notes: string | null
          on_time_percentage: number | null
          payment_terms: string | null
          phone: string | null
          preferred: boolean | null
          qbvendortype: string | null
          quality_score: number | null
          rating: number | null
          response_time_hours: number | null
          safety_incidents: number | null
          specialty_ids: string[] | null
          state: string | null
          status: string | null
          subid: string
          subname: string | null
          tax_id: string | null
          total_completed_amount: number | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contactemail?: string | null
          contract_expiration?: string | null
          contract_on_file?: boolean | null
          created_at?: string
          hourly_rate?: number | null
          insurance_expiration?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_performance_review?: string | null
          notes?: string | null
          on_time_percentage?: number | null
          payment_terms?: string | null
          phone?: string | null
          preferred?: boolean | null
          qbvendortype?: string | null
          quality_score?: number | null
          rating?: number | null
          response_time_hours?: number | null
          safety_incidents?: number | null
          specialty_ids?: string[] | null
          state?: string | null
          status?: string | null
          subid: string
          subname?: string | null
          tax_id?: string | null
          total_completed_amount?: number | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contactemail?: string | null
          contract_expiration?: string | null
          contract_on_file?: boolean | null
          created_at?: string
          hourly_rate?: number | null
          insurance_expiration?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_performance_review?: string | null
          notes?: string | null
          on_time_percentage?: number | null
          payment_terms?: string | null
          phone?: string | null
          preferred?: boolean | null
          qbvendortype?: string | null
          quality_score?: number | null
          rating?: number | null
          response_time_hours?: number | null
          safety_incidents?: number | null
          specialty_ids?: string[] | null
          state?: string | null
          status?: string | null
          subid?: string
          subname?: string | null
          tax_id?: string | null
          total_completed_amount?: number | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          created_at: string
          date_worked: string
          employee_id: string | null
          employee_rate: number | null
          end_time: string
          entity_id: string
          entity_type: string
          has_receipts: boolean | null
          hours_worked: number
          id: string
          location_data: Json | null
          notes: string | null
          start_time: string
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_worked: string
          employee_id?: string | null
          employee_rate?: number | null
          end_time: string
          entity_id: string
          entity_type: string
          has_receipts?: boolean | null
          hours_worked: number
          id?: string
          location_data?: Json | null
          notes?: string | null
          start_time: string
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_worked?: string
          employee_id?: string | null
          employee_rate?: number | null
          end_time?: string
          entity_id?: string
          entity_type?: string
          has_receipts?: boolean | null
          hours_worked?: number
          id?: string
          location_data?: Json | null
          notes?: string | null
          start_time?: string
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      time_entry_document_links: {
        Row: {
          created_at: string
          document_id: string
          id: string
          time_entry_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          time_entry_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          time_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entry_document_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "time_entry_document_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "time_entry_document_links_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          createdby: string | null
          createdon: string | null
          email: string | null
          notes: string | null
          payment_terms: string | null
          phone: string | null
          qbvendortype: string | null
          state: string | null
          status: string | null
          tax_id: string | null
          updated_at: string
          vendorid: string
          vendorname: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          createdby?: string | null
          createdon?: string | null
          email?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          qbvendortype?: string | null
          state?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          vendorid: string
          vendorname?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          createdby?: string | null
          createdon?: string | null
          email?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          qbvendortype?: string | null
          state?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          vendorid?: string
          vendorname?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      work_order_project_links: {
        Row: {
          budget_item_id: string | null
          created_at: string
          id: string
          project_id: string
          updated_at: string
          work_order_id: string
        }
        Insert: {
          budget_item_id?: string | null
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
          work_order_id: string
        }
        Update: {
          budget_item_id?: string | null
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_project_links_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "project_budget_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["projectid"]
          },
          {
            foreignKeyName: "work_order_project_links_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "maintenance_work_orders"
            referencedColumns: ["work_order_id"]
          },
        ]
      }
      work_order_status_history: {
        Row: {
          changed_by: string | null
          changed_date: string | null
          created_at: string
          id: string
          notes: string | null
          previous_status: string | null
          status: string
          updated_at: string
          work_order_id: string
        }
        Insert: {
          changed_by?: string | null
          changed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          status: string
          updated_at?: string
          work_order_id: string
        }
        Update: {
          changed_by?: string | null
          changed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          previous_status?: string | null
          status?: string
          updated_at?: string
          work_order_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      change_orders_with_items: {
        Row: {
          approval_notes: string | null
          approved_by: string | null
          approved_date: string | null
          change_order_number: string | null
          created_at: string | null
          description: string | null
          document_id: string | null
          entity_id: string | null
          entity_type: string | null
          id: string | null
          impact_days: number | null
          items: Json | null
          new_completion_date: string | null
          original_completion_date: string | null
          requested_by: string | null
          requested_date: string | null
          status: string | null
          title: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          created_at: string | null
          document_id: string | null
          entity_id: string | null
          entity_type: string | null
          file_name: string | null
          is_latest_version: boolean | null
          parent_document_id: string | null
          storage_path: string | null
          version: number | null
          version_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
        ]
      }
      unified_work_order_expenses: {
        Row: {
          created_at: string | null
          expense_name: string | null
          expense_type: string | null
          id: string | null
          quantity: number | null
          receipt_document_id: string | null
          source_type: string | null
          time_entry_id: string | null
          total_price: number | null
          unit_price: number | null
          updated_at: string | null
          vendor_id: string | null
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          expense_name?: string | null
          expense_type?: string | null
          id?: string | null
          quantity?: number | null
          receipt_document_id?: string | null
          source_type?: never
          time_entry_id?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          work_order_id?: never
        }
        Update: {
          created_at?: string | null
          expense_name?: string | null
          expense_type?: string | null
          id?: string | null
          quantity?: number | null
          receipt_document_id?: string | null
          source_type?: never
          time_entry_id?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          work_order_id?: never
        }
        Relationships: []
      }
      vendor_associations: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          document_id: string | null
          entity_id: string | null
          entity_type: string | null
          expense_type: string | null
          id: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expense_type?: string | null
          id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expense_type?: string | null
          id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      attach_document_to_time_entry: {
        Args: {
          p_time_entry_id: string
          p_document_id: string
        }
        Returns: boolean
      }
      calculate_vendor_score: {
        Args: {
          p_rating: number
          p_on_time_percentage: number
          p_quality_score: number
          p_safety_incidents: number
          p_response_time_hours: number
        }
        Returns: number
      }
      convertestimateitemstobudgetitems: {
        Args: {
          estimateid: string
          projectid: string
        }
        Returns: Json
      }
      generate_change_order_number: {
        Args: {
          entity_type: string
          entity_id: string
        }
        Returns: string
      }
      generate_customer_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_estimate_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_project_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_subcontractor_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_vendor_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_possible_transitions: {
        Args: {
          entity_type_param: Database["public"]["Enums"]["entity_type"]
          current_status_param: string
        }
        Returns: {
          to_status: string
          label: string
          description: string
        }[]
      }
      get_status_label: {
        Args: {
          entity_type_param: Database["public"]["Enums"]["entity_type"]
          status_code_param: string
        }
        Returns: string
      }
      get_subcontractor_projects: {
        Args: {
          p_subcontractor_id: string
        }
        Returns: {
          project_id: string
          project_name: string
          status: string
          created_at: string
        }[]
      }
      get_subcontractor_work_orders: {
        Args: {
          p_subcontractor_id: string
        }
        Returns: {
          work_order_id: string
          title: string
          status: string
          created_at: string
        }[]
      }
      get_vendor_projects: {
        Args: {
          p_vendor_id: string
        }
        Returns: {
          project_id: string
          project_name: string
          status: string
          created_at: string
        }[]
      }
      get_vendor_work_orders: {
        Args: {
          p_vendor_id: string
        }
        Returns: {
          work_order_id: string
          title: string
          status: string
          materials_cost: number
          created_at: string
        }[]
      }
      get_work_order_project_link: {
        Args: {
          work_order_id: string
        }
        Returns: {
          project_id: string
          budget_item_id: string
        }[]
      }
      link_work_order_to_project: {
        Args: {
          p_work_order_id: string
          p_project_id: string
          p_budget_item_id: string
        }
        Returns: boolean
      }
      migrate_estimate_items_from_documents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_customers_status_transition: {
        Args: {
          current_status: string
          new_status: string
        }
        Returns: boolean
      }
      validate_estimates_status_transition: {
        Args: {
          current_status: string
          new_status: string
        }
        Returns: boolean
      }
      validate_projects_status_transition: {
        Args: {
          current_status: string
          new_status: string
        }
        Returns: boolean
      }
      validate_vendors_status_transition: {
        Args: {
          current_status: string
          new_status: string
        }
        Returns: boolean
      }
      validate_work_order_status_transition: {
        Args: {
          current_status: string
          new_status: string
        }
        Returns: boolean
      }
    }
    Enums: {
      entity_type:
        | "PROJECT"
        | "ESTIMATE"
        | "VENDOR"
        | "CUSTOMER"
        | "WORK_ORDER"
        | "CONTACT"
        | "TIME_ENTRY"
        | "EMPLOYEE"
    }
    CompositeTypes: {
      [_ in never]: never
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
