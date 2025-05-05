
import { supabase } from "@/integrations/supabase/client";

export const setupSupabaseTables = async () => {
  try {
    console.log("Setting up Supabase tables...");

    // Check if tables exist first
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error("Error checking tables:", tablesError);
      return;
    }

    const existingTables = (tablesData || []).map(t => t.table_name);
    console.log("Existing tables:", existingTables);

    // Create profiles table if it doesn't exist
    if (!existingTables.includes('profiles')) {
      console.log("Creating profiles table...");
      const { error: profilesError } = await supabase.rpc('create_profiles_table');
      
      if (profilesError) {
        console.error("Error creating profiles table:", profilesError);
        // Try creating it directly with SQL
        const { error } = await supabase.from('_sql').select(`
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            first_name TEXT,
            last_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `).single();
        
        if (error) {
          console.error("Error creating profiles table with SQL:", error);
        }
      }
    }

    // Create pages table if it doesn't exist
    if (!existingTables.includes('pages')) {
      console.log("Creating pages table...");
      const { error } = await supabase.from('_sql').select(`
        CREATE TABLE IF NOT EXISTS public.pages (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          content TEXT,
          status TEXT DEFAULT 'draft',
          lastUpdated DATE DEFAULT CURRENT_DATE
        );
      `).single();

      if (error) {
        console.error("Error creating pages table:", error);
      } else {
        // Insert default pages
        console.log("Inserting default pages...");
        await supabase.from('pages').insert([
          {
            title: "About Us",
            slug: "about",
            content: "This is the About Us page content. Our company is dedicated to providing the highest quality exotic fish species.",
            status: "published",
            lastUpdated: new Date().toISOString().split('T')[0]
          },
          {
            title: "Contact Information",
            slug: "contact",
            content: "Contact us at info@lifestyleaqua.com or call us at (555) 123-4567.",
            status: "published",
            lastUpdated: new Date().toISOString().split('T')[0]
          },
          {
            title: "Shipping & Returns",
            slug: "shipping-returns",
            content: "We offer worldwide shipping for all our products. Returns accepted within 30 days of purchase.",
            status: "published",
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        ]);
      }
    }

    // Create website_config table if it doesn't exist
    if (!existingTables.includes('website_config')) {
      console.log("Creating website_config table...");
      const { error } = await supabase.from('_sql').select(`
        CREATE TABLE IF NOT EXISTS public.website_config (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          value TEXT NOT NULL,
          description TEXT,
          section TEXT NOT NULL,
          type TEXT NOT NULL,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `).single();

      if (error) {
        console.error("Error creating website_config table:", error);
      }
    }

    // Create offers table if it doesn't exist
    if (!existingTables.includes('offers')) {
      console.log("Creating offers table...");
      const { error } = await supabase.from('_sql').select(`
        CREATE TABLE IF NOT EXISTS public.offers (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          bgColor TEXT,
          icon TEXT,
          action TEXT,
          actionText TEXT,
          period TEXT,
          backgroundImage TEXT,
          active BOOLEAN DEFAULT true
        );
      `).single();

      if (error) {
        console.error("Error creating offers table:", error);
      } else {
        // Insert default offers
        console.log("Inserting default offers...");
        await supabase.from('offers').insert([
          {
            title: "Summer Sale",
            description: "Get up to 25% off on select premium Arowana species",
            bgColor: "from-aqua-500/80 to-aqua-700/80",
            icon: "Tag",
            action: "/products",
            actionText: "Shop Now",
            period: "Until August 15",
            backgroundImage: "https://images.unsplash.com/photo-1520656038254-76ae307726a0?q=80&w=1200",
            active: true
          },
          {
            title: "New Arrivals",
            description: "Just landed: Exotic Malaysian Blue Base Golden Arowana",
            bgColor: "from-marine-500/80 to-marine-700/80",
            icon: "Gift",
            action: "/products",
            actionText: "View Collection",
            period: "Limited Stock",
            backgroundImage: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1?q=80&w=1200",
            active: true
          },
          {
            title: "Coming Soon",
            description: "Premium aquarium equipment - Pre-order available",
            bgColor: "from-amber-500/80 to-amber-700/80",
            icon: "Calendar",
            action: "/products",
            actionText: "Pre-order",
            period: "Arriving September 1",
            backgroundImage: "https://images.unsplash.com/photo-1571438188835-b7f91387e7d3?q=80&w=1200",
            active: true
          }
        ]);
      }
    }

    // Create testimonials table if it doesn't exist
    if (!existingTables.includes('testimonials')) {
      console.log("Creating testimonials table...");
      const { error } = await supabase.from('_sql').select(`
        CREATE TABLE IF NOT EXISTS public.testimonials (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          role TEXT,
          company TEXT,
          content TEXT NOT NULL,
          rating INTEGER NOT NULL,
          avatar_url TEXT,
          is_featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `).single();

      if (error) {
        console.error("Error creating testimonials table:", error);
      }
    }

    // Ensure RLS policies exist
    const setupRLS = async () => {
      console.log("Setting up RLS policies...");
      
      // For pages table
      await supabase.from('_sql').select(`
        BEGIN;
        
        -- Enable RLS on pages table if not already enabled
        ALTER TABLE IF EXISTS public.pages ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for public read access to published pages if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pages' AND policyname = 'Allow public read access to published pages'
          ) THEN
            CREATE POLICY "Allow public read access to published pages" 
              ON public.pages 
              FOR SELECT 
              USING (status = 'published');
          END IF;
        END
        $$;
        
        -- Create policy for admin write access if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pages' AND policyname = 'Allow admin write access to pages'
          ) THEN
            CREATE POLICY "Allow admin write access to pages" 
              ON public.pages 
              FOR ALL 
              USING (public.is_admin(auth.uid()));
          END IF;
        END
        $$;
        
        -- Enable RLS on testimonials table if not already enabled
        ALTER TABLE IF EXISTS public.testimonials ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for testimonials if they don't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'testimonials' AND policyname = 'Allow public read access to testimonials'
          ) THEN
            CREATE POLICY "Allow public read access to testimonials" 
              ON public.testimonials 
              FOR SELECT 
              USING (true);
          END IF;
        END
        $$;
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'testimonials' AND policyname = 'Allow admin write access to testimonials'
          ) THEN
            CREATE POLICY "Allow admin write access to testimonials" 
              ON public.testimonials 
              FOR ALL 
              USING (public.is_admin(auth.uid()));
          END IF;
        END
        $$;
        
        -- Enable RLS on offers table if not already enabled
        ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for offers if they don't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'offers' AND policyname = 'Allow public read access to offers'
          ) THEN
            CREATE POLICY "Allow public read access to offers" 
              ON public.offers 
              FOR SELECT 
              USING (true);
          END IF;
        END
        $$;
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'offers' AND policyname = 'Allow admin write access to offers'
          ) THEN
            CREATE POLICY "Allow admin write access to offers" 
              ON public.offers 
              FOR ALL 
              USING (public.is_admin(auth.uid()));
          END IF;
        END
        $$;
        
        -- Enable RLS on website_config table if not already enabled
        ALTER TABLE IF EXISTS public.website_config ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for website_config if they don't exist
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'website_config' AND policyname = 'Allow public read access to website_config'
          ) THEN
            CREATE POLICY "Allow public read access to website_config" 
              ON public.website_config 
              FOR SELECT 
              USING (true);
          END IF;
        END
        $$;
        
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'website_config' AND policyname = 'Allow admin write access to website_config'
          ) THEN
            CREATE POLICY "Allow admin write access to website_config" 
              ON public.website_config 
              FOR ALL 
              USING (public.is_admin(auth.uid()));
          END IF;
        END
        $$;
        
        -- Create is_admin function if it doesn't exist
        CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
         RETURNS boolean
         LANGUAGE plpgsql
         SECURITY DEFINER
        AS $function$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = user_id 
            AND (email = 'admin@example.com' OR email = 'jbakshatbagdi@gmail.com')
          );
        END;
        $function$;
        
        COMMIT;
      `).single();
    };
    
    await setupRLS();

    console.log("Supabase setup complete!");
  } catch (error) {
    console.error("Error setting up Supabase:", error);
  }
};
