
export enum UserRole {
  ADMIN = 'Admin',
  SECURITY = 'Security',
  EMPLOYEE = 'Employee',
  VISITOR = 'Visitor',
}

export enum VisitorStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  CHECKED_IN = 'Checked-In',
  CHECKED_OUT = 'Checked-Out',
  REJECTED = 'Rejected',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  photoUrl: string;
  passId: string;
}

export interface Appointment {
  id: string;
  visitorId: string;
  employeeId: string;
  purpose: string;
  scheduledTime: Date;
  status: VisitorStatus;
}

export interface CheckLog {
  id: string;
  passId: string;
  timestamp: Date;
  type: 'in' | 'out';
  securityId: string;
}
