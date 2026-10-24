import React, { useState } from 'react';
import {
  Users,
  Search,
  Download,
  Eye,
  Building2,
  Phone,
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Employee } from '../types';
import { exportTableToExcel } from '../utils/exportTools';
import { formatDateVN } from '../utils/formatters';

interface EmployeesViewProps {
  employees: Employee[];
  selectedDepartment: string;
  selectedStatus: string;
  searchQuery: string;
  onSelectEmployee: (emp: Employee) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  selectedDepartment,
  selectedStatus,
  searchQuery,
  onSelectEmployee,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter
  const filtered = employees.filter((emp) => {
    if (selectedDepartment !== 'all' && emp.department !== selectedDepartment) return false;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'Đang làm việc' && emp.status !== 'Đang làm việc') return false;
      if (selectedStatus === 'Thử việc' && emp.status !== 'Thử việc') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = emp.id.toLowerCase().includes(q);
      const matchName = emp.name.toLowerCase().includes(q);
      const matchCccd = emp.id_card.includes(q);
      if (!matchId && !matchName && !matchCccd) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentList = filtered.slice(startIndex, startIndex + pageSize);

  const handleExport = () => {
    const exportData = filtered.map((e, idx) => ({
      STT: idx + 1,
      'Mã NV': e.id,
      'Họ và tên': e.name,
      'Giới tính': e.gender,
      'Ngày sinh': e.dob,
      'Số CCCD': e.id_card,
      'Phòng ban': e.department,
      'Chức vụ': e.title,
      'Trình độ': e.education,
      'Ngày vào làm': e.start_date,
      'Email công việc': e.email,
      'Số điện thoại': e.phone,
      'Số tài khoản': e.bank_account,
      'Ngân hàng': e.bank_name,
      'Mã số BHXH': e.social_insurance_code,
      'Người phụ thuộc': e.dependents,
      'Trạng thái': e.status,
    }));
    exportTableToExcel(exportData, `Danh_sach_nhan_vien_${new Date().toISOString().slice(0, 10)}`, 'Ho_so_nhan_vien');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Danh sách nhân viên & Hồ sơ 360°
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-emerald-400">
              {filtered.length} / {employees.length} nhân sự
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bấm vào bất kỳ nhân viên nào để mở Drawer trượt 360° (Cá nhân, Hợp đồng, Lương, Phép, Chấm công)
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-forest-700 hover:bg-forest-800 flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Xuất file Excel (.xlsx)
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5 pl-6">Mã NV</th>
                <th className="p-3.5">Họ và tên</th>
                <th className="p-3.5">Phòng ban</th>
                <th className="p-3.5">Chức vụ / Chức danh</th>
                <th className="p-3.5">Số CCCD</th>
                <th className="p-3.5">Liên hệ</th>
                <th className="p-3.5">Ngày vào</th>
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentList.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="p-3.5 pl-6 font-mono font-bold text-forest-700 dark:text-emerald-400">
                    {emp.id}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {emp.name}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {emp.department}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {emp.title}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">
                    {emp.id_card}
                  </td>
                  <td className="p-3.5">
                    <div className="text-[11px] space-y-0.5">
                      <div className="text-slate-900 dark:text-slate-200">{emp.phone}</div>
                      <div className="text-slate-400">{emp.email}</div>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {formatDateVN(emp.start_date)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'Đang làm việc'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmployee(emp);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-600 hover:text-white hover:bg-amber-500 transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Hồ sơ 360°
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, filtered.length)} trên tổng số {filtered.length} nhân viên
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
