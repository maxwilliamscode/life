import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FilePlus2, FileText, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import BlurBackground from '@/components/layout/BlurBackground';
import certificateImage from '/certificateimg.png';

const ArowanaCertification: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificateId, setCertificateId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [foundCertificate, setFoundCertificate] = useState<any>(null);

  const handleVerify = async () => {
    if (!certificateId) {
      toast({
        title: "Certificate ID required",
        description: "Please enter a valid certificate ID",
        variant: "destructive"
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', certificateId)
        .single();

      if (error) throw error;

      if (data) {
        setFoundCertificate({
          verified: true,
          ...data
        });
        toast({
          title: "Certificate verified",
          description: "This is an authentic LifestyleAqua certificate"
        });
      } else {
        setFoundCertificate({
          verified: false
        });
        toast({
          title: "Verification failed",
          description: "No matching certificate found. This might not be an authentic certificate.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setFoundCertificate({
        verified: false
      });
      toast({
        title: "Verification failed",
        description: "No matching certificate found. This might not be an authentic certificate.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <BlurBackground>
      <div className="min-h-screen flex flex-col">
        
        
        {/* Hero Section - Remove existing background pattern */}
        <div className="relative pt-28 pb-20 overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-aqua-400 to-marine-300">
                  Certificate Verification
                </h1>
                <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                  Verify the authenticity of your Arowana's certificate. We partner with trusted breeders to ensure all our livestock comes with proper certification.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
                  {[
                    { title: 'Verified Breeders', count: '50+' },
                    { title: 'Certificates Verified', count: '5000+' },
                    { title: 'Years of Trust', count: '5+' },
                  ].map((stat, index) => (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                      <div className="text-2xl font-bold text-aqua-400">{stat.count}</div>
                      <div className="text-sm text-gray-400">{stat.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content - Animated Fish - Hidden on small devices */}
              <div className="flex-1 relative hidden lg:block">
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10"
                >
                  <img
                    src={certificateImage}
                    alt="Golden Arowana"
                    className="max-w-md mx-auto drop-shadow-[0_0_15px_rgba(0,200,255,0.2)]"
                  />
                </motion.div>
                {/* Glowing Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-aqua-500/20 to-marine-500/20 blur-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Section - Update background styles */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
            >
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-aqua-600" />
                    Verify Certificate
                  </CardTitle>
                  <CardDescription>
                    Enter your certificate ID to verify its authenticity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="certificate-id">Certificate ID</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="certificate-id" 
                          placeholder="e.g. ARW12345" 
                          value={certificateId}
                          onChange={(e) => setCertificateId(e.target.value)}
                        />
                        <ShadcnButton 
                          onClick={handleVerify} 
                          disabled={isVerifying}
                        >
                          {isVerifying ? 'Verifying...' : 'Verify'}
                        </ShadcnButton>
                      </div>
                    </div>
                    
                    {foundCertificate && (
                      <div className={`mt-6 p-4 rounded-lg ${foundCertificate.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-start gap-3">
                          {foundCertificate.verified ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div>
                            <h3 className={`font-medium ${foundCertificate.verified ? 'text-green-800' : 'text-red-800'}`}>
                              {foundCertificate.verified ? 'Authentic Certificate' : 'No Certificate Found'}
                            </h3>
                            {foundCertificate.verified ? (
                              <div className="mt-2 space-y-1 text-sm">
                                <p><span className="font-medium">ID:</span> {foundCertificate.certificate_id}</p>
                                <p><span className="font-medium">Type:</span> {foundCertificate.type}</p>
                                <p><span className="font-medium">Issue Date:</span> {new Date(foundCertificate.issue_date).toLocaleDateString()}</p>
                                <p><span className="font-medium">Breeder:</span> {foundCertificate.breeder}</p>
                                <p><span className="font-medium">Location:</span> {foundCertificate.location}</p>
                              </div>
                            ) : (
                              <p className="mt-1 text-sm text-red-700">
                                We couldn't find a certificate with this ID. This might not be an authentic certificate.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </BlurBackground>
  );
};

export default ArowanaCertification;
