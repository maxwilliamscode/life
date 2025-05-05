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
      accessories: {
        Row: {
          brand: string | null
          compatibility: string | null
          dimensions: string | null
          id: string
          material: string | null
          type: string
        }
        Insert: {
          brand?: string | null
          compatibility?: string | null
          dimensions?: string | null
          id: string
          material?: string | null
          type: string
        }
        Update: {
          brand?: string | null
          compatibility?: string | null
          dimensions?: string | null
          id?: string
          material?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "accessories_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      fish: {
        Row: {
          care_level: string | null
          id: string
          lifespan: string | null
          origin: string | null
          size: string | null
          species: string
          tank_size: string | null
          water_parameters: string | null
        }
        Insert: {
          care_level?: string | null
          id: string
          lifespan?: string | null
          origin?: string | null
          size?: string | null
          species: string
          tank_size?: string | null
          water_parameters?: string | null
        }
        Update: {
          care_level?: string | null
          id?: string
          lifespan?: string | null
          origin?: string | null
          size?: string | null
          species?: string
          tank_size?: string | null
          water_parameters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fish_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      food: {
        Row: {
          brand: string | null
          feeding_instructions: string | null
          id: string
          ingredients: string | null
          suitable_for: string | null
          type: string
          weight: string | null
        }
        Insert: {
          brand?: string | null
          feeding_instructions?: string | null
          id: string
          ingredients?: string | null
          suitable_for?: string | null
          type: string
          weight?: string | null
        }
        Update: {
          brand?: string | null
          feeding_instructions?: string | null
          id?: string
          ingredients?: string | null
          suitable_for?: string | null
          type?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          action: string | null
          actiontext: string | null
          active: boolean | null
          backgroundimage: string | null
          bgcolor: string | null
          description: string | null
          icon: string | null
          id: number
          period: string | null
          title: string
        }
        Insert: {
          action?: string | null
          actiontext?: string | null
          active?: boolean | null
          backgroundimage?: string | null
          bgcolor?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          period?: string | null
          title: string
        }
        Update: {
          action?: string | null
          actiontext?: string | null
          active?: boolean | null
          backgroundimage?: string | null
          bgcolor?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          period?: string | null
          title?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price_per_unit: number
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
        }
        Insert: {
          id?: string
          order_id: string
          price_per_unit: number
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
        }
        Update: {
          id?: string
          order_id?: string
          price_per_unit?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          payment_method: string
          payment_status: string
          shipping_address: string
          shipping_city: string
          shipping_country: string
          shipping_state: string
          shipping_zip_code: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          payment_method: string
          payment_status?: string
          shipping_address: string
          shipping_city: string
          shipping_country: string
          shipping_state: string
          shipping_zip_code: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          payment_method?: string
          payment_status?: string
          shipping_address?: string
          shipping_city?: string
          shipping_country?: string
          shipping_state?: string
          shipping_zip_code?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string | null
          id: string
          product_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          product_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          product_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          company: string | null
          content: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          name: string
          rating: number
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          rating: number
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          rating?: number
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
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
