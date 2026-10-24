import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Key,
  Database,
  Search,
  Filter,
  Mic,
  MicOff,
  Sparkles,
  Building2,
  Calendar,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { Department } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  onLoadSampleData: () => void;
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onTriggerAiChat: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenApiKeyModal,
  hasApiKey,
  onLoadSampleData,
  departments,
  selectedDepartment,
  onDepartmentChange,
  selectedMonth,
  onMonthChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onTriggerAiChat,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');

  const months = ['07/2026', '08/2026', '09/2026'];
  const statuses = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'Đang làm việc', label: 'Đang làm việc (Chính thức)' },
    { value: 'Thử việc', label: 'Đang thử việc' },
    { value: 'Sắp hết hạn', label: 'Sắp hết hạn HĐ (<30 ngày)' },
    { value: 'Chờ duyệt', label: 'Có đơn chờ duyệt' },
  ];

  // Speech Recognition API
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói (Web Speech API). Bạn có thể gõ trực tiếp vào khung hỏi đáp!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQuery(transcript);
        setIsListening(false);
        onTriggerAiChat(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Top Bar */}
      <div className="px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-forest-800 via-forest-700 to-amber-600 flex items-center justify-center text-white shadow-md shadow-forest-900/10 flex-shrink-0">
            <Building2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A
              </h1>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                SMART HRM & PAYROLL 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ban Giám đốc & Phòng Hành chính - Nhân sự • Công ty A
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Sample Data Button with Breathing Glow */}
          <button
            onClick={onLoadSampleData}
            title="Nạp ngay 50 nhân sự TP0001 - TP0050 và toàn bộ dữ liệu mẫu Quý 3/2026"
            className="group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-forest-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 shadow-sm hover:shadow-glow-emerald hover:scale-[1.02] active:scale-[0.98] transition-all animate-pulse-glow"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>⚡ Nạp dữ liệu thử nghiệm (Load Sample Data)</span>
          </button>

          {/* API Key Settings Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              hasApiKey
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 hover:bg-amber-100'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Cài đặt khóa Google Gemini API"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                hasApiKey ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">
              {hasApiKey ? 'API Key: Đã kết nối' : '🔑 Cài đặt API Key'}
            </span>
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Multi-dimensional Filter Bar */}
      <div className="px-4 lg:px-8 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center gap-3 text-xs">
        {/* Department Dropdown */}
        <div className="flex items-center gap-1.5 min-w-[210px] flex-1 sm:flex-initial">
          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">Tất cả 6 Phòng ban</option>
            {departments.map((dept) => (
              <option key={dept.code} value={dept.name}>
                {dept.name} ({dept.quota} định biên)
              </option>
            ))}
          </select>
        </div>

        {/* Month Dropdown */}
        <div className="flex items-center gap-1.5 min-w-[130px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                Kỳ {m}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-1.5 min-w-[170px]">
          <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {statuses.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm nhanh: Mã NV (TP00..), Họ tên, CCCD..."
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Voice AI Assistant Button */}
        <button
          onClick={handleToggleVoice}
          title={isListening ? 'Đang lắng nghe... bấm để dừng' : 'Bấm để hỏi đáp bằng giọng nói với AI'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium border transition-all ${
            isListening
              ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Đang nghe...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Voice AI</span>
            </>
          )}
        </button>

        {/* Reset Filter Button if active */}
        {(selectedDepartment !== 'all' || selectedStatus !== 'all' || searchQuery !== '') && (
          <button
            onClick={() => {
              onDepartmentChange('all');
              onStatusChange('all');
              onSearchChange('');
            }}
            title="Đặt lại bộ lọc"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
