
import React, { useState, useEffect, useCallback } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { User, UserRole, Visitor, Appointment } from '../../types';
import { Send, User as UserIcon, Building, Briefcase, Phone, Loader, Camera } from 'lucide-react';
import DigitalPass from '../../components/visitor/DigitalPass';

const CameraCapture: React.FC<{ onCapture: (dataUrl: string) => void }> = ({ onCapture }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = React.useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = React.useState<string | null>(null);

    const startCamera = useCallback(async () => {
        setCapturedImage(null);
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
              alert("Camera access is not supported by this browser.");
              return;
            }
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            const video = videoRef.current;
            if (video) {
                video.srcObject = mediaStream;
                video.onloadedmetadata = () => {
                    video.play().catch(err => {
                        console.error("Camera play error:", err);
                        alert("Could not start camera. Please ensure permissions are granted.");
                    });
                };
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
             if (err instanceof Error) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    alert("Camera permission denied. Please allow access in your browser settings.");
                } else {
                    alert("Could not access camera. An error occurred.");
                }
            } else {
                alert("An unknown error occurred while accessing the camera.");
            }
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);


    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);
            onCapture(dataUrl);
            stopCamera();
        }
    };
    
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    return (
        <div className="border border-gray-300 rounded-lg p-4 text-center">
            <div className="relative w-full aspect-video bg-gray-200 rounded-md overflow-hidden mb-4">
                {capturedImage ? (
                    <img src={capturedImage} alt="Captured visitor" className="w-full h-full object-cover" />
                ) : (
                    <video ref={videoRef} playsInline className="w-full h-full object-cover"></video>
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            {!capturedImage && stream && (
                <button type="button" onClick={takePhoto} className="bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center w-full">
                    <Camera size={20} className="mr-2" />
                    Capture Photo
                </button>
            )}
             {capturedImage && (
                <button type="button" onClick={startCamera} className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors w-full">
                    Retake Photo
                </button>
            )}
        </div>
    );
};


const IssuePass: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    visitorName: '', visitorPhone: '', visitorCompany: '', purpose: '', employeeId: ''
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuedPass, setIssuedPass] = useState<{ visitor: Visitor; appointment: Appointment; host: User; } | null>(null);
  
  useEffect(() => {
    mockApi.getUsers().then(users => {
      setEmployees(users.filter(u => u.role === UserRole.EMPLOYEE));
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      alert('Please capture a photo of the visitor.');
      return;
    }
    setLoading(true);
    const { appointment, visitor } = await mockApi.createWalkIn({ ...formData, photoUrl });
    const host = employees.find(emp => emp.id === appointment.employeeId)!;
    setIssuedPass({ appointment, visitor, host });
    setLoading(false);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary-500" size={40} /></div>;
  }
  
  if (issuedPass) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Pass Issued Successfully!</h1>
            <DigitalPass visitor={issuedPass.visitor} appointment={issuedPass.appointment} host={issuedPass.host} />
            <div className="text-center mt-4">
                <button onClick={() => setIssuedPass(null)} className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                    Issue Another Pass
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Issue Walk-in Visitor Pass</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="text" name="visitorName" placeholder="Visitor's Name" value={formData.visitorName} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                 <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="tel" name="visitorPhone" placeholder="Visitor's Phone" value={formData.visitorPhone} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
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
                  <UserIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                  <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border appearance-none border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Select Host Employee</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Visitor Photo</h3>
                <CameraCapture onCapture={(url) => setPhotoUrl(url)} />
             </div>
        </div>
        <div className="mt-8">
          <button type="submit" disabled={loading || !photoUrl} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-primary-300 flex items-center justify-center">
            <Send className="mr-2" size={20} />
            {loading ? 'Issuing Pass...' : 'Issue Pass & Check-In'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssuePass;
