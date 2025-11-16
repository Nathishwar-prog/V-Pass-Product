import React, { useEffect, useState, useMemo, useCallback } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Appointment, Visitor, VisitorStatus } from '../../types';
import { Check, X, Loader } from 'lucide-react';

const MyVisitors: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [visitors, setVisitors] = useState<Map<string, Visitor>>(new Map());
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const appts = await mockApi.getAppointmentsForEmployee(user.id);
        setAppointments(appts.sort((a,b) => b.scheduledTime.getTime() - a.scheduledTime.getTime()));
        
        const visitorIds = [...new Set(appts.map(a => a.visitorId))];
        const visitorData = await Promise.all(visitorIds.map(id => mockApi.getVisitorById(id)));
        const visitorMap = new Map();
        visitorData.forEach(v => v && visitorMap.set(v.id, v));
        setVisitors(visitorMap);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleUpdateStatus = async (appointmentId: string, status: VisitorStatus) => {
        setUpdatingAppointmentId(appointmentId);
        try {
            const visitorName = visitors.get(appointments.find(a => a.id === appointmentId)?.visitorId || '')?.name || 'Visitor';
            await mockApi.updateAppointmentStatus(appointmentId, status);
            addToast(`${visitorName}'s request has been ${status.toLowerCase()}.`, 'success');
            await fetchAppointments();
        } catch (error) {
            addToast('Failed to update status. Please try again.', 'error');
        } finally {
            setUpdatingAppointmentId(null);
        }
    };

    const filteredAppointments = useMemo(() => {
        const now = new Date();
        switch (activeTab) {
            case 'pending':
                return appointments.filter(a => a.status === VisitorStatus.PENDING);
            case 'upcoming':
                return appointments.filter(a => a.scheduledTime >= now && (a.status === VisitorStatus.APPROVED || a.status === VisitorStatus.CHECKED_IN));
            case 'past':
                return appointments.filter(a => a.scheduledTime < now && a.status !== VisitorStatus.PENDING);
            default:
                return [];
        }
    }, [activeTab, appointments]);

    const tabs = [
        { id: 'pending', label: 'Pending' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'past', label: 'Past' }
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Visitors</h1>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {loading ? (
                 <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary-500" size={40} /></div>
            ) : (
                <div className="mt-6">
                    {filteredAppointments.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No visitors in this category.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {filteredAppointments.map(appt => {
                                const visitor = visitors.get(appt.visitorId);
                                if (!visitor) return null;
                                return (
                                    <li key={appt.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                                        <div className="flex items-center mb-4 md:mb-0">
                                            <img className="h-12 w-12 rounded-full" src={visitor.photoUrl} alt={visitor.name} />
                                            <div className="ml-4">
                                                <p className="text-md font-medium text-gray-900">{visitor.name}</p>
                                                <p className="text-sm text-gray-600">{visitor.company}</p>
                                                <p className="text-sm text-gray-500">{appt.purpose} - {appt.scheduledTime.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {activeTab === 'pending' ? (
                                            <div className="flex-shrink-0 flex space-x-2 items-center justify-center w-[90px]">
                                                {updatingAppointmentId === appt.id ? (
                                                    <Loader size={24} className="animate-spin text-gray-500" />
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(appt.id, VisitorStatus.APPROVED)} 
                                                            className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={!!updatingAppointmentId}
                                                            aria-label={`Approve ${visitor.name}`}
                                                        >
                                                            <Check size={20} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(appt.id, VisitorStatus.REJECTED)} 
                                                            className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={!!updatingAppointmentId}
                                                            aria-label={`Reject ${visitor.name}`}
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800`}>
                                                {appt.status}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyVisitors;