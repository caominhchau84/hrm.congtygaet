import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  FileText,
  Clock,
  CalendarDays,
  CircleDollarSign,
  UploadCloud,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'tasks'
  | 'employees'
  | 'contracts'
  | 'timekeeping'
  | 'leaves'
  | 'payroll'
  | 'upload';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pendingTasksCount: number;
  urgentTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount,
  urgentTasksCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as TabId,
      label: 'Bảng điều hành',
      icon: LayoutDashboard,
      desc: 'Tổng quan KPI & Biểu đồ',
    },
    {
      id: 'tasks' as TabId,
      label: 'Việc cần xử lý',
      icon: AlertTriangle,
      desc: 'Cảnh báo Đỏ - Vàng - Xanh',
      badge: pendingTasksCount,
      urgent: urgentTasksCount > 0,
    },
    {
      id: 'employees' as TabId,
      label: 'Nhân sự & Hồ sơ 360°',
      icon: Users,
      desc: '50 nhân sự & Drawer 360°',
    },
    {
      id: 'contracts' as TabId,
      label: 'Hợp đồng lao động',
      icon: FileText,
      desc: 'HĐLĐ & Theo dõi hết hạn',
    },
    {
      id: 'timekeeping' as TabId,
      label: 'Chấm công & Tăng ca',
      icon: Clock,
      desc: 'Giờ công, OT, Đi trễ',
    },
    {
      id: 'leaves' as TabId,
      label: 'Quản lý nghỉ phép',
      icon: CalendarDays,
      desc: 'Đơn nghỉ phép & Quỹ phép',
    },
    {
      id: 'payroll' as TabId,
      label: 'Bảng tính lương',
      icon: CircleDollarSign,
      desc: 'Thu nhập, BHXH, TNCN, Thực lĩnh',
    },
    {
      id: 'upload' as TabId,
      label: 'Nhập thêm dữ liệu',
      icon: UploadCloud,
      desc: 'Kéo thả 10 file Excel & Đối soát',
    },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-forest-800 text-slate-200 flex flex-col flex-shrink-0 border-r border-forest-700/60 transition-colors select-none">
      {/* Brand Header inside Sidebar for mobile/drawer */}
      <div className="p-5 border-b border-forest-700/60 hidden md:block">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-sm">
            CPA
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              CÔNG TY A
            </div>
            <div className="text-[11px] text-slate-400">Smart HRM Dashboard</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
          8 PHÂN HỆ QUẢN TRỊ
        </div>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-forest-700 to-forest-600 text-white font-bold shadow-md shadow-forest-900/40 border border-forest-500/30'
                  : 'text-slate-300 hover:bg-forest-700/50 hover:text-white font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-forest-900/60 text-slate-400 group-hover:text-amber-400 group-hover:bg-forest-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs truncate flex items-center gap-1.5">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-normal">
                    {item.desc}
                  </div>
                </div>
              </div>

              {/* Badges */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex-shrink-0 flex items-center gap-1 ${
                    item.urgent
                      ? 'bg-red-500 text-white animate-pulse shadow-sm shadow-red-500/50'
                      : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-forest-700/60 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300">
          <span>Phiên bản v2.6.4</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div>Cơ sở dữ liệu: 50 Nhân sự (TP0001 - TP0050)</div>
      </div>
    </aside>
  );
};
