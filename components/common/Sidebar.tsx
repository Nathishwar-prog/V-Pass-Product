
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { LayoutDashboard, Shield, Briefcase, Users, FileText, QrCode, LogIn, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navLinks = {
    [UserRole.ADMIN]: [
      { to: '/admin/dashboard', text: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { to: '/admin/manage-staff', text: 'Manage Staff', icon: <Users size={20} /> },
      { to: '/admin/reports', text: 'Reports', icon: <FileText size={20} /> },
    ],
    [UserRole.SECURITY]: [
      { to: '/security/dashboard', text: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { to: '/security/issue-pass', text: 'Issue Pass', icon: <QrCode size={20} /> },
      { to: '/security/visitor-log', text: 'Visitor Log', icon: <FileText size={20} /> },
    ],
    [UserRole.EMPLOYEE]: [
      { to: '/employee/dashboard', text: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { to: '/employee/invite-visitor', text: 'Invite Visitor', icon: <LogIn size={20} /> },
      { to: '/employee/my-visitors', text: 'My Visitors', icon: <Users size={20} /> },
    ],
  };

  const activeLinks = user ? navLinks[user.role] : [];
  
  const baseLinkClasses = "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150";
  const inactiveLinkClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  const activeLinkClasses = "bg-primary-500 text-white shadow";

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 w-64 z-50 transform transition-transform md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600 cursor-pointer" onClick={() => navigate('/')}>V-Pass</h1>
           <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {activeLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
              }
            >
              {link.icon}
              <span className="ml-4">{link.text}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
