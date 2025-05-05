import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Search, Menu, X, ChevronDown, LogOut, Award } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SearchDialog from './SearchDialog';
import { useCart } from '@/hooks/useCart';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const needsDarkText = [
    '/product/',
    '/arowana-types',
    '/discus-types',
    '/silver-dollar-types'
  ].some(path => location.pathname.includes(path));

  const needsWhiteText = [
    '/auth',
    '/certification',
    '/products',
    '/arowana-types',
    '/discus-types',
    '/silver-dollar-types'
  ].some(path => location.pathname === path);

  const getTextColorClass = (isScrolled: boolean) => {
    if (needsWhiteText && !isScrolled) {
      return 'text-white hover:text-aqua-300';
    }
    if (isScrolled || needsDarkText) {
      return 'text-gray-700 hover:text-aqua-600';
    }
    return 'text-white hover:text-aqua-300';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    const name = user.user_metadata?.name;
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };
  
  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      // If not on home page, navigate to home and then scroll
      navigate('/', { state: { scrollTo: 'about' } });
    } else {
      // If on home page, scroll directly
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      // If not on home page, navigate to home and then scroll
      navigate('/', { state: { scrollTo: 'contact' } });
    } else {
      // If on home page, scroll directly
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  useEffect(() => {
    // Handle scrolling when navigating from another page
    if (location.state && location.state.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        // Add a small delay to ensure the page is loaded
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Clear the state after scrolling
          window.history.replaceState({}, document.title);
        }, 100);
      }
    }
  }, [location]);

  const navigation = [
    { name: 'Home', href: '/' },
    { 
      name: 'Products', 
      href: '/products',
      items: [
        { name: 'Arowana', href: '/arowana-types' },
        { name: 'Discus', href: '/discus-types' },
        { name: 'Silver Dollar', href: '/silver-dollar-types' },
        { 
          name: 'Food',
          href: '/products',
          onClick: () => navigate('/products?search=food')
        },
        { 
          name: 'Accessories',
          href: '/products',
          onClick: () => navigate('/products?search=accessories')
        },
      ]
    },
    { name: 'Arowana Certification', href: '/certification' },
    { 
      name: 'About', 
      href: '/#about',
      onClick: handleAboutClick 
    },
    { 
      name: 'Contact', 
      href: '/#contact',
      onClick: handleContactClick 
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-sm py-2'
            : 'bg-transparent py-3'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className={`text-2xl font-bold text-red-600`}>
              LifestyleAqua
            </span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigation.map((item) => (
                <NavigationMenuItem key={item.name}>
                  {item.items ? (
                    <NavigationMenuTrigger 
                      className={cn(
                        "bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent",
                        getTextColorClass(isScrolled)
                      )}
                      onClick={() => navigate(item.href)}
                    >
                      {item.name}
                    </NavigationMenuTrigger>
                  ) : (
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent focus:bg-transparent focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-transparent/50 data-[state=open]:bg-transparent/50 cursor-pointer",
                        getTextColorClass(isScrolled)
                      )}
                      onClick={(e) => {
                        if (item.onClick) {
                          item.onClick(e);
                        } else {
                          navigate(item.href);
                        }
                      }}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  )}
                  {item.items && (
                    <NavigationMenuContent className="absolute bg-white/95 rounded-lg p-4 shadow-lg border border-gray-100">
                      <div className="grid w-[400px] gap-3 md:w-[500px] md:grid-cols-2">
                        {item.items.map((subItem) => (
                          <NavigationMenuLink asChild key={subItem.name}>
                            <div
                              className="block rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                if (subItem.onClick) {
                                  subItem.onClick();
                                } else {
                                  navigate(subItem.href);
                                }
                              }}
                            >
                              <div className="text-sm font-medium text-gray-900">{subItem.name}</div>
                              <p className="mt-1 text-sm text-gray-500">
                                Explore our {subItem.name.toLowerCase()} collection
                              </p>
                            </div>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              className={`p-2 ${getTextColorClass(isScrolled)} transition-colors`} 
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={20} />
            </button>
            
            {user && (
              <Link to="/wishlist" className={`p-2 ${getTextColorClass(isScrolled)} transition-colors`} aria-label="Wishlist">
                <Heart size={20} />
              </Link>
            )}
            
            {user ? (
              isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`p-1 ${getTextColorClass(isScrolled)} transition-colors`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-aqua-100 text-aqua-700">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-sm font-medium">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link to="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/profile" className={`p-1 ${getTextColorClass(isScrolled)} transition-colors`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-aqua-100 text-aqua-700">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )
            ) : (
              <Link to="/auth" className={`p-2 ${getTextColorClass(isScrolled)} transition-colors`}>
                <User size={20} />
              </Link>
            )}
            
            {user && (
              <div className="relative">
                <Link to="/cart" className={`p-2 ${getTextColorClass(isScrolled)} transition-colors`} aria-label="Cart">
                  <ShoppingCart size={20} />
                </Link>
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-aqua-600 text-xs text-white">
                  {cartItems.length}
                </span>
              </div>
            )}
          </div>

          <button
            className={`md:hidden p-2 ${getTextColorClass(isScrolled)} transition-colors`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="fixed inset-0 z-50 transform translate-y-0 md:hidden">
            <div className="min-h-screen bg-white/80 backdrop-blur-lg flex flex-col pt-16">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
                <Link 
                  to="/" 
                  className="text-2xl font-bold text-red-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  LifestyleAqua
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-gray-800" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-8">
                <div className="container mx-auto px-4 space-y-2">
                  {/* Profile Section - Add this */}
                  {user && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-aqua-100 text-aqua-700">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{user.email}</p>
                          <p className="text-sm text-gray-500">Member</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Link
                          to="/profile"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            signOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}

                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center w-full px-4 py-4 text-lg font-medium text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200 cursor-pointer"
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        if (item.onClick) item.onClick(e);
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Bottom Actions */}
              <div className="border-t border-gray-200/50 p-6 bg-white/50">
                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                  <button 
                    onClick={() => {
                      setSearchOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-white/80 transition-all duration-200"
                  >
                    <Search className="h-6 w-6 mb-2 text-aqua-600" />
                    <span className="text-xs font-medium text-gray-700">Search</span>
                  </button>

                  {user ? (
                    <>
                      <Link 
                        to="/wishlist"
                        className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-white/80 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Heart className="h-6 w-6 mb-2 text-aqua-600" />
                        <span className="text-xs font-medium text-gray-700">Wishlist</span>
                      </Link>
                      <Link 
                        to="/cart"
                        className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-white/80 transition-all duration-200 relative"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="h-6 w-6 mb-2 text-aqua-600" />
                        <span className="text-xs font-medium text-gray-700">Cart</span>
                        {cartItems.length > 0 && (
                          <span className="absolute top-2 right-2 bg-aqua-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartItems.length}
                          </span>
                        )}
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-white/80 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-6 w-6 mb-2 text-aqua-600" />
                      <span className="text-xs font-medium text-gray-700">Login</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default Navbar;
