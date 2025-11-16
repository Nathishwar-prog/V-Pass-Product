import React, { useState } from 'react';
import QrScanner from '../../components/shared/QrScanner';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { Appointment, Visitor, User, VisitorStatus } from '../../types';
import { CheckCircle, XCircle, LogIn, LogOut, Loader, User as UserIcon, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScanResult {
    status: 'success' | 'error';
    message: string;
    visitorName?: string;
    action?: 'in' | 'out';
}

interface VerificationDetails {
    appointment: Appointment;
    visitor: Visitor;
    host: User;
}

const SecurityDashboard: React.FC = () => {
    const { user } = useAuth();
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [verificationDetails, setVerificationDetails] = useState<VerificationDetails | null>(null);


    const handleScan = async (data: string) => {
        setLoading(true);
        setScanResult(null);
        setVerificationDetails(null);
        try {
            const { passId } = JSON.parse(data);
            if (!passId) throw new Error("Invalid QR code");

            const details = await mockApi.getAppointmentByPassId(passId);

            if (!details) {
                setScanResult({ status: 'error', message: 'No visitor found for this pass.' });
                return;
            }
            
            const { appointment, visitor, host } = details;
            
            if (appointment.status === VisitorStatus.APPROVED || appointment.status === VisitorStatus.CHECKED_OUT || appointment.status === VisitorStatus.CHECKED_IN) {
                setVerificationDetails({ appointment, visitor, host });
            } else {
                setScanResult({ status: 'error', message: `Visitor status is ${appointment.status}. Cannot proceed.` });
            }

        } catch (error) {
            setScanResult({ status: 'error', message: 'Invalid QR code format.' });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!verificationDetails || !user) return;
        setLoading(true);

        const { appointment, visitor } = verificationDetails;
        const passId = visitor.passId;

        if (appointment.status === VisitorStatus.APPROVED || appointment.status === VisitorStatus.CHECKED_OUT) {
            const res = await mockApi.checkInVisitor(passId, user.id);
             if(res.success) {
                setScanResult({ status: 'success', message: `${visitor.name} checked in successfully.`, visitorName: visitor.name, action: 'in' });
             } else {
                setScanResult({ status: 'error', message: res.message });
             }
        } else if (appointment.status === VisitorStatus.CHECKED_IN) {
            const res = await mockApi.checkOutVisitor(passId, user.id);
            if(res.success) {
                setScanResult({ status: 'success', message: `${visitor.name} checked out successfully.`, visitorName: visitor.name, action: 'out' });
            } else {
                setScanResult({ status: 'error', message: res.message });
            }
        }
        
        setVerificationDetails(null);
        setLoading(false);
    };

    const handleCancel = () => {
        setVerificationDetails(null);
        setScanResult(null);
    };
    
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Security Checkpoint</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                     <QrScanner onScan={handleScan} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
                     <h2 className="text-xl font-semibold mb-4 text-gray-700">Scan Status</h2>
                     {loading && (
                        <div className="flex flex-col items-center justify-center h-full text-primary-500">
                           <Loader className="animate-spin" size={48} />
                           <p className="mt-4">Processing...</p>
                        </div>
                     )}
                     {!loading && verificationDetails && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Verify Visitor Identity</h3>
                            <div className="flex flex-col items-center text-center">
                                <img src={verificationDetails.visitor.photoUrl} alt={verificationDetails.visitor.name} className="w-24 h-24 rounded-full border-4 border-gray-200 shadow-md" />
                                <h4 className="text-xl font-bold mt-2">{verificationDetails.visitor.name}</h4>
                                <p className="text-gray-500">{verificationDetails.visitor.company}</p>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-start"><UserIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-1" /> <div><strong>Host:</strong> <span className="ml-1">{verificationDetails.host.name}</span></div></div>
                                <div className="flex items-start"><Briefcase className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-1" /> <div><strong>Purpose:</strong> <span className="ml-1">{verificationDetails.appointment.purpose}</span></div></div>
                            </div>
                            <div className="mt-6 flex space-x-2 sm:space-x-4">
                                <button onClick={handleCancel} className="w-full bg-gray-200 text-gray-800 py-2 px-2 sm:px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center text-sm">
                                    <XCircle size={18} className="mr-1 sm:mr-2" /> Cancel
                                </button>
                                <button onClick={handleConfirm} className="w-full bg-green-500 text-white py-2 px-2 sm:px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center text-sm">
                                    <CheckCircle size={18} className="mr-1 sm:mr-2" /> 
                                    { (verificationDetails.appointment.status === VisitorStatus.APPROVED || verificationDetails.appointment.status === VisitorStatus.CHECKED_OUT) ? 'Check-In' : 'Check-Out' }
                                </button>
                            </div>
                        </div>
                     )}
                     {!loading && !verificationDetails && scanResult && (
                        <div className={`p-4 rounded-md flex flex-col items-center text-center h-full justify-center ${scanResult.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {scanResult.status === 'success' ? <CheckCircle size={48} /> : <XCircle size={48} />}
                           <p className="font-bold text-lg mt-4">{scanResult.status === 'success' ? 'Success!' : 'Error!'}</p>
                           <p className="mt-2">{scanResult.message}</p>
                           {scanResult.action === 'in' && <LogIn className="mt-2" />}
                           {scanResult.action === 'out' && <LogOut className="mt-2" />}
                        </div>
                     )}
                     {!loading && !verificationDetails && !scanResult && (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <p>Scan a visitor pass to verify and check-in/out.</p>
                         </div>
                     )}

                     <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Manual Actions</h3>
                        <p className="text-sm text-gray-500 mb-4">For visitors without a pre-registered pass.</p>
                        <Link to="/security/issue-pass" className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center">
                            Issue Walk-in Pass
                        </Link>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;
