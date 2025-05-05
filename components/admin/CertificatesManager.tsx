import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, Edit, Trash2, Plus, Save, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Certificate {
  id: string;
  certificate_id: string;
  type: string;
  issue_date: string;
  breeder: string;
  location: string;
  created_at?: string;
  updated_at?: string;
}

const CertificatesManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    certificate_id: '',
    type: '',
    issue_date: '',
    breeder: '',
    location: '',
  });

  // Fetch certificates
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Certificate[];
    }
  });

  // Add certificate mutation
  const addCertificateMutation = useMutation({
    mutationFn: async (certificate: Omit<Certificate, 'id'>) => {
      console.log('Adding certificate:', certificate);
      const { data, error } = await supabase
        .from('certificates')
        .insert([{
          ...certificate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding certificate:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Certificate added successfully"
      });
    },
    onError: (error: any) => {
      console.error('Certificate addition error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add certificate",
        variant: "destructive"
      });
    }
  });

  const handleAddCertificate = () => {
    if (!newCertificate.certificate_id || !newCertificate.type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    addCertificateMutation.mutate(newCertificate);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-aqua-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex justify-between items-center p-3">
        <h2 className="text-2xl font-bold text-white">Arowana Certificates</h2>
        <ShadcnButton onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Certificate
        </ShadcnButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates?.map((cert) => (
          <Card key={cert.id} className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">{cert.certificate_id}</CardTitle>
              <CardDescription className="text-white/80">
                {cert.type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-white/90">
                <p><span className="font-medium">Type:</span> {cert.type}</p>
                <p><span className="font-medium">Breeder:</span> {cert.breeder}</p>
                <p><span className="font-medium">Issue Date:</span> {new Date(cert.issue_date).toLocaleDateString()}</p>
                <p><span className="font-medium">Location:</span> {cert.location}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Certificate Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Certificate</DialogTitle>
            <DialogDescription>
              Create a new Arowana certificate
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certificate_id">Certificate ID*</Label>
                <Input
                  id="certificate_id"
                  value={newCertificate.certificate_id}
                  onChange={(e) => setNewCertificate({
                    ...newCertificate,
                    certificate_id: e.target.value
                  })}
                  placeholder="ARW12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Arowana Type*</Label>
                <Input
                  id="type"
                  value={newCertificate.type}
                  onChange={(e) => setNewCertificate({
                    ...newCertificate,
                    type: e.target.value
                  })}
                  placeholder="e.g. Golden Head Blue Base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date*</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={newCertificate.issue_date}
                  onChange={(e) => setNewCertificate({
                    ...newCertificate,
                    issue_date: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="breeder">Breeder*</Label>
                <Input
                  id="breeder"
                  value={newCertificate.breeder}
                  onChange={(e) => setNewCertificate({
                    ...newCertificate,
                    breeder: e.target.value
                  })}
                  placeholder="Breeder name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location*</Label>
              <Input
                id="location"
                value={newCertificate.location}
                onChange={(e) => setNewCertificate({
                  ...newCertificate,
                  location: e.target.value
                })}
                placeholder="e.g. Malaysia"
              />
            </div>
          </div>

          <DialogFooter>
            <ShadcnButton variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </ShadcnButton>
            <ShadcnButton 
              onClick={handleAddCertificate}
              disabled={addCertificateMutation.isPending}
            >
              {addCertificateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Add Certificate
                </>
              )}
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificatesManager;
