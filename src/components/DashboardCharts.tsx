import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Department, PayrollRecord, Employee } from '../types';
import { formatVND, formatVNDCompact } from '../utils/formatters';

interface DashboardChartsProps {
  departments: Department[];
  employees: Employee[];
  payroll: Record<string, PayrollRecord[]>;
  selectedMonth: string;
}

const COLORS = ['#0F291E', '#163D2D', '#2A7255', '#D97706', '#F59E0B', '#2563eb'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  departments,
  employees,
  payroll,
  selectedMonth,
}) => {
  // 1. Horizontal Bar Chart: Actual vs Quota per Department
  const actualVsQuotaData = departments.map((dept) => {
    const actualCount = employees.filter((e) => e.department === dept.name).length;
    return {
      name: dept.name.replace('Phòng ', '').replace(' & Vận hành', ''),
      fullName: dept.name,
      'Thực tế': actualCount,
      'Định biên': dept.quota,
      chenhLech: actualCount - dept.quota,
    };
  });

  // 2. Composed Bar & Line: Total Gross vs Net over Q3 months
  const months = ['07/2026', '08/2026', '09/2026'];
  const payrollTrendData = months.map((m) => {
    const records = payroll[m] || [];
    const totalGross = records.reduce((sum, r) => sum + r.total_income, 0);
    const totalNet = records.reduce((sum, r) => sum + r.net_salary, 0);
    const totalOt = records.reduce((sum, r) => sum + r.ot_pay, 0);
    return {
      month: `Tháng ${m.split('/')[0]}`,
      'Tổng thu nhập': totalGross,
      'Thực lĩnh': totalNet,
      'Tiền OT': totalOt,
    };
  });

  // 3. Donut Chart: Salary proportion by Department for selected month
  const currentMonthRecords = payroll[selectedMonth] || [];
  const deptSalaryMap: Record<string, number> = {};
  currentMonthRecords.forEach((r) => {
    deptSalaryMap[r.department] = (deptSalaryMap[r.department] || 0) + r.total_income;
  });

  const donutData = Object.entries(deptSalaryMap).map(([dept, amount]) => ({
    name: dept.replace('Phòng ', '').replace(' & Vận hành', ''),
    fullName: dept,
    value: amount,
  }));

  const totalCurrentPayroll = currentMonthRecords.reduce((sum, r) => sum + r.total_income, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Horizontal Bar - Actual vs Quota */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Nhân sự thực tế vs Định biên 6 phòng ban
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              So sánh quy mô nhân lực với chỉ tiêu biên chế năm 2026
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-emerald-400 border border-forest-500/20">
            Tổng: {employees.length} NS
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={actualVsQuotaData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                width={85}
              />
              <Tooltip
                formatter={(val: any, name: string) => [`${val} nhân sự`, name]}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                contentStyle={{
                  backgroundColor: '#0F291E',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Thực tế" fill="#0F291E" radius={[0, 6, 6, 0]} />
              <Bar dataKey="Định biên" fill="#D97706" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Composed Bar & Line - Total Gross & Net */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Biến động Thu nhập & Thực lĩnh qua các tháng
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quỹ lương Quý 3/2026 (Cột: Tổng thu nhập, Đường: Thực lĩnh)
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-500/20">
            VNĐ
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={payrollTrendData}
              margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => formatVNDCompact(v)}
                tick={{ fontSize: 10, fill: '#64748b' }}
              />
              <Tooltip
                formatter={(val: any, name: string) => [formatVND(Number(val)), name]}
                contentStyle={{
                  backgroundColor: '#0F291E',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Tổng thu nhập" fill="#2A7255" radius={[6, 6, 0, 0]} />
              <Line
                type="monotone"
                dataKey="Thực lĩnh"
                stroke="#D97706"
                strokeWidth={3}
                dot={{ r: 4, fill: '#D97706', strokeWidth: 2, stroke: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Donut Chart - Department Payroll Share */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cơ cấu tỷ trọng Quỹ lương 6 phòng ban
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kỳ {selectedMonth} (Tổng: {formatVNDCompact(totalCurrentPayroll)})
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            Tỷ trọng %
          </span>
        </div>

        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any, _, props) => {
                  const pct = totalCurrentPayroll > 0 ? ((Number(val) / totalCurrentPayroll) * 100).toFixed(1) : 0;
                  return [`${formatVND(Number(val))} (${pct}%)`, props.payload.fullName];
                }}
                contentStyle={{
                  backgroundColor: '#0F291E',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QUỸ LƯƠNG</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
              {formatVNDCompact(totalCurrentPayroll)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
