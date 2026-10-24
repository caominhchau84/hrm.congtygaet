export interface Department {
  code: string;
  name: string;
  description: string;
  quota: number;
  manager: string;
}

export interface Role {
  code: string;
  title: string;
  department: string;
  level: string;
  allowance: number;
}

export interface LeaveType {
  code: string;
  name: string;
  symbol: string;
  paid: boolean;
  payer: string;
  description: string;
}

export interface GeneralRule {
  code: string;
  name: string;
  value: string;
  unit: string;
  description: string;
}

export interface Employee {
  id: string; // TP0001
  name: string;
  gender: string;
  dob: string;
  id_card: string;
  hometown: string;
  department: string;
  title: string;
  education: string;
  start_date: string;
  email: string;
  phone: string;
  bank_account: string;
  bank_name: string;
  social_insurance_code: string;
  dependents: number;
  status: string; // 'Đang làm việc', 'Thử việc', 'Đã nghỉ việc'
}

export interface Contract {
  contract_number: string;
  employee_id: string;
  name: string;
  department: string;
  title: string;
  contract_type: string; // 'HĐLĐ không xác định thời hạn', 'HĐLĐ xác định thời hạn (01 năm)', 'HĐ Thử việc'
  sign_date: string;
  effective_date: string;
  expiration_date: string;
  insurance_salary: number;
  workplace: string;
  status: string; // 'Đang hiệu lực', 'Sắp hết hạn', 'Đã thanh lý'
}

export interface TimekeepingRecord {
  month: string; // '07/2026', '08/2026', '09/2026'
  employee_id: string;
  name: string;
  department: string;
  title: string;
  standard_days: number;
  actual_work_days: number;
  paid_leave_days: number;
  unpaid_leave_days: number;
  sick_leave_days: number;
  maternity_leave_days: number;
  total_paid_days: number;
  ot_weekday_hours: number;
  ot_sunday_hours: number;
  late_early_count: number;
  note: string;
}

export interface LeaveRequest {
  id: string; // NP-2026-0012
  employee_id: string;
  name: string;
  department: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  days: number;
  reason: string;
  approver: string;
  status: 'Đã duyệt' | 'Chờ duyệt' | 'Từ chối' | string;
}

export interface LeaveBalance {
  employee_id: string;
  name: string;
  department: string;
  entitled_days: number;
  seniority_days: number;
  used_days: number;
  remaining_days: number;
  usage_rate: string;
  status: string;
}

export interface PayrollRecord {
  month: string;
  employee_id: string;
  name: string;
  department: string;
  title: string;
  contract_salary: number;
  work_days: number;
  time_salary: number;
  responsibility_allowance: number;
  lunch_allowance: number;
  ot_pay: number;
  performance_bonus: number;
  total_income: number;
  insurance_deduction: number; // 10.5%
  pit: number; // Thuế TNCN
  net_salary: number; // Thực lĩnh
  note: string;
}

export interface CompanyInfo {
  name: string;
  short_name: string;
  address: string;
  tax_code: string;
  phone: string;
  email: string;
  website: string;
}

export interface SystemData {
  company: CompanyInfo;
  departments: Department[];
  roles: Role[];
  leave_types: LeaveType[];
  general_rules: GeneralRule[];
  employees: Employee[];
  contracts: Contract[];
  timekeeping: Record<string, TimekeepingRecord[]>;
  leave_requests: LeaveRequest[];
  leave_balances: LeaveBalance[];
  payroll: Record<string, PayrollRecord[]>;
}

export type AlertSeverity = 'red' | 'yellow' | 'green';

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  type: 'contract_expiring' | 'probation_ending' | 'leave_pending' | 'probation_ongoing' | 'active_stable';
  title: string;
  subtitle: string;
  employee_id?: string;
  employee_name?: string;
  department?: string;
  days_left?: number;
  date?: string;
  badge_text: string;
  action_label?: string;
  action_type?: 'review_contract' | 'eval_probation' | 'approve_leave' | 'view_profile';
  source_file: string;
}

export interface AIAnalysisResult {
  summary: string;
  highlights: string[];
  ot_anomalies: {
    employee_id: string;
    name: string;
    department: string;
    ot_hours: number;
    ot_pay: number;
    risk_level: string;
    note: string;
  }[];
  recommendations: string[];
  generated_at: string;
  model_used: string;
}
