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
      documents: {
        Row: {
          created_at: string
          document_id: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number | null
          file_type: string | null
          storage_path: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_id?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          storage_path: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          storage_path?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
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
      estimate_items: {
        Row: {
          created_at: string
          description: string
          estimate_id: string
          id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          estimate_id: string
          id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          estimate_id?: string
          id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_estimate_items_estimateid"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["estimateid"]
          },
        ]
      }
      estimate_revisions: {
        Row: {
          amount: number | null
          created_at: string
          estimate_id: string
          id: string
          notes: string | null
          revision_by: string | null
          revision_date: string
          updated_at: string
          version: number
        }
        Insert: {
          amount?: number | null
          created_at?: string
          estimate_id: string
          id?: string
          notes?: string | null
          revision_by?: string | null
          revision_date?: string
          updated_at?: string
          version?: number
        }
        Update: {
          amount?: number | null
          created_at?: string
          estimate_id?: string
          id?: string
          notes?: string | null
          revision_by?: string | null
          revision_date?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
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
      maintenance_work_orders: {
        Row: {
          assigned_to: string | null
          completed_date: string | null
          created_at: string
          customer_id: string | null
          description: string | null
          location_id: string | null
          priority: string | null
          scheduled_date: string | null
          status: string | null
          title: string
          updated_at: string
          work_order_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          location_id?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
          work_order_id?: string
        }
        Update: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          location_id?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          work_order_id?: string
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
        ]
      }
      materialsreceipts: {
        Row: {
          amount: number | null
          created_at: string
          createdon: string | null
          foruseremail: string | null
          projectid: string | null
          receiptdocurl: string | null
          receiptid: string | null
          submittinguser: string | null
          updated_at: string
          vendorid: string | null
          vendorname: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          createdon?: string | null
          foruseremail?: string | null
          projectid?: string | null
          receiptdocurl?: string | null
          receiptid?: string | null
          submittinguser?: string | null
          updated_at?: string
          vendorid?: string | null
          vendorname?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          createdon?: string | null
          foruseremail?: string | null
          projectid?: string | null
          receiptdocurl?: string | null
          receiptid?: string | null
          submittinguser?: string | null
          updated_at?: string
          vendorid?: string | null
          vendorname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_materialsreceipts_projectid"
            columns: ["projectid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["projectid"]
          },
          {
            foreignKeyName: "fk_materialsreceipts_vendorid"
            columns: ["vendorid"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendorid"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          createdby: string | null
          createdon: string | null
          customerid: string | null
          customername: string | null
          docurl: string | null
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          createdby?: string | null
          createdon?: string | null
          customerid?: string | null
          customername?: string | null
          docurl?: string | null
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
          updated_at?: string
        }
        Update: {
          created_at?: string
          createdby?: string | null
          createdon?: string | null
          customerid?: string | null
          customername?: string | null
          docurl?: string | null
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
          created_at: string
          description: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          id: number
          label: string
          status_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          id?: number
          label: string
          status_code: string
          updated_at?: string
        }
        Update: {
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
      subcontractors: {
        Row: {
          address: string | null
          city: string | null
          contactemail: string | null
          created_at: string
          phone: string | null
          qbvendortype: string | null
          state: string | null
          subid: string | null
          subname: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contactemail?: string | null
          created_at?: string
          phone?: string | null
          qbvendortype?: string | null
          state?: string | null
          subid?: string | null
          subname?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contactemail?: string | null
          created_at?: string
          phone?: string | null
          qbvendortype?: string | null
          state?: string | null
          subid?: string | null
          subname?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      subinvoices: {
        Row: {
          created_at: string
          createdon: string | null
          invoiceamount: number | null
          invoicedocurl: string | null
          projectid: string | null
          projectname: string | null
          subid: string | null
          subinvoiceid: string
          submittinguser: string | null
          subname: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          createdon?: string | null
          invoiceamount?: number | null
          invoicedocurl?: string | null
          projectid?: string | null
          projectname?: string | null
          subid?: string | null
          subinvoiceid: string
          submittinguser?: string | null
          subname?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          createdon?: string | null
          invoiceamount?: number | null
          invoicedocurl?: string | null
          projectid?: string | null
          projectname?: string | null
          subid?: string | null
          subinvoiceid?: string
          submittinguser?: string | null
          subname?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_subinvoices_projectid"
            columns: ["projectid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["projectid"]
          },
        ]
      }
      timelogs: {
        Row: {
          created_at: string
          createdon: string | null
          dateworked: string | null
          "employee hourly rate": string | null
          endtime: string | null
          foruseremail: string | null
          "job id": string | null
          projectid: string | null
          starttime: string | null
          submittinguser: string | null
          timelogid: string
          total_amount: number | null
          totalhours: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          createdon?: string | null
          dateworked?: string | null
          "employee hourly rate"?: string | null
          endtime?: string | null
          foruseremail?: string | null
          "job id"?: string | null
          projectid?: string | null
          starttime?: string | null
          submittinguser?: string | null
          timelogid: string
          total_amount?: number | null
          totalhours?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          createdon?: string | null
          dateworked?: string | null
          "employee hourly rate"?: string | null
          endtime?: string | null
          foruseremail?: string | null
          "job id"?: string | null
          projectid?: string | null
          starttime?: string | null
          submittinguser?: string | null
          timelogid?: string
          total_amount?: number | null
          totalhours?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_timelogs_projectid"
            columns: ["projectid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["projectid"]
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
          phone: string | null
          qbvendortype: string | null
          state: string | null
          status: string | null
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
          phone?: string | null
          qbvendortype?: string | null
          state?: string | null
          status?: string | null
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
          phone?: string | null
          qbvendortype?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          vendorid?: string
          vendorname?: string | null
          zip?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
