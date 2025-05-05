
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/ui/color-picker';
import { toast } from '@/components/ui/use-toast';
import { Paintbrush, FileImage, Type, Settings, Code, Palette, Save } from 'lucide-react';

// Define the configuration structure
interface WebsiteConfig {
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    backgroundImage: string;
  };
  about: {
    title: string;
    description: string;
    imageUrl: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  footer: {
    copyright: string;
    socialLinks: {
      facebook: string;
      twitter: string;
      instagram: string;
    };
  };
}

// Default configuration
const defaultConfig: WebsiteConfig = {
  hero: {
    title: "Premium Arowana Fish for True Enthusiasts",
    subtitle: "Discover our exclusive collection of rare and exotic Arowana species, handpicked for the discerning collector.",
    buttonText: "Explore Collection",
    backgroundImage: "https://images.unsplash.com/photo-1520301255226-bf5f144451c1",
  },
  about: {
    title: "About LifestyleAqua",
    description: "LifestyleAqua is a premier destination for exotic fish enthusiasts, specializing in rare Arowana species. With decades of expertise, we source the finest specimens from around the world, ensuring authenticity, health, and exceptional quality.",
    imageUrl: "https://images.unsplash.com/photo-1571438188835-b7f91387e7d3",
  },
  theme: {
    primaryColor: "#058c8c",
    secondaryColor: "#1a4645",
    textColor: "#333333",
    backgroundColor: "#ffffff",
  },
  contact: {
    email: "contact@lifestyleaqua.com",
    phone: "+1 (555) 123-4567",
    address: "123 Aquarium Avenue, Ocean City, CA 90210",
  },
  footer: {
    copyright: "© 2023 LifestyleAqua. All rights reserved.",
    socialLinks: {
      facebook: "https://facebook.com/lifestyleaqua",
      twitter: "https://twitter.com/lifestyleaqua",
      instagram: "https://instagram.com/lifestyleaqua",
    },
  },
};

// Type guard function to ensure key is a valid section of WebsiteConfig
function isConfigSection(key: string): key is keyof WebsiteConfig {
  return key in defaultConfig;
}

const WebsiteEditor: React.FC = () => {
  const [config, setConfig] = useState<WebsiteConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState("hero");

  const handleChange = (section: keyof WebsiteConfig, field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedChange = (section: keyof WebsiteConfig, parent: string, field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...(prev[section] as any)[parent],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    // In a real implementation, you would apply these changes to your website
    // For this example, we'll just show a success message
    toast({
      title: "Changes saved",
      description: "Your website configuration has been updated successfully.",
    });
    
    // Here you could trigger a rebuild of the website with the new configuration
    console.log("New configuration:", config);
  };

  const handleReset = () => {
    // Reset to default configuration
    setConfig(defaultConfig);
    toast({
      title: "Configuration reset",
      description: "Your website configuration has been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website Editor</CardTitle>
          <CardDescription>
            Customize the appearance and content of your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="hero">
                <FileImage className="h-4 w-4 mr-2" />
                Hero Section
              </TabsTrigger>
              <TabsTrigger value="about">
                <Type className="h-4 w-4 mr-2" />
                About
              </TabsTrigger>
              <TabsTrigger value="theme">
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Settings className="h-4 w-4 mr-2" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="footer">
                <Code className="h-4 w-4 mr-2" />
                Footer
              </TabsTrigger>
            </TabsList>
            
            {/* Hero Section */}
            <TabsContent value="hero" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Title</Label>
                  <Input 
                    id="hero-title" 
                    value={config.hero.title} 
                    onChange={(e) => handleChange('hero', 'title', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Subtitle</Label>
                  <Textarea 
                    id="hero-subtitle" 
                    value={config.hero.subtitle} 
                    onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-button">Button Text</Label>
                  <Input 
                    id="hero-button" 
                    value={config.hero.buttonText} 
                    onChange={(e) => handleChange('hero', 'buttonText', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero-background">Background Image URL</Label>
                  <Input 
                    id="hero-background" 
                    value={config.hero.backgroundImage} 
                    onChange={(e) => handleChange('hero', 'backgroundImage', e.target.value)} 
                  />
                  {config.hero.backgroundImage && (
                    <div className="mt-2 relative h-40 rounded-md overflow-hidden">
                      <img 
                        src={config.hero.backgroundImage} 
                        alt="Hero background preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* About Section */}
            <TabsContent value="about" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="about-title">Title</Label>
                  <Input 
                    id="about-title" 
                    value={config.about.title} 
                    onChange={(e) => handleChange('about', 'title', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="about-description">Description</Label>
                  <Textarea 
                    id="about-description" 
                    value={config.about.description} 
                    onChange={(e) => handleChange('about', 'description', e.target.value)} 
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="about-image">Image URL</Label>
                  <Input 
                    id="about-image" 
                    value={config.about.imageUrl} 
                    onChange={(e) => handleChange('about', 'imageUrl', e.target.value)} 
                  />
                  {config.about.imageUrl && (
                    <div className="mt-2 relative h-40 rounded-md overflow-hidden">
                      <img 
                        src={config.about.imageUrl} 
                        alt="About section preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Theme Section */}
            <TabsContent value="theme" className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300" 
                        style={{ backgroundColor: config.theme.primaryColor }}
                      />
                      <Input 
                        id="primary-color" 
                        value={config.theme.primaryColor} 
                        onChange={(e) => handleChange('theme', 'primaryColor', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300" 
                        style={{ backgroundColor: config.theme.secondaryColor }}
                      />
                      <Input 
                        id="secondary-color" 
                        value={config.theme.secondaryColor} 
                        onChange={(e) => handleChange('theme', 'secondaryColor', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300" 
                        style={{ backgroundColor: config.theme.textColor }}
                      />
                      <Input 
                        id="text-color" 
                        value={config.theme.textColor} 
                        onChange={(e) => handleChange('theme', 'textColor', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300" 
                        style={{ backgroundColor: config.theme.backgroundColor }}
                      />
                      <Input 
                        id="background-color" 
                        value={config.theme.backgroundColor} 
                        onChange={(e) => handleChange('theme', 'backgroundColor', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-md border" style={{ backgroundColor: config.theme.backgroundColor }}>
                  <h3 className="text-lg font-bold mb-2" style={{ color: config.theme.primaryColor }}>Theme Preview</h3>
                  <p className="mb-4" style={{ color: config.theme.textColor }}>
                    This is how your text will look with the selected colors.
                  </p>
                  <ShadcnButton style={{ backgroundColor: config.theme.primaryColor, color: config.theme.backgroundColor }}>
                    Example Button
                  </ShadcnButton>
                </div>
              </div>
            </TabsContent>
            
            {/* Contact Section */}
            <TabsContent value="contact" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input 
                    id="contact-email" 
                    value={config.contact.email} 
                    onChange={(e) => handleChange('contact', 'email', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input 
                    id="contact-phone" 
                    value={config.contact.phone} 
                    onChange={(e) => handleChange('contact', 'phone', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-address">Address</Label>
                  <Textarea 
                    id="contact-address" 
                    value={config.contact.address} 
                    onChange={(e) => handleChange('contact', 'address', e.target.value)} 
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Footer Section */}
            <TabsContent value="footer" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-copyright">Copyright Text</Label>
                  <Input 
                    id="footer-copyright" 
                    value={config.footer.copyright} 
                    onChange={(e) => handleChange('footer', 'copyright', e.target.value)} 
                  />
                </div>
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-3">Social Links</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="footer-facebook">Facebook URL</Label>
                      <Input 
                        id="footer-facebook" 
                        value={config.footer.socialLinks.facebook} 
                        onChange={(e) => handleNestedChange('footer', 'socialLinks', 'facebook', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="footer-twitter">Twitter URL</Label>
                      <Input 
                        id="footer-twitter" 
                        value={config.footer.socialLinks.twitter} 
                        onChange={(e) => handleNestedChange('footer', 'socialLinks', 'twitter', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="footer-instagram">Instagram URL</Label>
                      <Input 
                        id="footer-instagram" 
                        value={config.footer.socialLinks.instagram} 
                        onChange={(e) => handleNestedChange('footer', 'socialLinks', 'instagram', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 flex justify-end space-x-4">
            <ShadcnButton variant="outline" onClick={handleReset}>
              Reset to Default
            </ShadcnButton>
            <ShadcnButton onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </ShadcnButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteEditor;
