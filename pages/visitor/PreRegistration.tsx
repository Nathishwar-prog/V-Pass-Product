import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mockApi from '../../services/mockApi';
import { useToast } from '../../context/ToastContext';
import { User, UserRole } from '../../types';
import { Send, User as UserIcon, Mail, Building, Briefcase, Calendar, Users, Loader, CheckCircle } from 'lucide-react';

const PreRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorCompany: '',
    purpose: '',
    scheduledTime: '',
    employeeId: '',
  });
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newPassId, setNewPassId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchEmployees = async () => {
      const allUsers = await mockApi.getUsers();
      setEmployees(allUsers.filter(u => u.role === UserRole.EMPLOYEE));
    };
    fetchEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { visitor } = await mockApi.createAppointment({
        ...formData,
        scheduledTime: new Date(formData.scheduledTime),
      });
      setNewPassId(visitor.passId);
      setSubmitted(true);
    } catch (error) {
      addToast('Failed to submit registration. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8 cursor-pointer" onClick={() => navigate('/login')}>
            <h1 className="text-4xl font-bold text-primary-600">V-Pass</h1>
            <p className="text-gray-500 mt-2">Visitor Pre-Registration</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            {submitted ? (
                <div className="text-center py-12">
                    <CheckCircle className="mx-auto text-green-500" size={64} />
                    <h2 className="mt-6 text-2xl font-bold text-gray-800">Registration Submitted!</h2>
                    <p className="mt-2 text-gray-600">
                        Your appointment request has been sent to your host for approval.
                        You will receive an email with your digital pass once it's confirmed.
                    </p>
                     {newPassId && (
                      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">You can check the status of your request here:</p>
                          <Link to={`/pass/${newPassId}`} className="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm">
                              View My Pass Status (ID: {newPassId})
                          </Link>
                      </div>
                    )}
                    <Link to="/login" className="mt-8 inline-block bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Back to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input type="text" name="visitorName" placeholder="Your Name" value={formData.visitorName} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input type="email" name="visitorEmail" placeholder="Your Email" value={formData.visitorEmail} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>
                    <div className="relative">
                        <Building className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="text" name="visitorCompany" placeholder="Your Company" value={formData.visitorCompany} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                     <div className="relative">
                        <Users className="absolute left-3 top-3 text-gray-400" size={20} />
                        <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Select who you are visiting</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="text" name="purpose" placeholder="Purpose of Visit" value={formData.purpose} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="datetime-local" name="scheduledTime" value={formData.scheduledTime} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-primary-300 flex items-center justify-center">
                            {loading ? <Loader className="animate-spin mr-2" size={20} /> : <Send className="mr-2" size={20} />}
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default PreRegistration;