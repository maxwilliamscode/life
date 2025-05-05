import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  MessageSquare,
  Star,
  PlaySquare,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Award,
  Settings
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import ProductsManager from '@/components/admin/ProductsManager';
import OffersManager from '@/components/admin/OffersManager';
import OrdersManager from '@/components/admin/OrdersManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VlogsManager from '@/components/admin/VlogsManager';
import MessagesManager from '@/components/admin/MessagesManager';
import CertificatesManager from '@/components/admin/CertificatesManager';
import SettingsManager from '@/components/admin/SettingsManager';
import BlurBackground from '@/components/layout/BlurBackground';

const Admin: React.FC = () => {
  const { user, isAdmin, checkAdminStatus, session, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminVerified, setAdminVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        setLoading(true);
        
        // First check if user is logged in
        if (!user || !session) {
          console.log('No user or session found, redirecting to auth page');
          toast({
            title: "Authentication required",
            description: "Please login to access the admin dashboard",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }
        
        // Then verify admin status - use the exported function from context
        // This ensures we get a fresh check on page load/refresh
        const isUserAdmin = await checkAdminStatus();
        console.log('Admin verification result:', isUserAdmin);
        
        if (!isUserAdmin) {
          console.log('User is not an admin, redirecting to home page');
          toast({
            title: "Access denied",
            description: "You do not have permission to access the admin dashboard",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        // If we get here, user is verified as admin
        setAdminVerified(true);
      } catch (error) {
        console.error('Error verifying admin access:', error);
        toast({
          title: "Error",
          description: "There was a problem verifying your admin access",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    verifyAccess();
  }, [user, navigate, checkAdminStatus, session]);

  const navItems = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'offers', label: 'Offers', icon: Tags },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'vlogs', label: 'Vlogs', icon: PlaySquare },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-aqua-600" />
      </div>
    );
  }

  if (!adminVerified) return null;

  return (
    <BlurBackground>
      <div className="admin-dashboard">
        <div className="min-h-screen flex">
          {/* Sidebar - Desktop */}
          <div 
            className={`hidden md:flex md:flex-col fixed h-screen transition-all duration-300 ease-in-out z-50 ${
              isSidebarCollapsed ? 'md:w-20' : 'md:w-64'
            }`}
          >
            <div className="flex flex-col flex-1 min-h-0 bg-white/10 backdrop-blur-md border-r border-white/20">
              {/* Update header background */}
              <div className="flex items-center h-16 flex-shrink-0 px-4 bg-aqua-700/90 backdrop-blur-md justify-between">
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-2">
                    <ShadcnButton 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => navigate('/')}
                      className="text-white hover:bg-aqua-600"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </ShadcnButton>
                    <h1 className="text-xl font-bold text-white">Admin</h1>
                  </div>
                )}
                {isSidebarCollapsed && (
                  <ShadcnButton 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate('/')}
                    className="text-white hover:bg-aqua-600"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </ShadcnButton>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 rounded-lg bg-aqua-600 hover:bg-aqua-500 text-white"
                >
                  {isSidebarCollapsed ? 
                    <ChevronRight className="h-5 w-5" /> : 
                    <ChevronLeft className="h-5 w-5" />
                  }
                </button>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
                        {!isSidebarCollapsed && item.label}
                      </button>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-white/20">
                  <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors ${
                      isSidebarCollapsed ? 'justify-center' : ''
                    }`}
                    title={isSidebarCollapsed ? "Sign Out" : undefined}
                  >
                    <LogOut className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
                    {!isSidebarCollapsed && 'Sign Out'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header - Fixed */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center gap-3">
                <ShadcnButton 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/')}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </ShadcnButton>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-white hover:bg-white/10"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Fixed Full Screen */}
          <div 
            className={`
              fixed inset-0 z-40 md:hidden
              transition-all duration-300 ease-out
              ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                 onClick={() => setIsMobileMenuOpen(false)} />

            {/* Menu Content */}
            <div className={`
              absolute inset-0 flex flex-col mt-16
              bg-gradient-to-b from-gray-900/70 to-black/70
              backdrop-blur-md
              transform transition-transform duration-300
              ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}
            `}>
              {/* Navigation Items */}
              <nav className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-md space-y-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-center gap-3 px-4 py-4
                          text-lg font-medium rounded-xl transition-all duration-200
                          ${activeTab === item.id 
                            ? 'bg-white/20 text-white' 
                            : 'text-white/70 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Bottom Actions */}
              <div className="p-6 flex justify-center">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-6 py-3 text-white/80 hover:text-white
                           hover:bg-white/10 rounded-xl transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Update main content styles */}
          <div className={`flex flex-col flex-1 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
            <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                {activeTab === 'products' && <ProductsManager />}
                {activeTab === 'offers' && <OffersManager />}
                {activeTab === 'orders' && <OrdersManager />}
                {activeTab === 'testimonials' && <TestimonialsManager />}
                {activeTab === 'vlogs' && <VlogsManager />}
                {activeTab === 'messages' && <MessagesManager />}
                {activeTab === 'certificates' && <CertificatesManager />}
                {activeTab === 'settings' && <SettingsManager />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </BlurBackground>
  );
};

export default Admin;
