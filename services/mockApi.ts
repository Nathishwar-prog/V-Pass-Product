import { User, Visitor, Appointment, CheckLog, UserRole, VisitorStatus } from '../types';

let users: User[] = [
  { id: 'admin1', name: 'Admin User', email: 'admin@vpass.com', role: UserRole.ADMIN, avatarUrl: `https://i.pravatar.cc/150?u=admin1` },
  { id: 'sec1', name: 'Security Guard 1', email: 'security1@vpass.com', role: UserRole.SECURITY, avatarUrl: `https://i.pravatar.cc/150?u=sec1` },
  { id: 'sec2', name: 'Security Guard 2', email: 'security2@vpass.com', role: UserRole.SECURITY, avatarUrl: `https://i.pravatar.cc/150?u=sec2` },
  { id: 'emp1', name: 'John Doe', email: 'john.doe@vpass.com', role: UserRole.EMPLOYEE, avatarUrl: `https://i.pravatar.cc/150?u=emp1` },
  { id: 'emp2', name: 'Jane Smith', email: 'jane.smith@vpass.com', role: UserRole.EMPLOYEE, avatarUrl: `https://i.pravatar.cc/150?u=emp2` },
  { id: 'emp3', name: 'Peter Jones', email: 'peter.jones@vpass.com', role: UserRole.EMPLOYEE, avatarUrl: `https://i.pravatar.cc/150?u=emp3` },
];

let visitors: Visitor[] = [
  { id: 'vis1', name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', company: 'Example Inc.', photoUrl: `https://i.pravatar.cc/150?u=vis1`, passId: 'VPASS-1001' },
  { id: 'vis2', name: 'Bob Williams', email: 'bob@visitor.com', phone: '098-765-4321', company: 'Visitor Co.', photoUrl: `https://i.pravatar.cc/150?u=vis2`, passId: 'VPASS-1002' },
  { id: 'vis3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-555-5555', company: 'Peanuts Corp.', photoUrl: `https://i.pravatar.cc/150?u=vis3`, passId: 'VPASS-1003' },
];

let appointments: Appointment[] = [
  { id: 'appt1', visitorId: 'vis1', employeeId: 'emp1', purpose: 'Project Meeting', scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), status: VisitorStatus.APPROVED },
  { id: 'appt2', visitorId: 'vis2', employeeId: 'emp2', purpose: 'Interview', scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000), status: VisitorStatus.CHECKED_OUT },
  { id: 'appt3', visitorId: 'vis3', employeeId: 'emp1', purpose: 'Delivery', scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), status: VisitorStatus.PENDING },
  { id: 'appt4', visitorId: 'vis1', employeeId: 'emp2', purpose: 'Follow-up', scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), status: VisitorStatus.APPROVED },
  { id: 'appt5', visitorId: 'vis2', employeeId: 'emp1', purpose: 'Quarterly Review', scheduledTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: VisitorStatus.CHECKED_OUT },
];

let checkLogs: CheckLog[] = [
    { id: 'log1', passId: 'VPASS-1002', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 1000), type: 'in', securityId: 'sec1'},
    { id: 'log2', passId: 'VPASS-1002', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), type: 'out', securityId: 'sec1'},
    { id: 'log3', passId: 'VPASS-1005', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000), type: 'in', securityId: 'sec2'},
    { id: 'log4', passId: 'VPASS-1005', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), type: 'out', securityId: 'sec2'},
];


const api = {
  login: (email: string): Promise<User | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(users.find(u => u.email === email)), 500));
  },
  
  getAppointmentsForEmployee: (employeeId: string): Promise<Appointment[]> => {
    return new Promise(resolve => setTimeout(() => resolve(appointments.filter(a => a.employeeId === employeeId)), 300));
  },
  
  getAllAppointments: (): Promise<Appointment[]> => {
    return new Promise(resolve => setTimeout(() => resolve(appointments), 300));
  },

  getEnrichedAppointments: (): Promise<(Appointment & { visitor: Visitor, host: User })[]> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const enriched = appointments.map(appt => {
                const visitor = visitors.find(v => v.id === appt.visitorId);
                const host = users.find(u => u.id === appt.employeeId);
                return { ...appt, visitor: visitor!, host: host! };
            }).filter(a => a.visitor && a.host);
            resolve(enriched.sort((a,b) => b.scheduledTime.getTime() - a.scheduledTime.getTime()));
        }, 500);
     });
  },
  
  getVisitorById: (visitorId: string): Promise<Visitor | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(visitors.find(v => v.id === visitorId)), 200));
  },
  
  getUserById: (userId: string): Promise<User | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(users.find(u => u.id === userId)), 200));
  },

  getUsers: (): Promise<User[]> => {
    return new Promise(resolve => setTimeout(() => resolve(users), 200));
  },

  getAppointmentByPassId: (passId: string): Promise<{ appointment: Appointment; visitor: Visitor; host: User; } | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const visitor = visitors.find(v => v.passId === passId);
            if (!visitor) return resolve(undefined);

            const appointment = appointments.find(a => a.visitorId === visitor.id);
            if (!appointment) return resolve(undefined);

            const host = users.find(u => u.id === appointment.employeeId);
            if (!host) return resolve(undefined);

            resolve({ appointment, visitor, host });
        }, 400);
    });
  },

  checkInVisitor: (passId: string, securityId: string): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const appointment = appointments.find(a => visitors.find(v => v.passId === passId)?.id === a.visitorId);
            if (!appointment) {
                return resolve({ success: false, message: 'Invalid Pass ID.' });
            }
            if(appointment.status === VisitorStatus.CHECKED_IN) {
                return resolve({ success: false, message: 'Visitor is already checked in.' });
            }
            if(appointment.status === VisitorStatus.PENDING) {
                return resolve({ success: false, message: 'This appointment is still pending approval.' });
            }
            appointment.status = VisitorStatus.CHECKED_IN;
            const newLog: CheckLog = { id: `log${checkLogs.length + 1}`, passId, securityId, timestamp: new Date(), type: 'in' };
            checkLogs.push(newLog);
            resolve({ success: true, message: 'Visitor checked in successfully.' });
        }, 500);
    });
  },

  checkOutVisitor: (passId: string, securityId: string): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const appointment = appointments.find(a => visitors.find(v => v.passId === passId)?.id === a.visitorId);
            if (!appointment) {
                return resolve({ success: false, message: 'Invalid Pass ID.' });
            }
            if(appointment.status !== VisitorStatus.CHECKED_IN) {
                return resolve({ success: false, message: 'Visitor is not checked in.' });
            }
            appointment.status = VisitorStatus.CHECKED_OUT;
            const newLog: CheckLog = { id: `log${checkLogs.length + 1}`, passId, securityId, timestamp: new Date(), type: 'out' };
            checkLogs.push(newLog);
            resolve({ success: true, message: 'Visitor checked out successfully.' });
        }, 500);
    });
  },
  
  getDashboardStats: (): Promise<{ total: number, checkedIn: number, pending: number, checkedOutToday: number }> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const total = appointments.length;
            const checkedIn = appointments.filter(a => a.status === VisitorStatus.CHECKED_IN).length;
            const pending = appointments.filter(a => a.status === VisitorStatus.PENDING).length;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const checkedOutToday = checkLogs.filter(log => log.type === 'out' && log.timestamp >= today).length;
            resolve({ total, checkedIn, pending, checkedOutToday });
        }, 600);
    });
  },

  createAppointment: (data: {
    visitorName: string;
    visitorEmail: string;
    visitorCompany: string;
    purpose: string;
    scheduledTime: Date;
    employeeId: string;
  }): Promise<{ appointment: Appointment, visitor: Visitor }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newVisitorId = `vis${visitors.length + 1}`;
        const newVisitor: Visitor = {
          id: newVisitorId,
          name: data.visitorName,
          email: data.visitorEmail,
          company: data.visitorCompany,
          phone: 'N/A',
          photoUrl: `https://i.pravatar.cc/150?u=${newVisitorId}`,
          passId: `VPASS-100${visitors.length + 1}`,
        };
        visitors.push(newVisitor);

        const newAppointment: Appointment = {
          id: `appt${appointments.length + 1}`,
          visitorId: newVisitorId,
          employeeId: data.employeeId,
          purpose: data.purpose,
          scheduledTime: data.scheduledTime,
          status: VisitorStatus.PENDING,
        };
        appointments.push(newAppointment);
        resolve({ appointment: newAppointment, visitor: newVisitor });
      }, 500);
    });
  },

  updateAppointmentStatus: (appointmentId: string, status: VisitorStatus): Promise<{ success: boolean }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const apptIndex = appointments.findIndex(a => a.id === appointmentId);
        if (apptIndex > -1) {
          appointments[apptIndex].status = status;
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      }, 300);
    });
  },

  addStaff: (data: Omit<User, 'id' | 'avatarUrl'>): Promise<User> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newUser: User = {
          id: `user${users.length + 1}`,
          avatarUrl: `https://i.pravatar.cc/150?u=user${users.length + 1}`,
          ...data,
        };
        users.push(newUser);
        resolve(newUser);
      }, 400);
    });
  },

  updateStaff: (userId: string, data: Partial<Omit<User, 'id'>>): Promise<User | undefined> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
          users[userIndex] = { ...users[userIndex], ...data };
          resolve(users[userIndex]);
        } else {
          resolve(undefined);
        }
      }, 400);
    });
  },

  deleteStaff: (userId: string): Promise<{ success: boolean }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const initialLength = users.length;
        users = users.filter(u => u.id !== userId);
        resolve({ success: users.length < initialLength });
      }, 400);
    });
  },

  createWalkIn: (data: {
    visitorName: string;
    visitorPhone: string;
    visitorCompany: string;
    purpose: string;
    employeeId: string;
    photoUrl: string;
  }): Promise<{ appointment: Appointment, visitor: Visitor }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newVisitorId = `vis${visitors.length + 1}`;
        const newVisitor: Visitor = {
          id: newVisitorId,
          name: data.visitorName,
          email: 'walkin@vpass.com',
          company: data.visitorCompany,
          phone: data.visitorPhone,
          photoUrl: data.photoUrl,
          passId: `VPASS-100${visitors.length + 1}`,
        };
        visitors.push(newVisitor);

        const newAppointment: Appointment = {
          id: `appt${appointments.length + 1}`,
          visitorId: newVisitorId,
          employeeId: data.employeeId,
          purpose: data.purpose,
          scheduledTime: new Date(),
          status: VisitorStatus.APPROVED,
        };
        appointments.push(newAppointment);
        checkLogs.push({id: `log${checkLogs.length + 1}`, passId: newVisitor.passId, securityId: 'sec1', timestamp: new Date(), type: 'in'});
        newAppointment.status = VisitorStatus.CHECKED_IN;
        resolve({ appointment: newAppointment, visitor: newVisitor });
      }, 500);
    });
  },

};

export default api;