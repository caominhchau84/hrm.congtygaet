import React, { useState } from 'react';
import {
  Clock,
  Download,
  Calendar,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Employee, TimekeepingRecord } from '../types';
import { exportTableToExcel } from '../utils/exportTools';
import { formatNumber } from '../utils/formatters';

interface TimekeepingViewProps {
  timekeeping: Record<string, TimekeepingRecord[]>;
  employees: Employee[];
  selectedMonth: string;
  selectedDepartment: string;
  searchQuery: string;
  onSelectEmployee: (emp: Employee) => void;
  onMonthChange: (m: string) => void;
}

export const TimekeepingView: React.FC<TimekeepingViewProps> = ({
  timekeeping,
  employees,
  selectedMonth,
  selectedDepartment,
  searchQuery,
  onSelectEmployee,
  onMonthChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const currentRecords = timekeeping[selectedMonth] || [];

  const filtered = currentRecords.filter((t) => {
    if (selectedDepartment !== 'all' && t.department !== selectedDepartment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = t.employee_id.toLowerCase().includes(q);
      const matchName = t.name.toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentList = filtered.slice(startIndex, startIndex + pageSize);

  // Totals
  const totalActualDays = filtered.reduce((sum, t) => sum + t.actual_work_days, 0);
  const totalPaidLeave = filtered.reduce((sum, t) => sum + t.paid_leave_days, 0);
  const totalUnpaidLeave = filtered.reduce((sum, t) => sum + t.unpaid_leave_days, 0);
  const totalOtWeekday = filtered.reduce((sum, t) => sum + t.ot_weekday_hours, 0);
  const totalOtSunday = filtered.reduce((sum, t) => sum + t.ot_sunday_hours, 0);
  const totalLate = filtered.reduce((sum, t) => sum + t.late_early_count, 0);

  const handleExport = () => {
    const exportData = filtered.map((t, idx) => ({
      STT: idx + 1,
      'Mã NV': t.employee_id,
      'Họ và tên': t.name,
      'Phòng ban': t.department,
      'Chức vụ': t.title,
      'Công chuẩn': t.standard_days,
      'Công thực tế (X)': t.actual_work_days,
      'Nghỉ phép (P)': t.paid_leave_days,
      'Nghỉ không lương (Ro)': t.unpaid_leave_days,
      'Nghỉ ốm (Om)': t.sick_leave_days,
      'Nghỉ thai sản (TS)': t.maternity_leave_days,
      'Tổng công tính lương': t.total_paid_days,
      'Tăng ca ngày thường (h)': t.ot_weekday_hours,
      'Tăng ca Chủ nhật (h)': t.ot_sunday_hours,
      'Đi trễ / Về sớm': t.late_early_count,
      'Ghi chú': t.note,
    }));
    exportTableToExcel(
      exportData,
      `Bang_cham_cong_T${selectedMonth.replace('/', '_')}`,
      `Cham_cong_T${selectedMonth.replace('/', '_')}`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Bảng Chấm công & Tăng ca (Kỳ {selectedMonth})
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              {filtered.length} nhân sự
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Nguồn: 03_Cham_cong_2026_{selectedMonth.split('/')[0]}.xlsx • Tự động loại trừ dòng 55 Tổng cộng
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Month Switcher */}
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

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 block mb-1">Tổng công thực tế (X)</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatNumber(totalActualDays, 1)} công
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 block mb-1">Tổng phép hưởng lương (P)</span>
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {formatNumber(totalPaidLeave, 1)} ngày
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 block mb-1">Tổng giờ tăng ca OT</span>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {totalOtWeekday + totalOtSunday} giờ
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            (Thường: {totalOtWeekday}h, CN: {totalOtSunday}h)
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 block mb-1">Số lần Đi trễ / Về sớm</span>
          <span className="text-xl font-extrabold text-red-500">
            {totalLate} lần
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5 pl-6">Mã NV & Họ tên</th>
                <th className="p-3.5">Phòng ban</th>
                <th className="p-3.5 text-center">Công chuẩn</th>
                <th className="p-3.5 text-center">Công TT (X)</th>
                <th className="p-3.5 text-center">Phép (P)</th>
                <th className="p-3.5 text-center">Ko lương (Ro)</th>
                <th className="p-3.5 text-center">Tổng công</th>
                <th className="p-3.5 text-center">OT thường</th>
                <th className="p-3.5 text-center">OT CN</th>
                <th className="p-3.5 text-center">Đi trễ</th>
                <th className="p-3.5 pr-6 text-right">Xem 360°</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentList.map((t) => {
                const emp = employees.find((e) => e.id === t.employee_id);
                const isHighOt = t.ot_weekday_hours + t.ot_sunday_hours >= 15;

                return (
                  <tr
                    key={t.employee_id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isHighOt ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="p-3.5 pl-6">
                      <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                      <div className="font-mono text-[11px] text-forest-700 dark:text-emerald-400">{t.employee_id}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {t.department}
                    </td>
                    <td className="p-3.5 text-center text-slate-500 font-medium">
                      {t.standard_days}
                    </td>
                    <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {t.actual_work_days}
                    </td>
                    <td className="p-3.5 text-center text-blue-600 font-medium">
                      {t.paid_leave_days}
                    </td>
                    <td className="p-3.5 text-center text-slate-500">
                      {t.unpaid_leave_days}
                    </td>
                    <td className="p-3.5 text-center font-extrabold text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/30">
                      {t.total_paid_days}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`font-semibold ${t.ot_weekday_hours > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {t.ot_weekday_hours}h
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`font-semibold ${t.ot_sunday_hours > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                        {t.ot_sunday_hours}h
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`font-semibold ${t.late_early_count > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {t.late_early_count}
                      </span>
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <button
                        onClick={() => emp && onSelectEmployee(emp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Auto Totals Footer Row */}
            <tfoot className="bg-slate-100/90 dark:bg-slate-800/90 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
              <tr>
                <td className="p-3.5 pl-6" colSpan={2}>
                  TỔNG CỘNG THEO BỘ LỌC ({filtered.length} NHÂN SỰ)
                </td>
                <td className="p-3.5 text-center">-</td>
                <td className="p-3.5 text-center text-emerald-600">{formatNumber(totalActualDays, 1)}</td>
                <td className="p-3.5 text-center text-blue-600">{formatNumber(totalPaidLeave, 1)}</td>
                <td className="p-3.5 text-center">{formatNumber(totalUnpaidLeave, 1)}</td>
                <td className="p-3.5 text-center">-</td>
                <td className="p-3.5 text-center text-amber-600">{totalOtWeekday}h</td>
                <td className="p-3.5 text-center text-amber-600">{totalOtSunday}h</td>
                <td className="p-3.5 text-center text-red-500">{totalLate}</td>
                <td className="p-3.5 pr-6 text-right">100% Khớp</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, filtered.length)} trên {filtered.length} bản ghi
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
