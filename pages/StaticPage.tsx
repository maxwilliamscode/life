
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  lastUpdated: string;
}

const StaticPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) {
          console.error('Error fetching page:', error);
          setError('The page you requested could not be found.');
        } else if (data) {
          setPage(data);
        } else {
          setError('The page you requested could not be found.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 container mx-auto mt-28 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse bg-gray-200 w-32 h-8 mx-auto mb-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 w-64 h-4 mx-auto mb-2 rounded"></div>
            <div className="animate-pulse bg-gray-200 w-48 h-4 mx-auto rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 container mx-auto mt-28 p-6 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="mb-6 text-gray-600">{error || 'The page you requested could not be found.'}</p>
            <button 
              className="px-4 py-2 bg-aqua-600 text-white rounded-md hover:bg-aqua-700 transition-colors"
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="pt-28 bg-gradient-to-b from-aqua-800 to-aqua-900 py-16 px-4 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.title}</h1>
        </div>
      </div>
      
      <div className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br>') }}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StaticPage;
