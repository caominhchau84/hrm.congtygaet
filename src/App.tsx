import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import sampleDataRaw from './data/sampleData.json';
import { AIAnalysisResult, Employee, SystemData } from './types';
import { calculateAlerts } from './utils/alerts';
import { analyzePayrollWithGemini, getStoredApiKey } from './utils/geminiAI';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { EmployeesView } from './components/EmployeesView';
import { ContractsView } from './components/ContractsView';
import { TimekeepingView } from './components/TimekeepingView';
import { LeavesView } from './components/LeavesView';
import { PayrollView } from './components/PayrollView';
import { UploadView } from './components/UploadView';
import { EmployeeDrawer360 } from './components/EmployeeDrawer360';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AiAssistantModal } from './components/AiAssistantModal';

export const App: React.FC = () => {
  // System Data
  const [systemData, setSystemData] = useState<SystemData>(sampleDataRaw as unknown as SystemData);

  // App Navigation & Drawer state
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filters State
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('09/2026');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // API Key & AI State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiVoiceInitialQuery, setAiVoiceInitialQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Toast / notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Initialize dark mode and API key status
  useEffect(() => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key));

    // Dark mode check
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Run AI Payroll Analysis
  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzePayrollWithGemini(systemData, selectedMonth);
      setAnalysisResult(res);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial AI Analysis
  useEffect(() => {
    runAiAnalysis();
  }, [selectedMonth]);

  // Load Sample Data with Confetti
  const handleLoadSampleData = () => {
    setSystemData(sampleDataRaw as unknown as SystemData);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    showToast('⚡ Đã nạp thành công bộ 50 nhân sự chuẩn và 10 file dữ liệu Quý 3/2026!');
    runAiAnalysis();
  };

  // Calculate Alerts
  const alerts = calculateAlerts(
    systemData.employees,
    systemData.contracts,
    systemData.leave_requests
  );

  // Handle open 360° drawer
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDrawerOpen(true);
  };

  // Handle approve leave request
  const handleApproveLeave = (leaveId: string) => {
    setSystemData((prev) => {
      const updated = { ...prev };
      updated.leave_requests = updated.leave_requests.map((r) =>
        r.id === leaveId ? { ...r, status: 'Đã duyệt' } : r
      );
      return updated;
    });
    showToast(`✅ Đã phê duyệt thành công đơn nghỉ phép ${leaveId}`);
  };

  const handleRejectLeave = (leaveId: string) => {
    setSystemData((prev) => {
      const updated = { ...prev };
      updated.leave_requests = updated.leave_requests.map((r) =>
        r.id === leaveId ? { ...r, status: 'Từ chối' } : r
      );
      return updated;
    });
    showToast(`Đã từ chối đơn nghỉ phép ${leaveId}`);
  };

  // Voice AI trigger from header
  const handleTriggerVoiceAi = (spokenText: string) => {
    setAiVoiceInitialQuery(spokenText);
    setIsAiModalOpen(true);
  };

  // Find records for drawer
  const drawerContract = selectedEmployee
    ? systemData.contracts.find((c) => c.employee_id === selectedEmployee.id) || null
    : null;

  const drawerPayrolls = selectedEmployee
    ? Object.values(systemData.payroll)
        .flat()
        .filter((p) => p.employee_id === selectedEmployee.id)
    : [];

  const drawerTimekeeping = selectedEmployee
    ? Object.values(systemData.timekeeping)
        .flat()
        .filter((t) => t.employee_id === selectedEmployee.id)
    : [];

  const drawerLeaveRequests = selectedEmployee
    ? systemData.leave_requests.filter((r) => r.employee_id === selectedEmployee.id)
    : [];

  const drawerLeaveBalance = selectedEmployee
    ? systemData.leave_balances.find((b) => b.employee_id === selectedEmployee.id) || null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-porcelain dark:bg-slate-950 font-sans transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-forest-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-forest-600/50 flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={hasApiKey}
        onLoadSampleData={handleLoadSampleData}
        departments={systemData.departments}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onTriggerAiChat={handleTriggerVoiceAi}
      />

      {/* Body: Sidebar + Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingTasksCount={alerts.redAlerts.length + alerts.yellowAlerts.length}
          urgentTasksCount={alerts.redAlerts.length}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              systemData={systemData}
              selectedMonth={selectedMonth}
              selectedDepartment={selectedDepartment}
              alerts={alerts}
              onSelectEmployee={handleSelectEmployee}
              onNavigateToTab={setActiveTab}
              onOpenAiAssistant={() => setIsAiModalOpen(true)}
              analysisResult={analysisResult}
              isAnalyzing={isAnalyzing}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              alerts={alerts}
              systemData={systemData}
              onSelectEmployee={handleSelectEmployee}
              onApproveLeave={handleApproveLeave}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              employees={systemData.employees}
              selectedDepartment={selectedDepartment}
              selectedStatus={selectedStatus}
              searchQuery={searchQuery}
              onSelectEmployee={handleSelectEmployee}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsView
              contracts={systemData.contracts}
              employees={systemData.employees}
              selectedDepartment={selectedDepartment}
              selectedStatus={selectedStatus}
              searchQuery={searchQuery}
              onSelectEmployee={handleSelectEmployee}
            />
          )}

          {activeTab === 'timekeeping' && (
            <TimekeepingView
              timekeeping={systemData.timekeeping}
              employees={systemData.employees}
              selectedMonth={selectedMonth}
              selectedDepartment={selectedDepartment}
              searchQuery={searchQuery}
              onSelectEmployee={handleSelectEmployee}
              onMonthChange={setSelectedMonth}
            />
          )}

          {activeTab === 'leaves' && (
            <LeavesView
              leaveRequests={systemData.leave_requests}
              leaveBalances={systemData.leave_balances}
              employees={systemData.employees}
              selectedDepartment={selectedDepartment}
              selectedStatus={selectedStatus}
              searchQuery={searchQuery}
              onSelectEmployee={handleSelectEmployee}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollView
              payroll={systemData.payroll}
              employees={systemData.employees}
              selectedMonth={selectedMonth}
              selectedDepartment={selectedDepartment}
              searchQuery={searchQuery}
              onSelectEmployee={handleSelectEmployee}
              onMonthChange={setSelectedMonth}
            />
          )}

          {activeTab === 'upload' && (
            <UploadView
              systemData={systemData}
              onUpdateSystemData={setSystemData}
              onReloadSampleData={handleLoadSampleData}
            />
          )}
        </main>
      </div>

      {/* Slide-over Drawer 360° */}
      <EmployeeDrawer360
        employee={selectedEmployee}
        contract={drawerContract}
        payrollRecords={drawerPayrolls}
        timekeepingRecords={drawerTimekeeping}
        leaveRequests={drawerLeaveRequests}
        leaveBalance={drawerLeaveBalance}
        selectedMonth={selectedMonth}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={(k) => setHasApiKey(Boolean(k))}
      />

      {/* AI Assistant Chat Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        systemData={systemData}
        analysisResult={analysisResult}
        isAnalyzing={isAnalyzing}
        onRunAnalysis={runAiAnalysis}
        initialQuery={aiVoiceInitialQuery}
      />
    </div>
  );
};

export default App;
