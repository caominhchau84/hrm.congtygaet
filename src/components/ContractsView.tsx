import React, { useState } from 'react';
import {
  FileText,
  Download,
  CalendarPlus,
  Eye,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Contract, Employee } from '../types';
import { formatDateVN, formatVND } from '../utils/formatters';
import { createGoogleCalendarUrl, exportTableToExcel } from '../utils/exportTools';

interface ContractsViewProps {
  contracts: Contract[];
  employees: Employee[];
  selectedDepartment: string;
  selectedStatus: string;
  searchQuery: string;
  onSelectEmployee: (emp: Employee) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts,
  employees,
  selectedDepartment,
  selectedStatus,
  searchQuery,
  onSelectEmployee,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = contracts.filter((c) => {
    if (selectedDepartment !== 'all' && c.department !== selectedDepartment) return false;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'Sắp hết hạn' && c.status !== 'Sắp hết hạn') return false;
      if (selectedStatus === 'Thử việc' && c.contract_type !== 'HĐ Thử việc') return false;
      if (selectedStatus === 'Đang làm việc' && c.status !== 'Đang hiệu lực') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = c.employee_id.toLowerCase().includes(q);
      const matchName = c.name.toLowerCase().includes(q);
      const matchNumber = c.contract_number.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchNumber) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentList = filtered.slice(startIndex, startIndex + pageSize);

  const handleExport = () => {
    const exportData = filtered.map((c, idx) => ({
      STT: idx + 1,
      'Số hợp đồng': c.contract_number,
      'Mã NV': c.employee_id,
      'Họ và tên': c.name,
      'Phòng ban': c.department,
      'Chức danh ký HĐ': c.title,
      'Loại hợp đồng': c.contract_type,
      'Ngày ký': c.sign_date,
      'Ngày hiệu lực': c.effective_date,
      'Ngày hết hạn': c.expiration_date,
      'Mức lương đóng BH (VNĐ)': c.insurance_salary,
      'Địa điểm làm việc': c.workplace,
      'Trạng thái hợp đồng': c.status,
    }));
    exportTableToExcel(exportData, `Danh_sach_hop_dong_${new Date().toISOString().slice(0, 10)}`, 'Hop_dong_lao_dong');
  };

  const handleCreateCalendar = (c: Contract) => {
    if (!c.expiration_date) return;
    const url = createGoogleCalendarUrl(
      `[Tái ký HĐLĐ] ${c.employee_id} - ${c.name}`,
      `Nhắc nhở Phòng HCNS Công ty A xử lý tái ký Hợp đồng lao động (${c.contract_number}) cho nhân sự ${c.name} (${c.department}). Hạn chót: ${c.expiration_date}.`,
      c.expiration_date
    );
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Quản trị Hợp đồng lao động (02_Hop_dong.xlsx)
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              {filtered.length} hợp đồng
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi thời hạn hợp đồng, phân loại HĐ không thời hạn, có thời hạn và HĐ thử việc
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
                <th className="p-3.5 pl-6">Số Hợp đồng</th>
                <th className="p-3.5">Mã NV & Họ tên</th>
                <th className="p-3.5">Phòng ban</th>
                <th className="p-3.5">Loại hợp đồng</th>
                <th className="p-3.5">Ngày ký / Hiệu lực</th>
                <th className="p-3.5">Ngày hết hạn</th>
                <th className="p-3.5 text-right">Lương đóng BH</th>
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentList.map((c) => {
                const emp = employees.find((e) => e.id === c.employee_id);
                const isExpiring = c.status === 'Sắp hết hạn' || ['TP0021', 'TP0035'].includes(c.employee_id);
                const isProbation = c.contract_type === 'HĐ Thử việc';

                return (
                  <tr
                    key={c.contract_number}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isExpiring ? 'bg-red-50/30 dark:bg-red-950/10' : ''
                    }`}
                  >
                    <td className="p-3.5 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                      {c.contract_number}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                      <div className="font-mono text-[11px] text-forest-700 dark:text-emerald-400">{c.employee_id}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {c.department}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                          isProbation
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {c.contract_type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      <div>Ký: {formatDateVN(c.sign_date)}</div>
                      <div>HL: {formatDateVN(c.effective_date)}</div>
                    </td>
                    <td className="p-3.5">
                      {c.expiration_date ? (
                        <div
                          className={`font-bold ${
                            isExpiring ? 'text-red-600 flex items-center gap-1' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {isExpiring && <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />}
                          {formatDateVN(c.expiration_date)}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Không xác định thời hạn</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-bold text-amber-600 dark:text-amber-400">
                      {formatVND(c.insurance_salary)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isExpiring
                            ? 'bg-red-500 text-white animate-pulse'
                            : isProbation
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.expiration_date && (
                          <button
                            onClick={() => handleCreateCalendar(c)}
                            title="Tạo lịch nhắc tái ký trên Google Calendar"
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => emp && onSelectEmployee(emp)}
                          title="Xem hồ sơ 360°"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, filtered.length)} trên {filtered.length} hợp đồng
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
