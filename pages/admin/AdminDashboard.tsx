
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, LogIn, Clock, UserCheck } from 'lucide-react';
import mockApi from '../../services/mockApi';

const data = [
  { name: 'Mon', visitors: 25 },
  { name: 'Tue', visitors: 40 },
  { name: 'Wed', visitors: 60 },
  { name: 'Thu', visitors: 55 },
  { name: 'Fri', visitors: 75 },
  { name: 'Sat', visitors: 30 },
  { name: 'Sun', visitors: 15 },
];

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0, checkedOutToday: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        mockApi.getDashboardStats().then(data => {
            setStats(data);
            setLoading(false);
        });
    }, []);

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Visitors" value={stats.total} icon={<Users className="text-white" />} color="bg-blue-500" />
            <StatCard title="Currently Checked-In" value={stats.checkedIn} icon={<LogIn className="text-white" />} color="bg-green-500" />
            <StatCard title="Pending Approvals" value={stats.pending} icon={<Clock className="text-white" />} color="bg-yellow-500" />
            <StatCard title="Checked Out Today" value={stats.checkedOutToday} icon={<UserCheck className="text-white" />} color="bg-indigo-500" />
        </div>
      
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Weekly Visitor Traffic</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="visitors" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
