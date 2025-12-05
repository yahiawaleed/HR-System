export interface User {
  id: string;
  email: string;
  role: string;
  employeeId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: string;
  employeeId?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Employee {
  _id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  hireDate: string;
  employmentType: string;
  status: string;
  departmentId?: {
    _id: string;
    name: string;
    code: string;
  };
  positionId?: {
    _id: string;
    title: string;
    code: string;
  };
  managerId?: Employee;
  payGradeId?: string;
}

export interface Department {
  _id: string;
  code: string;
  name: string;
  description?: string;
  parentDepartmentId?: Department;
  headId?: Employee;
  isActive: boolean;
}

export interface Position {
  _id: string;
  code: string;
  title: string;
  description?: string;
  departmentId: Department;
  reportsToPositionId?: Position;
  payGradeId?: string;
  isActive: boolean;
}

export interface Payslip {
  _id: string;
  payrollId: string;
  employeeId: Employee;
  periodStart: string;
  periodEnd: string;
  grossPay: number;
  netPay: number;
  baseSalary?: number;
  overtimePay?: number;
  bonusPay?: number;
  deductions?: Array<{ label: string; amount: number }>;
  finalized: boolean;
}

export interface Claim {
  _id: string;
  employeeId: Employee;
  type: string;
  amount: number;
  currency: string;
  description?: string;
  status: string;
  submittedAt: string;
}

export interface Dispute {
  _id: string;
  employeeId: Employee;
  reason: string;
  status: string;
  createdAt: string;
}

