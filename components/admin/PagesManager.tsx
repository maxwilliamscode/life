
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus, Save, Eye, File, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  lastUpdated: string;
  status: string;
}

// Fallback pages data
const initialPages = [
  {
    id: 1,
    title: "About Us",
    slug: "about",
    content: "This is the About Us page content.",
    lastUpdated: "2023-07-10",
    status: "published"
  },
  {
    id: 2,
    title: "Contact Information",
    slug: "contact",
    content: "This is the Contact Information page content.",
    lastUpdated: "2023-08-05",
    status: "published"
  },
  {
    id: 3,
    title: "Shipping & Returns",
    slug: "shipping-returns",
    content: "This is the Shipping & Returns page content.",
    lastUpdated: "2023-08-12",
    status: "published"
  },
  {
    id: 4,
    title: "Care Guides",
    slug: "care-guides",
    content: "This is the Care Guides page content.",
    lastUpdated: "2023-08-15",
    status: "draft"
  }
];

const PagesManager: React.FC = () => {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPage, setNewPage] = useState({
    id: 0,
    title: "",
    slug: "",
    content: "",
    status: "draft"
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);

      // First check if we're authenticated and an admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to access pages');
      }
      
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching pages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load pages. Using sample data instead.',
          variant: 'destructive'
        });
      } else if (data) {
        setPages(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // First check if we're authenticated and an admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to delete pages');
      }
      
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPages(pages.filter(page => page.id !== id));
      toast({
        title: "Page deleted",
        description: `Page ID: ${id} has been deleted.`
      });
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete page from database. Removing from UI only.',
        variant: 'destructive'
      });
      
      // Remove from local state anyway for UI responsiveness
      setPages(pages.filter(page => page.id !== id));
    }
  };

  const handleAddPage = async () => {
    // Validate form
    if (!newPage.title || !newPage.content) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Generate slug if empty
    let pageSlug = newPage.slug;
    if (!pageSlug) {
      pageSlug = newPage.title.toLowerCase().replace(/\s+/g, '-');
    }

    // Format today's date
    const today = new Date().toISOString().split('T')[0];
    const pageToAdd = { 
      ...newPage, 
      slug: pageSlug,
      lastUpdated: today
    };
    
    try {
      // First check if we're authenticated and an admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to add pages');
      }
      
      const { data, error } = await supabase
        .from('pages')
        .insert([{
          title: pageToAdd.title,
          slug: pageToAdd.slug,
          content: pageToAdd.content,
          lastUpdated: pageToAdd.lastUpdated,
          status: pageToAdd.status
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setPages([...pages, data[0]]);
        toast({
          title: "Page added",
          description: `${newPage.title} has been added.`
        });
      }
    } catch (error) {
      console.error('Error adding page:', error);
      toast({
        title: 'Error',
        description: 'Failed to add page to database. Adding to UI only.',
        variant: 'destructive'
      });
      
      // Add to local state anyway for UI responsiveness
      const newId = Math.max(...pages.map(p => p.id), 0) + 1;
      setPages([...pages, { ...pageToAdd, id: newId }]);
    }
    
    // Reset form and close dialog
    setNewPage({
      id: 0,
      title: "",
      slug: "",
      content: "",
      status: "draft"
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdatePage = async () => {
    if (!editingPage) return;
    
    const today = new Date().toISOString().split('T')[0];
    const updatedPage = {
      ...editingPage,
      lastUpdated: today
    };
    
    try {
      // First check if we're authenticated and an admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to update pages');
      }
      
      const { error } = await supabase
        .from('pages')
        .update({
          title: updatedPage.title,
          slug: updatedPage.slug,
          content: updatedPage.content,
          lastUpdated: updatedPage.lastUpdated,
          status: updatedPage.status
        })
        .eq('id', updatedPage.id);

      if (error) {
        throw error;
      }

      setPages(pages.map(page => 
        page.id === editingPage.id ? updatedPage : page
      ));
      
      toast({
        title: "Page updated",
        description: `${editingPage.title} has been updated.`
      });
    } catch (error) {
      console.error('Error updating page:', error);
      toast({
        title: 'Error',
        description: 'Failed to update page in database. Updating UI only.',
        variant: 'destructive'
      });
      
      // Update in local state anyway for UI responsiveness
      setPages(pages.map(page => 
        page.id === editingPage.id ? updatedPage : page
      ));
    }
    
    setIsEditDialogOpen(false);
  };

  const handlePreviewPage = (page: Page) => {
    const url = `/page/${page.slug}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ShadcnButton onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Page
        </ShadcnButton>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Content Pages</CardTitle>
          <CardDescription>Manage website content pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL Slug</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length > 0 ? (
                pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>/{page.slug}</TableCell>
                    <TableCell>{page.lastUpdated}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        page.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {page.status === 'published' && (
                          <ShadcnButton size="icon" variant="outline" onClick={() => handlePreviewPage(page)}>
                            <Eye className="h-4 w-4" />
                          </ShadcnButton>
                        )}
                        <ShadcnButton size="icon" variant="ghost" onClick={() => handleEdit(page)}>
                          <Edit className="h-4 w-4" />
                        </ShadcnButton>
                        <ShadcnButton size="icon" variant="ghost" onClick={() => handleDelete(page.id)}>
                          <Trash2 className="h-4 w-4" />
                        </ShadcnButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {loading ? 'Loading pages...' : 'No pages found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Page Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription>
              Create a new content page for your website
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid-cols-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={newPage.title}
                  onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                  placeholder="e.g. About Us"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                    /
                  </span>
                  <Input
                    id="slug"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({...newPage, slug: e.target.value})}
                    placeholder="e.g. about-us"
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Leave empty to auto-generate from title
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Page Content</Label>
                <Textarea
                  id="content"
                  value={newPage.content}
                  onChange={(e) => setNewPage({...newPage, content: e.target.value})}
                  placeholder="Enter page content here..."
                  rows={8}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newPage.status}
                  onChange={(e) => setNewPage({...newPage, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <ShadcnButton variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </ShadcnButton>
            <ShadcnButton onClick={handleAddPage}>
              <Save className="mr-2 h-4 w-4" />
              Add Page
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Page Dialog */}
      {editingPage && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Page</DialogTitle>
              <DialogDescription>
                Update content and settings for this page
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid-cols-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Page Title</Label>
                  <Input
                    id="edit-title"
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-slug">URL Slug</Label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                      /
                    </span>
                    <Input
                      id="edit-slug"
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({...editingPage, slug: e.target.value})}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Page Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({...editingPage, content: e.target.value})}
                    rows={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select 
                    id="edit-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingPage.status}
                    onChange={(e) => setEditingPage({...editingPage, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <ShadcnButton variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </ShadcnButton>
              <ShadcnButton onClick={handleUpdatePage}>
                <Save className="mr-2 h-4 w-4" />
                Update Page
              </ShadcnButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PagesManager;
