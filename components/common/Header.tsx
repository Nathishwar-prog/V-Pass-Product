
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    if (path.startsWith('pass-')) return 'Visitor Pass';
    if (path === 'preregister') return 'Visitor Pre-registration';
    return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={onToggleSidebar}
              className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{getTitle()}</h1>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
              <button
                onClick={logout}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
