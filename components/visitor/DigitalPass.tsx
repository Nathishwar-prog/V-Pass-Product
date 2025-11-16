import React from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Visitor, Appointment, User } from '../../types';
import { Calendar, User as UserIcon, Building, Briefcase, Clock, QrCode, CheckCircle, Printer } from 'lucide-react';

interface DigitalPassProps {
  visitor: Visitor;
  appointment: Appointment;
  host: User;
}

const DigitalPass: React.FC<DigitalPassProps> = ({ visitor, appointment, host }) => {
  const passData = JSON.stringify({ passId: visitor.passId, visitorId: visitor.id });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
    <style>
      {`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-pass, #printable-pass * {
            visibility: visible;
          }
          #printable-pass {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}
    </style>
    <div id="printable-pass" className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden my-8">
      <div className="bg-primary-600 text-white p-6 text-center">
        <h1 className="text-3xl font-bold">Visitor Pass</h1>
        <p className="mt-1">V-Pass Digital Systems Inc.</p>
      </div>
      <div className="p-6">
        <div className="flex flex-col items-center">
          <img
            className="w-28 h-28 rounded-full border-4 border-white -mt-16 shadow-md"
            src={visitor.photoUrl}
            alt={visitor.name}
          />
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">{visitor.name}</h2>
          <p className="text-gray-500">{visitor.company}</p>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center text-gray-700 mb-4">
            <UserIcon size={20} className="text-primary-500 mr-4" />
            <div>
              <p className="text-xs text-gray-500">Host</p>
              <p className="font-medium">{host.name}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-700 mb-4">
            <Briefcase size={20} className="text-primary-500 mr-4" />
            <div>
              <p className="text-xs text-gray-500">Purpose of Visit</p>
              <p className="font-medium">{appointment.purpose}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-700">
            <Calendar size={20} className="text-primary-500 mr-4" />
            <div>
              <p className="text-xs text-gray-500">Date & Time</p>
              <p className="font-medium">{appointment.scheduledTime.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <QRCode value={passData} size={160} />
          <p className="text-sm text-gray-500 mt-4 font-mono">{visitor.passId}</p>
        </div>

      </div>
       <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle size={20} className="mr-2" />
              <p className="font-semibold text-sm">Pass Approved & Valid</p>
            </div>
        </div>
    </div>
    <div className="max-w-md mx-auto text-center no-print">
        <button 
          onClick={handlePrint} 
          className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center"
        >
          <Printer size={20} className="mr-2"/>
          Print / Download PDF
        </button>
      </div>
    </>
  );
};

export default DigitalPass;
