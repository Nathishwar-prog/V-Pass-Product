import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import mockApi from '../../services/mockApi';
import { Appointment, Visitor, User } from '../../types';
import { Download, Calendar as CalendarIcon, Loader } from 'lucide-react';

type EnrichedAppointment = Appointment & { visitor: Visitor, host: User };

const Reports: React.FC = () => {
    const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await mockApi.getEnrichedAppointments();
            setAppointments(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const dailyTraffic = useMemo(() => {
        const traffic: { [key: string]: number } = {};
        appointments.forEach(appt => {
            const date = appt.scheduledTime.toLocaleDateString();
            traffic[date] = (traffic[date] || 0) + 1;
        });
        return Object.entries(traffic).map(([name, visitors]) => ({ name, visitors })).slice(0, 7).reverse();
    }, [appointments]);

    const visitPurposeData = useMemo(() => {
        const purposes: { [key: string]: number } = {};
        appointments.forEach(appt => {
            purposes[appt.purpose] = (purposes[appt.purpose] || 0) + 1;
        });
        return Object.entries(purposes).map(([name, value]) => ({ name, value }));
    }, [appointments]);
    
    const handleExport = () => {
        const headers = ['Visitor Name', 'Visitor Company', 'Host Name', 'Scheduled Time', 'Purpose', 'Status', 'Pass ID'];
        const rows = appointments.map(appt => [
            `"${appt.visitor.name}"`,
            `"${appt.visitor.company}"`,
            `"${appt.host.name}"`,
            `"${appt.scheduledTime.toLocaleString()}"`,
            `"${appt.purpose}"`,
            `"${appt.status}"`,
            `"${appt.visitor.passId}"`
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "visitor_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader className="animate-spin text-primary-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Visitor Reports</h1>
                <button onClick={handleExport} className="bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center">
                    <Download size={20} className="mr-2" />
                    Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Daily Visitor Traffic</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyTraffic}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="visitors" fill="#3b82f6" name="Visitors" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Visit Purpose</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={visitPurposeData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                                {visitPurposeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Detailed Visitor Log</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map(appt => (
                                <tr key={appt.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appt.visitor.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.host.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.scheduledTime.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.purpose}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
