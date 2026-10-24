import React from 'react';
import {
  Users,
  CircleDollarSign,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Clock,
  CalendarDays,
  FileText,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { AlertItem, Department, Employee, PayrollRecord, SystemData, AIAnalysisResult } from '../types';
import { CountUpNumber } from './CountUpNumber';
import { DashboardCharts } from './DashboardCharts';
import { formatVND, formatVNDCompact } from '../utils/formatters';

interface DashboardViewProps {
  systemData: SystemData;
  selectedMonth: string;
  selectedDepartment: string;
  alerts: {
    redAlerts: AlertItem[];
    yellowAlerts: AlertItem[];
    greenAlerts: AlertItem[];
    allAlerts: AlertItem[];
  };
  onSelectEmployee: (emp: Employee) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenAiAssistant: () => void;
  analysisResult: AIAnalysisResult | null;
  isAnalyzing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  systemData,
  selectedMonth,
  selectedDepartment,
  alerts,
  onSelectEmployee,
  onNavigateToTab,
  onOpenAiAssistant,
  analysisResult,
  isAnalyzing,
}) => {
  // Filter employees
  const filteredEmployees = systemData.employees.filter((e) => {
    if (selectedDepartment !== 'all' && e.department !== selectedDepartment) return false;
    return true;
  });

  // Payroll for selected month
  const monthPayroll = systemData.payroll[selectedMonth] || [];
  const filteredPayroll = monthPayroll.filter((p) => {
    if (selectedDepartment !== 'all' && p.department !== selectedDepartment) return false;
    return true;
  });

  const totalGross = filteredPayroll.reduce((sum, p) => sum + p.total_income, 0);
  const totalNet = filteredPayroll.reduce((sum, p) => sum + p.net_salary, 0);
  const totalOt = filteredPayroll.reduce((sum, p) => sum + p.ot_pay, 0);

  // Total Quota
  const totalQuota = systemData.departments.reduce((sum, d) => {
    if (selectedDepartment !== 'all' && d.name !== selectedDepartment) return sum;
    return sum + d.quota;
  }, 0);

  const urgentCount = alerts.redAlerts.length;
  const pendingCount = alerts.redAlerts.length + alerts.yellowAlerts.length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 4 Bento Grid KPI Cards with Count-up & Hover 3D Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Tổng Nhân sự */}
        <div
          onClick={() => onNavigateToTab('employees')}
          className="group relative bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:shadow-forest-900/5 hover:-translate-y-1 hover:border-forest-500/40 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng nhân sự thực tế
            </span>
            <div className="w-10 h-10 rounded-2xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <CountUpNumber
              value={filteredEmployees.length}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white"
            />
            <span className="text-xs text-slate-400 font-semibold">/ {totalQuota} định biên</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Đạt {totalQuota > 0 ? ((filteredEmployees.length / totalQuota) * 100).toFixed(1) : 100}% chỉ tiêu
            </span>
            <span className="text-slate-400 group-hover:text-amber-500 flex items-center transition-colors">
              Chi tiết <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* KPI 2: Quỹ lương tháng */}
        <div
          onClick={() => onNavigateToTab('payroll')}
          className="group relative bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 hover:border-amber-500/40 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quỹ lương kỳ {selectedMonth}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <CountUpNumber
              value={totalGross}
              formatter={(v) => formatVNDCompact(v)}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white"
            />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">VNĐ</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Thực lĩnh: <span className="font-bold text-emerald-600">{formatVNDCompact(totalNet)}</span>
            </span>
            <span className="text-slate-400 group-hover:text-amber-500 flex items-center transition-colors">
              Bảng lương <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* KPI 3: Số việc cần xử lý */}
        <div
          onClick={() => onNavigateToTab('tasks')}
          className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border transition-all cursor-pointer overflow-hidden hover:-translate-y-1 ${
            urgentCount > 0
              ? 'border-red-300 dark:border-red-900/60 hover:shadow-xl hover:shadow-red-500/10'
              : 'border-slate-200/80 dark:border-slate-800 hover:shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Số việc cần xử lý gấp
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                urgentCount > 0
                  ? 'bg-red-100 dark:bg-red-950/60 text-red-600 animate-pulse'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <CountUpNumber
              value={pendingCount}
              className={`text-2xl sm:text-3xl font-extrabold ${
                urgentCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
              }`}
            />
            <span className="text-xs text-red-500 font-bold">({urgentCount} việc khẩn cấp)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {alerts.yellowAlerts.length} việc chờ duyệt
            </span>
            <span className="text-slate-400 group-hover:text-red-500 flex items-center transition-colors">
              Xử lý ngay <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* KPI 4: Tuân thủ & Đối soát */}
        <div
          onClick={() => onNavigateToTab('upload')}
          className="group relative bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-500/40 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Đối soát 10 file Excel
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              100%
            </span>
            <span className="text-xs text-emerald-600 font-bold">Khớp dữ liệu 50 NS</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Loại bỏ dòng 55 Tổng cộng
            </span>
            <span className="text-slate-400 group-hover:text-blue-500 flex items-center transition-colors">
              Đối soát <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 3 Recharts Charts Component */}
      <DashboardCharts
        departments={systemData.departments}
        employees={systemData.employees}
        payroll={systemData.payroll}
        selectedMonth={selectedMonth}
      />

      {/* Two Column Layout: Quick Urgent Tasks vs Smart AI Payroll Observation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Top Urgent Tasks (Cảnh báo Đỏ & Vàng) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Việc cần xử lý gấp (Rủi ro nhân sự)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cảnh báo sắp hết hạn hợp đồng & kết thúc 2 tháng thử việc
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('tasks')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                Xem tất cả ({pendingCount})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {alerts.redAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-500 text-white shadow-sm">
                        {alert.badge_text}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {alert.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{alert.subtitle}</p>
                  </div>
                  <button
                    onClick={() => {
                      const emp = systemData.employees.find((e) => e.id === alert.employee_id);
                      if (emp) onSelectEmployee(emp);
                    }}
                    className="px-3 py-1.5 rounded-xl font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 flex-shrink-0"
                  >
                    {alert.action_label || 'Xử lý'}
                  </button>
                </div>
              ))}

              {alerts.yellowAlerts.slice(0, 2).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-500 text-white shadow-sm">
                        {alert.badge_text}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {alert.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{alert.subtitle}</p>
                  </div>
                  <button
                    onClick={() => onNavigateToTab('tasks')}
                    className="px-3 py-1.5 rounded-xl font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 flex-shrink-0"
                  >
                    Duyệt
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Smart AI Payroll Observation Box */}
        <div className="bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-forest-600/40 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient light glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Khung nhận xét thông minh từ AI
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-forest-900">
                      GEMINI FLASH
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Phân tích biến động quỹ lương kỳ {selectedMonth} & Tham mưu quyết định
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenAiAssistant}
                className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1"
              >
                Hỏi đáp AI
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Analysis Snippet */}
            <div className="bg-forest-950/60 rounded-2xl p-4 border border-forest-600/40 text-xs space-y-3">
              <p className="text-slate-200 leading-relaxed font-medium">
                {analysisResult
                  ? analysisResult.summary
                  : `Hệ thống ghi nhận tổng quỹ lương tháng ${selectedMonth} đạt ${formatVND(
                      totalGross
                    )}. Các khoản trích đóng bảo hiểm 10.5% và thuế TNCN được khấu trừ chính xác theo quy định.`}
              </p>

              <div className="space-y-2 pt-1 border-t border-forest-700/60">
                {(analysisResult?.highlights || [
                  'Chi phí làm thêm giờ (OT) tập trung cao tại Xưởng Sản xuất với một số tổ trưởng trên 20h/tháng.',
                  'Có 2 nhân sự sắp hết hạn HĐLĐ (TP0021, TP0035) cần lên phương án gia hạn trước 15 ngày.',
                  'Có 2 nhân sự kết thúc 2 tháng thử việc (TP0008, TP0049) cần đánh giá ký chính thức.',
                ]).map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-forest-600/40 flex items-center justify-between text-xs">
            <span className="text-slate-300 text-[11px]">
              Tự động đối soát 5 file Excel • Cập nhật tức thời
            </span>
            <button
              onClick={onOpenAiAssistant}
              className="px-4 py-2 rounded-xl text-xs font-bold text-forest-900 bg-amber-400 hover:bg-amber-300 shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Mở Trợ lý AI Tham mưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
