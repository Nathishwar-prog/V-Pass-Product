
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { Shield, Briefcase, User, Mail, Lock, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleConfig = {
    [UserRole.ADMIN]: { icon: <Shield className="w-6 h-6" />, email: 'admin@vpass.com' },
    [UserRole.SECURITY]: { icon: <Shield className="w-6 h-6" />, email: 'security1@vpass.com' },
    [UserRole.EMPLOYEE]: { icon: <Briefcase className="w-6 h-6" />, email: 'john.doe@vpass.com' },
    [UserRole.VISITOR]: { icon: <User className="w-6 h-6" />, email: '' },
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setEmail(roleConfig[selectedRole].email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, role);
    setLoading(false);

    if (success) {
      switch(role) {
        case UserRole.ADMIN:
          navigate('/admin/dashboard');
          break;
        case UserRole.SECURITY:
          navigate('/security/dashboard');
          break;
        case UserRole.EMPLOYEE:
          navigate('/employee/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      setError('Invalid credentials or role mismatch.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-600">V-Pass</h1>
            <p className="text-gray-500 mt-2">Digital Visitor Management</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="mb-6">
            <div className="flex justify-around rounded-lg bg-gray-100 p-1">
              {Object.values(UserRole).filter(r => r !== UserRole.VISITOR).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all
                    ${role === r ? 'bg-primary-500 text-white shadow' : 'text-gray-700 hover:bg-white/50'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  defaultValue="password" // Mock password
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-primary-300 flex items-center justify-center"
            >
              <LogIn className="mr-2" size={20} />
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Are you a visitor?{' '}
              <Link to="/preregister" className="font-medium text-primary-600 hover:underline">
                Pre-register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
