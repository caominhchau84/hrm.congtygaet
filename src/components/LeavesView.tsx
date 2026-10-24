import React, { useState } from 'react';
import {
  CalendarDays,
  Download,
  Check,
  X,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Employee, LeaveBalance, LeaveRequest } from '../types';
import { formatDateVN } from '../utils/formatters';
import { exportTableToExcel } from '../utils/exportTools';

interface LeavesViewProps {
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  employees: Employee[];
  selectedDepartment: string;
  selectedStatus: string;
  searchQuery: string;
  onSelectEmployee: (emp: Employee) => void;
  onApproveLeave: (leaveId: string) => void;
  onRejectLeave: (leaveId: string) => void;
}

export const LeavesView: React.FC<LeavesViewProps> = ({
  leaveRequests,
  leaveBalances,
  employees,
  selectedDepartment,
  selectedStatus,
  searchQuery,
  onSelectEmployee,
  onApproveLeave,
  onRejectLeave,
}) => {
  const [subTab, setSubTab] = useState<'requests' | 'balances'>('requests');

  // Filter requests
  const filteredRequests = leaveRequests.filter((r) => {
    if (selectedDepartment !== 'all' && r.department !== selectedDepartment) return false;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'Chờ duyệt' && r.status !== 'Chờ duyệt') return false;
      if (selectedStatus === 'Đang làm việc' && r.status !== 'Đã duyệt') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = r.employee_id.toLowerCase().includes(q);
      const matchName = r.name.toLowerCase().includes(q);
      const matchCode = r.id.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchCode) return false;
    }
    return true;
  });

  // Filter balances
  const filteredBalances = leaveBalances.filter((b) => {
    if (selectedDepartment !== 'all' && b.department !== selectedDepartment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = b.employee_id.toLowerCase().includes(q);
      const matchName = b.name.toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }
    return true;
  });

  const pendingRequests = leaveRequests.filter((r) => r.status === 'Chờ duyệt');

  const handleExportRequests = () => {
    const data = filteredRequests.map((r, idx) => ({
      STT: idx + 1,
      'Mã đơn': r.id,
      'Mã NV': r.employee_id,
      'Họ và tên': r.name,
      'Phòng ban': r.department,
      'Loại nghỉ phép': r.leave_type,
      'Từ ngày': r.from_date,
      'Đến ngày': r.to_date,
      'Số ngày': r.days,
      'Lý do xin nghỉ': r.reason,
      'Người phê duyệt': r.approver,
      'Trạng thái duyệt': r.status,
    }));
    exportTableToExcel(data, `Theo_doi_don_nghi_${new Date().toISOString().slice(0, 10)}`, 'Theo_doi_don_nghi');
  };

  const handleExportBalances = () => {
    const data = filteredBalances.map((b, idx) => ({
      STT: idx + 1,
      'Mã NV': b.employee_id,
      'Họ và tên': b.name,
      'Phòng ban': b.department,
      'Tiêu chuẩn năm': b.entitled_days,
      'Thâm niên': b.seniority_days,
      'Đã nghỉ': b.used_days,
      'Còn lại': b.remaining_days,
      'Tỷ lệ sử dụng': b.usage_rate,
      'Trạng thái': b.status,
    }));
    exportTableToExcel(data, `Quy_phep_nam_2026_${new Date().toISOString().slice(0, 10)}`, 'Quy_phep_nam');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Quản trị Nghỉ phép & Quỹ phép năm (04_Nghi_phep_2026.xlsx)
            {pendingRequests.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse">
                {pendingRequests.length} đơn chờ duyệt
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi đơn nghỉ phép, duyệt nhanh và đối soát số dư ngày phép năm 2026
          </p>
        </div>

        {/* Sub-tab Switcher & Export */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setSubTab('requests')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                subTab === 'requests'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đơn xin nghỉ ({filteredRequests.length})
            </button>
            <button
              onClick={() => setSubTab('balances')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                subTab === 'balances'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Quỹ phép 50 NS ({filteredBalances.length})
            </button>
          </div>

          <button
            onClick={subTab === 'requests' ? handleExportRequests : handleExportBalances}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-forest-700 hover:bg-forest-800 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: LEAVE REQUESTS */}
      {subTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5 pl-6">Mã đơn</th>
                  <th className="p-3.5">Mã NV & Họ tên</th>
                  <th className="p-3.5">Phòng ban</th>
                  <th className="p-3.5">Loại nghỉ</th>
                  <th className="p-3.5">Thời gian</th>
                  <th className="p-3.5 text-center">Số ngày</th>
                  <th className="p-3.5">Lý do xin nghỉ</th>
                  <th className="p-3.5">Người duyệt</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 pr-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.map((req) => {
                  const emp = employees.find((e) => e.id === req.employee_id);
                  const isPending = req.status === 'Chờ duyệt';

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isPending ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                        {req.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{req.name}</div>
                        <div className="font-mono text-[11px] text-forest-700 dark:text-emerald-400">{req.employee_id}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {req.department}
                      </td>
                      <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {req.leave_type}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {formatDateVN(req.from_date)} ~ {formatDateVN(req.to_date)}
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-600 dark:text-amber-400">
                        {req.days} ngày
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {req.approver}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPending
                              ? 'bg-amber-500 text-white animate-pulse'
                              : req.status === 'Đã duyệt'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => onApproveLeave(req.id)}
                                title="Phê duyệt đơn nghỉ"
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Duyệt
                              </button>
                              <button
                                onClick={() => onRejectLeave(req.id)}
                                title="Từ chối đơn"
                                className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => emp && onSelectEmployee(emp)}
                            title="Hồ sơ 360°"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
        </div>
      )}

      {/* SUB-TAB 2: LEAVE BALANCES */}
      {subTab === 'balances' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5 pl-6">Mã NV & Họ tên</th>
                  <th className="p-3.5">Phòng ban</th>
                  <th className="p-3.5 text-center">Tiêu chuẩn năm</th>
                  <th className="p-3.5 text-center">Thâm niên</th>
                  <th className="p-3.5 text-center">Đã nghỉ</th>
                  <th className="p-3.5 text-center">Còn lại</th>
                  <th className="p-3.5 text-center">Tỷ lệ sử dụng</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 pr-6 text-right">Xem 360°</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBalances.map((b) => {
                  const emp = employees.find((e) => e.id === b.employee_id);

                  return (
                    <tr
                      key={b.employee_id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-3.5 pl-6">
                        <div className="font-bold text-slate-900 dark:text-white">{b.name}</div>
                        <div className="font-mono text-[11px] text-forest-700 dark:text-emerald-400">{b.employee_id}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {b.department}
                      </td>
                      <td className="p-3.5 text-center font-medium">
                        {b.entitled_days} ngày
                      </td>
                      <td className="p-3.5 text-center text-slate-500">
                        +{b.seniority_days} ngày
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-600 dark:text-amber-400">
                        {b.used_days} ngày
                      </td>
                      <td className="p-3.5 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                        {b.remaining_days} ngày
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        {b.usage_rate}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-6 text-right">
                        <button
                          onClick={() => emp && onSelectEmployee(emp)}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
