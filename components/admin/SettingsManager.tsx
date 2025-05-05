import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Loader2, Upload, X, Grid3X3, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

interface PageSettings {
  id: string;
  page: string;
  section: string;
  banner_image?: string;
  background_video?: string;
  updated_at?: string;
  about_image1?: string;
  about_image2?: string;
  about_image3?: string;
  about_image4?: string;
}

interface TabConfig {
  [key: string]: {
    sections: {
      id: string;
      label: string;
      showVideo?: boolean;
      videoOnly?: boolean;
      images?: { id: string; label: string; allowVideo?: boolean }[];
    }[];
  };
}

interface MediaFile {
  name: string;
  url: string;
  created_at: string;
  type: 'image' | 'video';
}

const tabConfig: TabConfig = {
  home: {
    sections: [
      { 
        id: 'hero', 
        label: 'Hero Section',
        showVideo: true,
        videoOnly: true
      },
      { 
        id: 'about', 
        label: 'About Section',
        images: [
          { id: 'about_image1', label: 'Premium Arowana', allowVideo: true },
          { id: 'about_image2', label: 'Professional Setup', allowVideo: true },
          { id: 'about_image3', label: 'Exotic Species', allowVideo: true },
          { id: 'about_image4', label: 'Aquatic Beauty', allowVideo: true }
        ]
      }
    ]
  }
};

const StrictModeDroppable = ({ children, ...props }: any) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
};

const SettingsManager = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['page-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_settings')
        .select('*');
      if (error) throw error;
      return data as PageSettings[];
    }
  });

  const { data: mediaFiles } = useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const imageList = await supabase.storage
        .from('backgrounds')
        .list();
      
      if (imageList.error) throw imageList.error;

      const files: MediaFile[] = await Promise.all(
        imageList.data.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('backgrounds')
            .getPublicUrl(file.name);
          
          return {
            name: file.name,
            url: publicUrl,
            created_at: file.created_at,
            type: file.metadata?.mimetype?.startsWith('image/') ? 'image' : 'video'
          };
        })
      );

      return files;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updateData: { id: string, updates: Partial<PageSettings> }) => {
      const { data, error } = await supabase
        .from('page_settings')
        .update(updateData.updates)
        .eq('id', updateData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-settings'] });
      toast({ title: "Settings updated successfully" });
    }
  });

  const uploadFile = async (file: File, bucket: string) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    settingId: string,
    type: 'banner_image' | 'background_video' | string
  ) => {
    try {
      const bucket = type === 'banner_image' ? 'backgrounds' : 'backgrounds';
      const url = await uploadFile(file, bucket);
      
      await updateSettingsMutation.mutateAsync({
        id: settingId,
        updates: { [type]: url }
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    }
  };

  const handleMediaSelect = (url: string, type: 'banner_image' | 'background_video', settingId: string, page: string, section: string) => {
    const currentSettings = settings?.find(s => s.page === page && s.section === section);
    if (!currentSettings) {
      // If settings don't exist, create new settings
      const newSettings = {
        page,
        section,
        [type]: url
      };
      
      supabase.from('page_settings')
        .insert(newSettings)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['page-settings'] });
          toast({ title: "Settings created successfully" });
        });
    } else {
      // Update existing settings
      updateSettingsMutation.mutate({
        id: currentSettings.id,
        updates: { [type]: url }
      });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !result.draggableId) return;
    const { destination, draggableId } = result;
    const imageId = destination.droppableId;
    const settingId = settings?.find(s => s.page === 'home' && s.section === 'about')?.id!;

    updateSettingsMutation.mutate({
      id: settingId,
      updates: { [imageId]: draggableId }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-1 p-1 bg-gray-100 rounded-xl">
          <TabsTrigger className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm" value="home">
            Home Page Settings
          </TabsTrigger>
        </TabsList>

        {Object.entries(tabConfig).map(([page, config]) => (
          <TabsContent key={page} value={page}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{page} Page Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={config.sections[0].id} className="w-full">
                  <TabsList className="flex mb-6 p-1 bg-gray-100 rounded-xl w-fit">
                    {config.sections.map((section) => (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        {section.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {config.sections.map((section) => (
                    <TabsContent key={section.id} value={section.id}>
                      {section.id === 'hero' ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          <div className="md:col-span-4">
                            <div className="rounded-xl border-2 border-dashed border-gray-200 p-4">
                              <UploadButton
                                accept="video/*"
                                onUpload={(file) => {
                                  handleFileUpload(
                                    file,
                                    settings?.find(s => s.page === page && s.section === section.id)?.id!,
                                    'background_video'
                                  );
                                }}
                                label="Upload Hero Video"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-8">
                            <div className="space-y-4">
                              {/* Current Video */}
                              {settings?.find(s => s.page === page && s.section === section.id)?.background_video && (
                                <div className="relative group rounded-xl overflow-hidden border-2 border-purple-500 shadow-lg h-[180px] w-[500px]">
                                  <video
                                    src={settings.find(s => s.page === page && s.section === section.id)?.background_video}
                                    className="w-full h-full object-cover"
                                    controls
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                    <ShadcnButton
                                      variant="destructive"
                                      size="icon"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => updateSettingsMutation.mutate({
                                        id: settings.find(s => s.page === page && s.section === section.id)?.id!,
                                        updates: { background_video: null }
                                      })}
                                    >
                                      <X className="h-4 w-4" />
                                    </ShadcnButton>
                                  </div>
                                </div>
                              )}

                              {/* Video Gallery */}
                              <div className="mt-6">
                                <div className="flex items-center gap-2 mb-3">
                                  <Grid3X3 className="h-4 w-4" />
                                  <h3 className="text-sm font-medium">Available Videos</h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                  {mediaFiles?.filter(file => file.type === 'video').map((file) => (
                                    <div key={file.name} className="relative group">
                                      <div className="rounded-lg overflow-hidden border border-gray-200 h-[100px]">
                                        <video
                                          src={file.url}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                          <ShadcnButton
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleMediaSelect(
                                              file.url,
                                              'background_video',
                                              settings?.find(s => s.page === page && s.section === activeSection)?.id!,
                                              page,
                                              activeSection
                                            )}
                                            className="text-xs"
                                          >
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Select
                                          </ShadcnButton>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : section.id === 'about' ? (
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <div className="grid grid-cols-1 gap-6 md:col-span-12">
                            <div className="grid grid-cols-2 gap-4">
                              {section.images?.map((image) => (
                                <div key={image.id} className="space-y-2">
                                  <Label className="block">{image.label}</Label>
                                  <StrictModeDroppable droppableId={image.id}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200 h-[180px]"
                                      >
                                        {settings?.find(s => s.page === page && s.section === section.id)?.[image.id] ? (
                                          <div className="relative group h-full">
                                            {settings.find(s => s.page === page && s.section === section.id)?.[image.id]?.includes('.mp4') ? (
                                              <video
                                                src={settings.find(s => s.page === page && s.section === section.id)?.[image.id]}
                                                className="w-full h-full object-cover"
                                                controls
                                              />
                                            ) : (
                                              <img
                                                src={settings.find(s => s.page === page && s.section === section.id)?.[image.id]}
                                                alt={image.label}
                                                className="w-full h-full object-cover"
                                              />
                                            )}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                              <ShadcnButton
                                                variant="destructive"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => updateSettingsMutation.mutate({
                                                  id: settings.find(s => s.page === page && s.section === section.id)?.id!,
                                                  updates: { [image.id]: null }
                                                })}
                                              >
                                                <X className="h-4 w-4" />
                                              </ShadcnButton>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="h-full flex flex-col items-center justify-center gap-2 p-4">
                                            <span className="text-gray-400 text-sm text-center">
                                              Drag and drop media here or
                                            </span>
                                            <Input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              id={`upload-${image.id}`}
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(
                                                  file,
                                                  settings?.find(s => s.page === page && s.section === section.id)?.id!,
                                                  image.id
                                                );
                                              }}
                                            />
                                            <label
                                              htmlFor={`upload-${image.id}`}
                                              className="text-aqua-600 hover:text-aqua-500 text-sm cursor-pointer"
                                            >
                                              click to upload
                                            </label>
                                          </div>
                                        )}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </StrictModeDroppable>
                                </div>
                              ))}
                            </div>
                            
                            {/* Rest of the media gallery code */}
                            <div className="mt-6">
                              <div className="flex items-center gap-2 mb-3">
                                <Grid3X3 className="h-4 w-4" />
                                <h3 className="text-sm font-medium">Available Media</h3>
                              </div>
                              <StrictModeDroppable droppableId="gallery" isDropDisabled>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3"
                                  >
                                    {mediaFiles?.filter(file => file.type === 'image').map((file, index) => (
                                      <Draggable key={file.url} draggableId={file.url} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`relative group h-[100px] rounded-lg overflow-hidden border border-gray-200 cursor-move hover:border-aqua-500 transition-colors ${
                                              snapshot.isDragging ? 'opacity-50' : ''
                                            }`}
                                          >
                                            <img
                                              src={file.url}
                                              alt={file.name}
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </StrictModeDroppable>
                            </div>
                          </div>
                        </DragDropContext>
                      ) : null}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// Helper component for upload buttons
const UploadButton = ({ accept, onUpload, label }: { accept: string, onUpload: (file: File) => void, label: string }) => (
  <div className="text-center">
    <Upload className="mx-auto h-12 w-12 text-gray-400" />
    <div className="mt-4">
      <label className="cursor-pointer">
        <Input
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        <span className="text-aqua-600 hover:text-aqua-500 text-sm">
          {label}
        </span>
      </label>
    </div>
  </div>
);

export default SettingsManager;
