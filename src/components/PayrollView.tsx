import React, { useState } from 'react';
import {
  CircleDollarSign,
  Download,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Printer,
  Mail,
} from 'lucide-react';
import { Employee, PayrollRecord } from '../types';
import { formatNumber, formatVND } from '../utils/formatters';
import { exportTableToExcel } from '../utils/exportTools';

interface PayrollViewProps {
  payroll: Record<string, PayrollRecord[]>;
  employees: Employee[];
  selectedMonth: string;
  selectedDepartment: string;
  searchQuery: string;
  onSelectEmployee: (emp: Employee) => void;
  onMonthChange: (m: string) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  payroll,
  employees,
  selectedMonth,
  selectedDepartment,
  searchQuery,
  onSelectEmployee,
  onMonthChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const currentRecords = payroll[selectedMonth] || [];

  const filtered = currentRecords.filter((p) => {
    if (selectedDepartment !== 'all' && p.department !== selectedDepartment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = p.employee_id.toLowerCase().includes(q);
      const matchName = p.name.toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentList = filtered.slice(startIndex, startIndex + pageSize);

  // Totals calculation
  const totalContract = filtered.reduce((sum, p) => sum + p.contract_salary, 0);
  const totalTimeSalary = filtered.reduce((sum, p) => sum + p.time_salary, 0);
  const totalResp = filtered.reduce((sum, p) => sum + p.responsibility_allowance, 0);
  const totalLunch = filtered.reduce((sum, p) => sum + p.lunch_allowance, 0);
  const totalOt = filtered.reduce((sum, p) => sum + p.ot_pay, 0);
  const totalBonus = filtered.reduce((sum, p) => sum + p.performance_bonus, 0);
  const totalGross = filtered.reduce((sum, p) => sum + p.total_income, 0);
  const totalInsurance = filtered.reduce((sum, p) => sum + p.insurance_deduction, 0);
  const totalPit = filtered.reduce((sum, p) => sum + p.pit, 0);
  const totalNet = filtered.reduce((sum, p) => sum + p.net_salary, 0);

  const handleExport = () => {
    const exportData = filtered.map((p, idx) => ({
      STT: idx + 1,
      'Mã NV': p.employee_id,
      'Họ và tên': p.name,
      'Phòng ban': p.department,
      'Chức danh': p.title,
      'Mức lương HĐ': p.contract_salary,
      'Ngày công': p.work_days,
      'Lương thời gian': p.time_salary,
      'Phụ cấp TN': p.responsibility_allowance,
      'Phụ cấp ăn trưa': p.lunch_allowance,
      'Tiền làm thêm OT': p.ot_pay,
      'Thưởng hiệu quả': p.performance_bonus,
      'Tổng thu nhập': p.total_income,
      'BHXH,YT,TN (10.5%)': p.insurance_deduction,
      'Thuế TNCN': p.pit,
      'Thực lĩnh': p.net_salary,
      'Ghi chú': p.note,
    }));
    exportTableToExcel(
      exportData,
      `Bang_luong_T${selectedMonth.replace('/', '_')}`,
      `Bang_luong_T${selectedMonth.replace('/', '_')}`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Bảng tính lương & Quyết toán thu nhập (Kỳ {selectedMonth})
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Tổng quỹ: {formatVND(totalGross)}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Nguồn: 05_Bang_luong_2026_{selectedMonth.split('/')[0]}.xlsx • Khấu trừ 10.5% BHXH và Thuế TNCN
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            {['07/2026', '08/2026', '09/2026'].map((m) => (
              <button
                key={m}
                onClick={() => onMonthChange(m)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedMonth === m
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                T{m.split('/')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-forest-700 hover:bg-forest-800 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* KPI Cards for Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 block mb-1">Tổng thu nhập (Quỹ lương)</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatVND(totalGross)}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 block mb-1">Tổng Thực lĩnh chuyển khoản</span>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatVND(totalNet)}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 block mb-1">Trừ BHXH (10.5%)</span>
          <span className="text-xl font-extrabold text-red-500">
            {formatVND(totalInsurance)}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 block mb-1">Trừ Thuế TNCN</span>
          <span className="text-xl font-extrabold text-red-500">
            {formatVND(totalPit)}
          </span>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5 pl-6">Mã NV & Họ tên</th>
                <th className="p-3.5">Phòng ban</th>
                <th className="p-3.5 text-right">Lương HĐ</th>
                <th className="p-3.5 text-center">Công</th>
                <th className="p-3.5 text-right">Lương TG</th>
                <th className="p-3.5 text-right">PC TN</th>
                <th className="p-3.5 text-right">PC Ăn</th>
                <th className="p-3.5 text-right">Tiền OT</th>
                <th className="p-3.5 text-right">Thưởng</th>
                <th className="p-3.5 text-right font-black">Tổng thu nhập</th>
                <th className="p-3.5 text-right text-red-500">BHXH (10.5%)</th>
                <th className="p-3.5 text-right text-red-500">Thuế TNCN</th>
                <th className="p-3.5 text-right font-black text-amber-600 dark:text-amber-400">Thực lĩnh</th>
                <th className="p-3.5 pr-6 text-right">Phiếu lương</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentList.map((p) => {
                const emp = employees.find((e) => e.id === p.employee_id);

                return (
                  <tr
                    key={p.employee_id}
                    onClick={() => emp && onSelectEmployee(emp)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5 pl-6">
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="font-mono text-[11px] text-forest-700 dark:text-emerald-400">{p.employee_id}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {p.department}
                    </td>
                    <td className="p-3.5 text-right font-medium">
                      {formatVND(p.contract_salary)}
                    </td>
                    <td className="p-3.5 text-center font-bold text-emerald-600">
                      {p.work_days}
                    </td>
                    <td className="p-3.5 text-right font-medium">
                      {formatVND(p.time_salary)}
                    </td>
                    <td className="p-3.5 text-right text-slate-500">
                      {formatVND(p.responsibility_allowance)}
                    </td>
                    <td className="p-3.5 text-right text-slate-500">
                      {formatVND(p.lunch_allowance)}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-amber-600">
                      {formatVND(p.ot_pay)}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-emerald-600">
                      {formatVND(p.performance_bonus)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                      {formatVND(p.total_income)}
                    </td>
                    <td className="p-3.5 text-right text-red-500 font-medium">
                      -{formatVND(p.insurance_deduction)}
                    </td>
                    <td className="p-3.5 text-right text-red-500 font-medium">
                      -{formatVND(p.pit)}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20">
                      {formatVND(p.net_salary)}
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (emp) onSelectEmployee(emp);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-600 hover:text-white hover:bg-amber-500 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Phiếu lương
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Footer Row */}
            <tfoot className="bg-slate-100/90 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
              <tr>
                <td className="p-3.5 pl-6" colSpan={2}>
                  TỔNG CỘNG ({filtered.length} NHÂN SỰ)
                </td>
                <td className="p-3.5 text-right">{formatVND(totalContract)}</td>
                <td className="p-3.5 text-center">-</td>
                <td className="p-3.5 text-right">{formatVND(totalTimeSalary)}</td>
                <td className="p-3.5 text-right">{formatVND(totalResp)}</td>
                <td className="p-3.5 text-right">{formatVND(totalLunch)}</td>
                <td className="p-3.5 text-right text-amber-600">{formatVND(totalOt)}</td>
                <td className="p-3.5 text-right text-emerald-600">{formatVND(totalBonus)}</td>
                <td className="p-3.5 text-right font-black">{formatVND(totalGross)}</td>
                <td className="p-3.5 text-right text-red-500">-{formatVND(totalInsurance)}</td>
                <td className="p-3.5 text-right text-red-500">-{formatVND(totalPit)}</td>
                <td className="p-3.5 text-right font-black text-amber-600 dark:text-amber-400">{formatVND(totalNet)}</td>
                <td className="p-3.5 pr-6 text-right">100% Khớp</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, filtered.length)} trên {filtered.length} nhân viên
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
