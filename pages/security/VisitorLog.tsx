import React, { useEffect, useState, useMemo } from 'react';
import mockApi from '../../services/mockApi';
import { Appointment, Visitor, User, VisitorStatus } from '../../types';
import { Search, Loader } from 'lucide-react';

type EnrichedAppointment = Appointment & { visitor: Visitor, host: User };

const getStatusColor = (status: VisitorStatus) => {
    switch (status) {
        case VisitorStatus.CHECKED_IN: return 'bg-green-100 text-green-800';
        case VisitorStatus.CHECKED_OUT: return 'bg-gray-100 text-gray-800';
        case VisitorStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
        case VisitorStatus.APPROVED: return 'bg-blue-100 text-blue-800';
        case VisitorStatus.REJECTED: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const VisitorLog: React.FC = () => {
    const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await mockApi.getEnrichedAppointments();
            setAppointments(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const filteredAppointments = useMemo(() => {
        return appointments
            .filter(appt => statusFilter === 'all' || appt.status === statusFilter)
            .filter(appt =>
                appt.visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appt.host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appt.visitor.passId.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [appointments, searchTerm, statusFilter]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader className="animate-spin text-primary-500" size={48} />
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Visitor Log</h1>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="relative w-full md:w-1/2 lg:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or pass ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div className="w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Statuses</option>
                        {Object.values(VisitorStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAppointments.map(appt => (
                            <tr key={appt.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{appt.visitor.name}</div>
                                    <div className="text-sm text-gray-500">{appt.visitor.passId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.host.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.scheduledTime.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appt.status)}`}>
                                        {appt.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAppointments.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p>No visitors found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitorLog;
