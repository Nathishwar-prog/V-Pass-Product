import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import mockApi from '../../services/mockApi';
import { Visitor, Appointment, User, VisitorStatus } from '../../types';
import DigitalPass from '../../components/visitor/DigitalPass';
import { Loader, AlertTriangle, Clock, XCircle } from 'lucide-react';

const ViewPass: React.FC = () => {
  const { passId } = useParams<{ passId: string }>();
  const [passData, setPassData] = useState<{ visitor: Visitor; appointment: Appointment; host: User; } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassData = async () => {
      if (!passId) {
        setError("No pass ID provided.");
        setLoading(false);
        return;
      }

      try {
        const data = await mockApi.getAppointmentByPassId(passId);
        if (data) {
          setPassData(data);
        } else {
          setError("Invalid or expired pass. Please contact your host.");
        }
      } catch (e) {
        setError("An error occurred while fetching your pass details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPassData();
  }, [passId]);
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <Loader className="animate-spin mx-auto text-primary-500" size={48} />
          <p className="mt-4 text-gray-600">Loading your pass...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <AlertTriangle className="mx-auto text-red-500" size={48} />
          <p className="mt-4 font-semibold text-red-700">Unable to load pass</p>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      );
    }

    if (passData) {
      const { appointment, visitor, host } = passData;
      switch (appointment.status) {
        case VisitorStatus.PENDING:
          return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <Clock className="mx-auto text-yellow-500" size={48} />
              <h2 className="mt-4 text-xl font-bold text-gray-800">Request Pending</h2>
              <p className="mt-2 text-gray-600">
                Your visit with <span className="font-semibold">{host.name}</span> on <span className="font-semibold">{appointment.scheduledTime.toLocaleDateString()}</span> is awaiting approval.
              </p>
              <p className="mt-1 text-gray-500 text-sm">Please check back later.</p>
            </div>
          );
        case VisitorStatus.REJECTED:
          return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <XCircle className="mx-auto text-red-500" size={48} />
              <h2 className="mt-4 text-xl font-bold text-gray-800">Request Rejected</h2>
              <p className="mt-2 text-gray-600">
                Unfortunately, your visit request could not be approved at this time.
              </p>
              <p className="mt-4 text-gray-500 text-sm">Please contact your host for more information.</p>
            </div>
          );
        case VisitorStatus.APPROVED:
        case VisitorStatus.CHECKED_IN:
        case VisitorStatus.CHECKED_OUT:
          return <DigitalPass visitor={visitor} appointment={appointment} host={host} />;
        default:
          return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <AlertTriangle className="mx-auto text-gray-500" size={48} />
              <p className="mt-4 text-gray-600">Unknown pass status.</p>
            </div>
          );
      }
    }
    
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
};

export default ViewPass;
