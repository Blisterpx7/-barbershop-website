import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Scissors, User, LogOut, Menu, X, Sparkles, Crown } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Barbers', href: '/barbers' },
    { name: 'Book Now', href: '/booking' },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* Main logo container - Elegant Gold & Burgundy Theme */}
              <div className="w-12 h-12 bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-amber-500/30 relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-yellow-200/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Inner design */}
                <div className="w-9 h-9 bg-gradient-to-br from-white via-amber-50 to-white rounded-lg flex items-center justify-center shadow-inner relative">
                  {/* Scissors with elegant styling */}
                  <div className="relative">
                    <Scissors className="h-5 w-5 text-amber-800 drop-shadow-sm" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-br from-red-600 to-burgundy-700 rounded-full flex items-center justify-center shadow-md">
                      <Crown className="h-1.5 w-1.5 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Corner accents */}
                <div className="absolute top-0.5 right-0.5">
                  <Sparkles className="h-2 w-2 text-amber-300 animate-pulse" />
                </div>
                <div className="absolute bottom-0.5 left-0.5">
                  <Sparkles className="h-2 w-2 text-orange-400 animate-pulse delay-1000" />
                </div>
              </div>
              
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300/20 via-yellow-400/20 to-orange-300/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-red-700 bg-clip-text text-transparent font-serif tracking-wider">
                  BARBERY'S
                </span>
                <div className="w-5 h-5 bg-gradient-to-br from-red-600 to-burgundy-700 rounded-full flex items-center justify-center shadow-md">
                  <Crown className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <span className="text-xs text-amber-600 font-medium -mt-1 tracking-wider">
                PREMIUM GROOMING
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-amber-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-md font-medium hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-amber-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-amber-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-amber-600 hover:text-amber-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 