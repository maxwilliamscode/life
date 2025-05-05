import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { ShadcnButton } from '@/components/ui/shadcn-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import BlurBackground from '@/components/layout/BlurBackground';
import authBackground from '/authbg.jpg';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in."
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        await signUp(formData.email, formData.password);
        toast({
          title: "Account created!",
          description: "Your account has been successfully created."
        });
      }
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlurBackground>
      <div className="min-h-screen flex flex-col">
        {/* Add full-page background */}
        <div 
          className="fixed inset-0 z-[-1]"
          style={{
            backgroundImage: `url(${authBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-[1px]"></div>
        
        <div className="min-h-screen flex items-center justify-center p-4 relative">
          <div className="w-full max-w-md relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-aqua-600 to-aqua-400 px-8 py-12 text-white text-center">
                <h2 className="text-3xl font-bold mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-aqua-100">
                  {isLogin 
                    ? 'Sign in to access your account' 
                    : 'Join us and start your aquatic journey'}
                </p>
              </div>

              {/* Form */}
              <div className="p-8 shadow-2xl drop-shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      required
                      className="w-full"
                    />
                  </div>

                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            confirmPassword: e.target.value
                          }))}
                          required={!isLogin}
                          className="w-full"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <ShadcnButton
                    type="submit"
                    className="w-full py-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </ShadcnButton>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-1 text-aqua-600 hover:text-aqua-700 font-medium"
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </BlurBackground>
  );
};

export default Auth;
