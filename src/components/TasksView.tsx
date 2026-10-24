import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  CalendarPlus,
  Download,
  FileCheck,
  User,
  Filter,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { AlertItem, Contract, Employee, LeaveRequest, SystemData } from '../types';
import { formatDateVN } from '../utils/formatters';
import { createGoogleCalendarUrl, exportProbationEvaluationToWord } from '../utils/exportTools';

interface TasksViewProps {
  alerts: {
    redAlerts: AlertItem[];
    yellowAlerts: AlertItem[];
    greenAlerts: AlertItem[];
    allAlerts: AlertItem[];
  };
  systemData: SystemData;
  onSelectEmployee: (emp: Employee) => void;
  onApproveLeave: (leaveId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  alerts,
  systemData,
  onSelectEmployee,
  onApproveLeave,
}) => {
  const [activeSeverity, setActiveSeverity] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

  const displayedAlerts =
    activeSeverity === 'all'
      ? alerts.allAlerts
      : activeSeverity === 'red'
      ? alerts.redAlerts
      : activeSeverity === 'yellow'
      ? alerts.yellowAlerts
      : alerts.greenAlerts;

  const handleCreateCalendar = (alert: AlertItem) => {
    if (!alert.date) return;
    const url = createGoogleCalendarUrl(
      `[Tái ký HĐLĐ] ${alert.title}`,
      `Nhắc nhở Phòng HCNS Công ty A xử lý tái ký Hợp đồng lao động cho nhân sự ${alert.employee_name} (${alert.department}). Hết hạn ngày: ${alert.date}.`,
      alert.date
    );
    window.open(url, '_blank');
  };

  const handleExportProbation = (alert: AlertItem) => {
    const emp = systemData.employees.find((e) => e.id === alert.employee_id);
    const contract = systemData.contracts.find((c) => c.employee_id === alert.employee_id);
    if (emp && contract) {
      exportProbationEvaluationToWord(emp, contract);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Phân hệ: Việc cần xử lý & Cảnh báo rủi ro nhân sự
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
              {alerts.redAlerts.length} việc khẩn cấp
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quy tắc phân loại tự động 3 màu: Đỏ (Khẩn cấp dưới 30 ngày / hết thử việc) • Vàng (Chờ duyệt / đang thử việc) • Xanh (Ổn định)
          </p>
        </div>

        {/* Severity Tabs Filter */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveSeverity('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSeverity === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tất cả ({alerts.allAlerts.length})
          </button>
          <button
            onClick={() => setActiveSeverity('red')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSeverity === 'red'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Màu Đỏ - Khẩn cấp ({alerts.redAlerts.length})
          </button>
          <button
            onClick={() => setActiveSeverity('yellow')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSeverity === 'yellow'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Màu Vàng - Chờ xử lý ({alerts.yellowAlerts.length})
          </button>
          <button
            onClick={() => setActiveSeverity('green')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSeverity === 'green'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Màu Xanh - Ổn định ({alerts.greenAlerts.length})
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedAlerts.map((alert) => {
          const isRed = alert.severity === 'red';
          const isYellow = alert.severity === 'yellow';
          const isGreen = alert.severity === 'green';

          const emp = systemData.employees.find((e) => e.id === alert.employee_id);

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-3xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                isRed
                  ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                  : isYellow
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header Badge & Severity */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${
                        isRed
                          ? 'bg-red-500 text-white animate-pulse'
                          : isYellow
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {alert.badge_text}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Nguồn: {alert.source_file}
                    </span>
                  </div>

                  {alert.date && (
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateVN(alert.date)}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                  {alert.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {alert.subtitle}
                </p>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => emp && onSelectEmployee(emp)}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  Mở hồ sơ 360°
                </button>

                <div className="flex items-center gap-2">
                  {/* Action 1: If leave pending, Quick Approve button */}
                  {alert.type === 'leave_pending' && (
                    <button
                      onClick={() => onApproveLeave(alert.id.replace('alert-leave-', ''))}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Duyệt ngay
                    </button>
                  )}

                  {/* Action 2: If contract expiring, Google Calendar button */}
                  {alert.type === 'contract_expiring' && (
                    <button
                      onClick={() => handleCreateCalendar(alert)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm flex items-center gap-1"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      📅 Tạo lịch nhắc Google Calendar
                    </button>
                  )}

                  {/* Action 3: If probation ending, Export Memo Word button */}
                  {alert.type === 'probation_ending' && (
                    <button
                      onClick={() => handleExportProbation(alert)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-forest-700 hover:bg-forest-800 shadow-sm flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tờ trình ký chính thức (.docx)
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
