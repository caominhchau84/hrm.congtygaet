import React, { useState } from 'react';
import {
  X,
  User,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  Printer,
  Download,
  Mail,
  CalendarPlus,
  Building,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Contract, Employee, LeaveBalance, LeaveRequest, PayrollRecord, TimekeepingRecord } from '../types';
import { formatDateVN, formatNumber, formatVND } from '../utils/formatters';
import {
  createGmailComposeUrl,
  createGoogleCalendarUrl,
  exportPayslipToWord,
  exportProbationEvaluationToWord,
  copyTextToClipboard,
} from '../utils/exportTools';

interface EmployeeDrawer360Props {
  employee: Employee | null;
  contract: Contract | null;
  payrollRecords: PayrollRecord[];
  timekeepingRecords: TimekeepingRecord[];
  leaveRequests: LeaveRequest[];
  leaveBalance: LeaveBalance | null;
  selectedMonth: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeDrawer360: React.FC<EmployeeDrawer360Props> = ({
  employee,
  contract,
  payrollRecords,
  timekeepingRecords,
  leaveRequests,
  leaveBalance,
  selectedMonth,
  isOpen,
  onClose,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'contract' | 'payroll' | 'leaves' | 'timekeeping'>('profile');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !employee) return null;

  // Find payroll for selected month
  const currentPay = payrollRecords.find((p) => p.month === selectedMonth) || payrollRecords[payrollRecords.length - 1];
  const currentTk = timekeepingRecords.find((t) => t.month === selectedMonth) || timekeepingRecords[timekeepingRecords.length - 1];

  const handleCopyProfile = async () => {
    const text = `
THÔNG TIN NHÂN SỰ 360° - ${employee.id} - ${employee.name}
- Phòng ban: ${employee.department} | Chức danh: ${employee.title}
- Ngày sinh: ${formatDateVN(employee.dob)} | Giới tính: ${employee.gender} | CCCD: ${employee.id_card}
- Hợp đồng: ${contract?.contract_type || 'N/A'} (Hạn: ${contract?.expiration_date ? formatDateVN(contract.expiration_date) : 'Không xác định'})
- Lương hợp đồng: ${formatVND(contract?.insurance_salary || currentPay?.contract_salary)}
- Thực lĩnh (${currentPay?.month || selectedMonth}): ${formatVND(currentPay?.net_salary)}
- Phép năm còn lại: ${leaveBalance?.remaining_days ?? 12} ngày
    `.trim();

    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateCalendarReminder = () => {
    if (!contract || !contract.expiration_date) return;
    const url = createGoogleCalendarUrl(
      `[Nhắc nhở Tái ký HĐLĐ] ${employee.id} - ${employee.name}`,
      `Nhắc nhở Phòng HCNS liên hệ tái ký hoặc đánh giá Hợp đồng lao động cho nhân sự ${employee.name} (${employee.title} - ${employee.department}). Hết hạn HĐ ngày ${contract.expiration_date}.`,
      contract.expiration_date
    );
    window.open(url, '_blank');
  };

  const handleSendGmailPayslip = () => {
    if (!currentPay) return;
    const subject = `[CÔNG TY A] Phiếu lương tháng ${currentPay.month} - ${employee.name} (${employee.id})`;
    const body = `
Kính gửi Anh/Chị ${employee.name},

Phòng Hành chính - Nhân sự Công ty A xin gửi Anh/Chị chi tiết phiếu lương kỳ ${currentPay.month} như sau:

- Mã nhân viên: ${employee.id}
- Chức danh: ${employee.title} - ${employee.department}
- Số ngày công tính lương: ${currentPay.work_days} công
- Lương hợp đồng: ${formatVND(currentPay.contract_salary)}
- Lương thời gian: ${formatVND(currentPay.time_salary)}
- Phụ cấp trách nhiệm: ${formatVND(currentPay.responsibility_allowance)}
- Phụ cấp ăn trưa: ${formatVND(currentPay.lunch_allowance)}
- Tiền làm thêm giờ (OT): ${formatVND(currentPay.ot_pay)}
- Thưởng hiệu quả: ${formatVND(currentPay.performance_bonus)}
-----------------------------------------------
TỔNG THU NHẬP: ${formatVND(currentPay.total_income)}
- Trừ BHXH/BHYT/BHTN (10.5%): -${formatVND(currentPay.insurance_deduction)}
- Trừ Thuế TNCN: -${formatVND(currentPay.pit)}
-----------------------------------------------
THỰC LĨNH CHUYỂN KHOẢN: ${formatVND(currentPay.net_salary)}
Số tài khoản: ${employee.bank_account} (${employee.bank_name})

Mọi thắc mắc vui lòng phản hồi về Phòng HCNS trước ngày 05 hàng tháng.
Trân trọng cảm ơn Anh/Chị đã luôn đồng hành cùng Công ty A!
    `.trim();

    const url = createGmailComposeUrl(employee.email || `${employee.id.toLowerCase()}@congtya.vn`, subject, body);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left">
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-forest-800 to-forest-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-lg flex items-center justify-center">
              {employee.name.split(' ').slice(-1)[0][0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {employee.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                  {employee.id}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {employee.title} • {employee.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyProfile}
              title="Sao chép nhanh hồ sơ 360°"
              className="p-2 text-slate-300 hover:text-white hover:bg-forest-600/60 rounded-xl transition-colors text-xs flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              {copied && <span className="text-[10px] text-emerald-400">Đã chép!</span>}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-forest-600/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Tabs Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 overflow-x-auto">
          {[
            { id: 'profile', label: '1. Cá nhân', icon: User, source: '01_Ho_so_nhan_vien.xlsx' },
            { id: 'contract', label: '2. Hợp đồng', icon: FileText, source: '02_Hop_dong.xlsx' },
            { id: 'payroll', label: '3. Phiếu lương', icon: DollarSign, source: '05_Bang_luong_...xlsx' },
            { id: 'leaves', label: '4. Nghỉ phép', icon: Calendar, source: '04_Nghi_phep_2026.xlsx' },
            { id: 'timekeeping', label: '5. Chấm công', icon: Clock, source: '03_Cham_cong_...xlsx' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: PROFILE */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              {/* Reference Banner */}
              <div className="p-3 rounded-2xl bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-900/60 flex items-center justify-between text-xs text-forest-800 dark:text-emerald-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Nguồn dữ liệu tham chiếu: File 01_Ho_so_nhan_vien.xlsx (Sheet Ho_so_nhan_vien)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[10px] font-bold">
                  Khóa chính: {employee.id}
                </span>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Mã nhân viên</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee.id}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Họ và tên</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee.name}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Giới tính</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee.gender}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Ngày sinh</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDateVN(employee.dob)}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Số CCCD</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{employee.id_card}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Quê quán</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee.hometown}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Trình độ chuyên môn</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee.education}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Ngày vào làm việc</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDateVN(employee.start_date)}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Email công việc</span>
                  <a href={`mailto:${employee.email}`} className="font-bold text-amber-600 dark:text-amber-400 hover:underline">
                    {employee.email}
                  </a>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Số điện thoại</span>
                  <a href={`tel:${employee.phone}`} className="font-bold text-slate-900 dark:text-white">
                    {employee.phone}
                  </a>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Tài khoản Ngân hàng</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {employee.bank_account} ({employee.bank_name})
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Mã số BHXH</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{employee.social_insurance_code}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Số người phụ thuộc (Giảm trừ TNCN)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee.dependents} người</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Trạng thái nhân sự</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    employee.status === 'Đang làm việc' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTRACT */}
          {activeSubTab === 'contract' && (
            <div className="space-y-6">
              <div className="p-3 rounded-2xl bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-900/60 flex items-center justify-between text-xs text-forest-800 dark:text-emerald-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Nguồn dữ liệu: 02_Hop_dong.xlsx (Sheet Hop_dong_lao_dong)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[10px] font-bold">
                  Số HĐ: {contract?.contract_number || 'N/A'}
                </span>
              </div>

              {contract ? (
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 block">Số hiệu Hợp đồng</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {contract.contract_number}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      contract.status === 'Sắp hết hạn'
                        ? 'bg-red-500 text-white animate-pulse'
                        : contract.status === 'Đang hiệu lực'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {contract.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block mb-1">Loại hợp đồng</span>
                      <span className="font-bold text-slate-900 dark:text-white">{contract.contract_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Địa điểm làm việc</span>
                      <span className="font-bold text-slate-900 dark:text-white">{contract.workplace}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Ngày ký HĐ</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatDateVN(contract.sign_date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Ngày hiệu lực</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatDateVN(contract.effective_date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Ngày hết hạn</span>
                      <span className={`font-bold ${contract.status === 'Sắp hết hạn' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {contract.expiration_date ? formatDateVN(contract.expiration_date) : 'Không xác định thời hạn'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Lương đóng BHXH</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                        {formatVND(contract.insurance_salary)}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Contract */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                    {contract.expiration_date && (
                      <button
                        onClick={handleCreateCalendarReminder}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        📅 Tạo lịch nhắc tái ký Google Calendar
                      </button>
                    )}

                    {contract.contract_type === 'HĐ Thử việc' && (
                      <button
                        onClick={() => exportProbationEvaluationToWord(employee, contract)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-forest-700 hover:bg-forest-800 flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Xuất Tờ trình đánh giá thử việc (.docx)
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không tìm thấy thông tin hợp đồng của nhân sự này.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYROLL & PAYSLIP PREVIEW */}
          {activeSubTab === 'payroll' && (
            <div className="space-y-6">
              <div className="p-3 rounded-2xl bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-900/60 flex items-center justify-between text-xs text-forest-800 dark:text-emerald-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Nguồn dữ liệu: 05_Bang_luong_2026_{selectedMonth.split('/')[0]}.xlsx
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[10px] font-bold">
                  Kỳ lương: {selectedMonth}
                </span>
              </div>

              {currentPay ? (
                <div>
                  {/* Action Bar for Payslip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Khung xem trước Phiếu lương (A4/A5 Standard)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportPayslipToWord(employee, currentPay)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-forest-700 hover:bg-forest-800 flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Xuất Word (.docx)
                      </button>
                      <button
                        onClick={handlePrint}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        In / PDF
                      </button>
                      <button
                        onClick={handleSendGmailPayslip}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center gap-1.5 shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        ✉️ Gửi qua Gmail
                      </button>
                    </div>
                  </div>

                  {/* Standard Payslip Card (A4/A5 Preview) */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-4 print:border-none print:shadow-none">
                    <div className="text-center border-b pb-4 border-slate-200 dark:border-slate-800">
                      <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">
                        CÔNG TY A
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Tầng 12, Keangnam Landmark 72, Nam Từ Liêm, Hà Nội
                      </p>
                      <h3 className="text-base font-black text-forest-800 dark:text-emerald-400 mt-2 uppercase">
                        PHIẾU LƯƠNG NHÂN VIÊN - KỲ {currentPay.month}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl">
                      <div>Mã NV: <span className="font-bold">{employee.id}</span></div>
                      <div>Họ và tên: <span className="font-bold">{employee.name}</span></div>
                      <div>Phòng ban: <span className="font-bold">{employee.department}</span></div>
                      <div>Chức vụ: <span className="font-bold">{employee.title}</span></div>
                      <div>Số công chuẩn: <span className="font-bold">26 ngày</span></div>
                      <div>Công thực tế: <span className="font-bold text-emerald-600">{currentPay.work_days} công</span></div>
                      <div>Số tài khoản: <span className="font-bold">{employee.bank_account} ({employee.bank_name})</span></div>
                      <div>Mã số BHXH: <span className="font-bold">{employee.social_insurance_code}</span></div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                          <tr>
                            <th className="p-2.5">Khoản mục thu nhập & Khấu trừ</th>
                            <th className="p-2.5 text-right">Số tiền (VNĐ)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          <tr>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">1. Lương hợp đồng (Lương đóng BH)</td>
                            <td className="p-2.5 text-right font-medium">{formatVND(currentPay.contract_salary)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">2. Lương thời gian thực tế ({currentPay.work_days} công)</td>
                            <td className="p-2.5 text-right font-medium">{formatVND(currentPay.time_salary)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">3. Phụ cấp trách nhiệm</td>
                            <td className="p-2.5 text-right font-medium">{formatVND(currentPay.responsibility_allowance)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">4. Phụ cấp ăn trưa</td>
                            <td className="p-2.5 text-right font-medium">{formatVND(currentPay.lunch_allowance)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">5. Tiền làm thêm giờ (OT)</td>
                            <td className="p-2.5 text-right font-medium text-amber-600">{formatVND(currentPay.ot_pay)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">6. Thưởng hiệu quả</td>
                            <td className="p-2.5 text-right font-medium text-emerald-600">{formatVND(currentPay.performance_bonus)}</td>
                          </tr>
                          <tr className="bg-slate-50 dark:bg-slate-900/60 font-bold">
                            <td className="p-2.5 text-slate-900 dark:text-white">TỔNG THU NHẬP (A)</td>
                            <td className="p-2.5 text-right text-slate-900 dark:text-white">{formatVND(currentPay.total_income)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-red-500">7. Khấu trừ BHXH, BHYT, BHTN (10.5%)</td>
                            <td className="p-2.5 text-right font-medium text-red-500">-{formatVND(currentPay.insurance_deduction)}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-red-500">8. Khấu trừ Thuế TNCN (Người PT: {employee.dependents})</td>
                            <td className="p-2.5 text-right font-medium text-red-500">-{formatVND(currentPay.pit)}</td>
                          </tr>
                          <tr className="bg-amber-50 dark:bg-amber-950/40 font-black text-amber-800 dark:text-amber-300 text-sm">
                            <td className="p-3">THỰC LĨNH CHUYỂN KHOẢN (B = A - Trừ)</td>
                            <td className="p-3 text-right text-base text-amber-600 dark:text-amber-400">{formatVND(currentPay.net_salary)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3">
                      <span>Người lập biểu: Phòng Kế toán - Tiền lương</span>
                      <span>Ngày in: {new Date().toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không có dữ liệu lương kỳ này.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LEAVE REQUESTS & BALANCE */}
          {activeSubTab === 'leaves' && (
            <div className="space-y-6">
              <div className="p-3 rounded-2xl bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-900/60 flex items-center justify-between text-xs text-forest-800 dark:text-emerald-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Nguồn dữ liệu: 04_Nghi_phep_2026.xlsx (Sheet Quy_phep_nam & Theo_doi_don_nghi)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[10px] font-bold">
                  Quỹ phép 2026
                </span>
              </div>

              {/* Leave Balance Cards */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Tiêu chuẩn</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {leaveBalance?.entitled_days ?? 12}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Thâm niên</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    +{leaveBalance?.seniority_days ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 block mb-1">Đã nghỉ</span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {leaveBalance?.used_days ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block mb-1">Còn lại</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {leaveBalance?.remaining_days ?? 12}
                  </span>
                </div>
              </div>

              {/* Leave Requests Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Lịch sử & Đơn xin nghỉ phép 2026
                </h4>
                {leaveRequests.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="p-2.5">Mã đơn</th>
                          <th className="p-2.5">Loại nghỉ</th>
                          <th className="p-2.5">Thời gian</th>
                          <th className="p-2.5">Lý do</th>
                          <th className="p-2.5 text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {leaveRequests.map((req) => (
                          <tr key={req.id}>
                            <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">{req.id}</td>
                            <td className="p-2.5">{req.leave_type}</td>
                            <td className="p-2.5">{formatDateVN(req.from_date)} ({req.days} ngày)</td>
                            <td className="p-2.5 text-slate-500 max-w-[150px] truncate">{req.reason}</td>
                            <td className="p-2.5 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                req.status === 'Chờ duyệt'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Chưa có đơn nghỉ phép nào phát sinh trong năm 2026.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TIMEKEEPING & OT */}
          {activeSubTab === 'timekeeping' && (
            <div className="space-y-6">
              <div className="p-3 rounded-2xl bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-900/60 flex items-center justify-between text-xs text-forest-800 dark:text-emerald-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Nguồn dữ liệu: 03_Cham_cong_2026_{selectedMonth.split('/')[0]}.xlsx
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[10px] font-bold">
                  Kỳ công: {selectedMonth}
                </span>
              </div>

              {currentTk ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">Công chuẩn tháng</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {currentTk.standard_days} ngày
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                    <span className="text-emerald-700 dark:text-emerald-300 block mb-1">Công làm thực tế (X)</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {currentTk.actual_work_days} công
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                    <span className="text-blue-700 dark:text-blue-300 block mb-1">Nghỉ phép hưởng lương (P)</span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                      {currentTk.paid_leave_days} ngày
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                    <span className="text-amber-700 dark:text-amber-300 block mb-1">Tăng ca ngày thường</span>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {currentTk.ot_weekday_hours} giờ
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                    <span className="text-amber-700 dark:text-amber-300 block mb-1">Tăng ca Chủ nhật</span>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {currentTk.ot_sunday_hours} giờ
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
                    <span className="text-red-700 dark:text-red-300 block mb-1">Đi trễ / Về sớm</span>
                    <span className="text-base font-bold text-red-600 dark:text-red-400">
                      {currentTk.late_early_count} lần
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không có dữ liệu chấm công kỳ này.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
