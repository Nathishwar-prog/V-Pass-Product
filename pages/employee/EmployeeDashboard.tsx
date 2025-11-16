import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { Appointment, VisitorStatus, Visitor, User } from '../../types';
import { Users, UserCheck, Clock, Calendar, Loader } from 'lucide-react';

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

const EmployeeDashboard: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [visitors, setVisitors] = useState<Map<string, Visitor>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            const appts = await mockApi.getAppointmentsForEmployee(user.id);
            setAppointments(appts);
            
            const visitorIds = [...new Set(appts.map(a => a.visitorId))];
            const visitorData = await Promise.all(visitorIds.map(id => mockApi.getVisitorById(id)));
            const visitorMap = new Map();
            visitorData.forEach(v => {
                if (v) visitorMap.set(v.id, v);
            });
            setVisitors(visitorMap);
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const stats = useMemo(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        const todaysAppointments = appointments.filter(a => new Date(a.scheduledTime).setHours(0, 0, 0, 0) === today);
        return {
            pending: appointments.filter(a => a.status === VisitorStatus.PENDING).length,
            todays: todaysAppointments.length,
            checkedIn: todaysAppointments.filter(a => a.status === VisitorStatus.CHECKED_IN).length,
            upcoming: appointments.filter(a => a.scheduledTime > new Date() && a.status === VisitorStatus.APPROVED).length,
        };
    }, [appointments]);

    const upcomingAppointments = useMemo(() => {
         return appointments
            .filter(a => a.scheduledTime >= new Date() && (a.status === VisitorStatus.APPROVED || a.status === VisitorStatus.CHECKED_IN))
            .sort((a,b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
            .slice(0, 5);
    }, [appointments]);


    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary-500" size={40} /></div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Today's Visitors" value={stats.todays} icon={<Users className="text-white" />} color="bg-blue-500" />
                <StatCard title="Currently Checked-In" value={stats.checkedIn} icon={<UserCheck className="text-white" />} color="bg-green-500" />
                <StatCard title="Pending Approvals" value={stats.pending} icon={<Clock className="text-white" />} color="bg-yellow-500" />
                <StatCard title="Upcoming Visitors" value={stats.upcoming} icon={<Calendar className="text-white" />} color="bg-indigo-500" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Appointments</h2>
                {upcomingAppointments.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {upcomingAppointments.map(appt => {
                            const visitor = visitors.get(appt.visitorId);
                            return (
                                <li key={appt.id} className="py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full" src={visitor?.photoUrl} alt={visitor?.name} />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{visitor?.name}</p>
                                            <p className="text-sm text-gray-500">{appt.purpose}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">{appt.scheduledTime.toLocaleString()}</p>
                                         <p className="text-right mt-1">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appt.status === VisitorStatus.CHECKED_IN ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {appt.status}
                                            </span>
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-8">No upcoming appointments.</p>
                )}
                 <div className="mt-6 text-right">
                     <Link to="/employee/my-visitors" className="font-medium text-primary-600 hover:text-primary-800">
                        View all my visitors &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
