import React, { useState } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Send, User, Mail, Building, Briefcase, Calendar } from 'lucide-react';

const InviteVisitor: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorCompany: '',
    purpose: '',
    scheduledTime: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await mockApi.createAppointment({
        ...formData,
        scheduledTime: new Date(formData.scheduledTime),
        employeeId: user.id,
      });
      addToast(`Invitation sent to ${formData.visitorName}!`, 'success');
      setFormData({
        visitorName: '',
        visitorEmail: '',
        visitorCompany: '',
        purpose: '',
        scheduledTime: '',
      });
    } catch (error) {
      addToast('Failed to send invitation. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Invite a Visitor</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" name="visitorName" placeholder="Visitor's Name" value={formData.visitorName} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="email" name="visitorEmail" placeholder="Visitor's Email" value={formData.visitorEmail} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div className="relative">
          <Building className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" name="visitorCompany" placeholder="Visitor's Company" value={formData.visitorCompany} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
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
            <Send className="mr-2" size={20} />
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteVisitor;
