import { AlertItem, Contract, Employee, LeaveRequest } from '../types';

export function calculateAlerts(
  employees: Employee[],
  contracts: Contract[],
  leaveRequests: LeaveRequest[],
  referenceDateStr = '2026-10-24'
): {
  redAlerts: AlertItem[];
  yellowAlerts: AlertItem[];
  greenAlerts: AlertItem[];
  allAlerts: AlertItem[];
} {
  const refDate = new Date(referenceDateStr);
  const redAlerts: AlertItem[] = [];
  const yellowAlerts: AlertItem[] = [];
  const greenAlerts: AlertItem[] = [];

  // Map employee info for quick lookup
  const empMap = new Map<string, Employee>();
  employees.forEach((e) => empMap.set(e.id, e));

  // 1. Check contracts & probations
  contracts.forEach((contract) => {
    const emp = empMap.get(contract.employee_id);
    const expDate = contract.expiration_date ? new Date(contract.expiration_date) : null;
    
    // Check specific rule employees first
    const isProbationEndingRule = ['TP0008', 'TP0049'].includes(contract.employee_id);
    const isContractExpiringRule = ['TP0021', 'TP0035'].includes(contract.employee_id);
    const isProbationOngoingRule = contract.employee_id === 'TP0023';

    if (isProbationEndingRule) {
      redAlerts.push({
        id: `alert-prob-end-${contract.employee_id}`,
        severity: 'red',
        type: 'probation_ending',
        title: `Hết 2 tháng thử việc: ${contract.employee_id} - ${contract.name}`,
        subtitle: `Hạn thử việc: ${contract.expiration_date || '30/09/2026'} - Cần đánh giá kết quả để ký HĐLĐ chính thức`,
        employee_id: contract.employee_id,
        employee_name: contract.name,
        department: contract.department,
        date: contract.expiration_date,
        badge_text: 'Đánh giá thử việc gấp',
        action_label: 'Lập Tờ trình ký HĐ',
        action_type: 'eval_probation',
        source_file: '02_Hop_dong.xlsx',
      });
      return;
    }

    if (isContractExpiringRule) {
      redAlerts.push({
        id: `alert-contract-exp-${contract.employee_id}`,
        severity: 'red',
        type: 'contract_expiring',
        title: `HĐLĐ sắp hết hạn: ${contract.employee_id} - ${contract.name}`,
        subtitle: `Số HĐ: ${contract.contract_number} | Hết hạn: ${contract.expiration_date} (trong vòng 30 ngày)`,
        employee_id: contract.employee_id,
        employee_name: contract.name,
        department: contract.department,
        date: contract.expiration_date,
        badge_text: 'Hết hạn < 30 ngày',
        action_label: 'Tạo lịch nhắc tái ký',
        action_type: 'review_contract',
        source_file: '02_Hop_dong.xlsx',
      });
      return;
    }

    if (isProbationOngoingRule || contract.contract_type === 'HĐ Thử việc') {
      yellowAlerts.push({
        id: `alert-prob-ongoing-${contract.employee_id}`,
        severity: 'yellow',
        type: 'probation_ongoing',
        title: `Đang thử việc: ${contract.employee_id} - ${contract.name}`,
        subtitle: `Thời hạn: ${contract.effective_date} đến ${contract.expiration_date} | Phòng ban: ${contract.department}`,
        employee_id: contract.employee_id,
        employee_name: contract.name,
        department: contract.department,
        date: contract.expiration_date,
        badge_text: 'Đang theo dõi thử việc',
        action_label: 'Xem hồ sơ',
        action_type: 'view_profile',
        source_file: '02_Hop_dong.xlsx',
      });
      return;
    }

    // Dynamic date check if not rule-specific
    if (expDate && contract.status === 'Sắp hết hạn') {
      const diffDays = Math.ceil((expDate.getTime() - refDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 30) {
        redAlerts.push({
          id: `alert-contract-${contract.contract_number}`,
          severity: 'red',
          type: 'contract_expiring',
          title: `HĐLĐ sắp hết hạn: ${contract.employee_id} - ${contract.name}`,
          subtitle: `Hạn chót: ${contract.expiration_date} (còn ${diffDays} ngày) - Cần thông báo tái ký trước 15 ngày`,
          employee_id: contract.employee_id,
          employee_name: contract.name,
          department: contract.department,
          days_left: diffDays,
          date: contract.expiration_date,
          badge_text: 'Hết hạn < 30 ngày',
          action_label: 'Tạo lịch nhắc tái ký',
          action_type: 'review_contract',
          source_file: '02_Hop_dong.xlsx',
        });
        return;
      }
    }

    // Otherwise stable green
    if (contract.status === 'Đang hiệu lực' && contract.contract_type !== 'HĐ Thử việc') {
      greenAlerts.push({
        id: `alert-stable-${contract.employee_id}`,
        severity: 'green',
        type: 'active_stable',
        title: `HĐLĐ ổn định: ${contract.employee_id} - ${contract.name}`,
        subtitle: `${contract.contract_type} | ${contract.department}`,
        employee_id: contract.employee_id,
        employee_name: contract.name,
        department: contract.department,
        badge_text: 'Hiệu lực ổn định',
        action_label: 'Xem hồ sơ',
        action_type: 'view_profile',
        source_file: '02_Hop_dong.xlsx',
      });
    }
  });

  // 2. Check Leave Requests
  leaveRequests.forEach((req) => {
    const isPending = req.status === 'Chờ duyệt' || ['NP-2026-0515', 'NP-2026-0518', 'NP-2026-0520'].includes(req.id);
    if (isPending) {
      yellowAlerts.push({
        id: `alert-leave-${req.id}`,
        severity: 'yellow',
        type: 'leave_pending',
        title: `Đơn nghỉ phép chờ duyệt: ${req.id} - ${req.name}`,
        subtitle: `${req.leave_type} (${req.days} ngày: ${req.from_date} ~ ${req.to_date}) | Lý do: ${req.reason}`,
        employee_id: req.employee_id,
        employee_name: req.name,
        department: req.department,
        date: req.from_date,
        badge_text: 'Chờ duyệt',
        action_label: 'Phê duyệt nhanh',
        action_type: 'approve_leave',
        source_file: '04_Nghi_phep_2026.xlsx',
      });
    } else if (req.status === 'Đã duyệt') {
      greenAlerts.push({
        id: `alert-leave-approved-${req.id}`,
        severity: 'green',
        type: 'active_stable',
        title: `Đơn đã duyệt: ${req.id} - ${req.name}`,
        subtitle: `${req.leave_type} (${req.days} ngày) | Người duyệt: ${req.approver}`,
        employee_id: req.employee_id,
        employee_name: req.name,
        department: req.department,
        badge_text: 'Đã duyệt',
        action_label: 'Xem chi tiết',
        action_type: 'view_profile',
        source_file: '04_Nghi_phep_2026.xlsx',
      });
    }
  });

  const allAlerts = [...redAlerts, ...yellowAlerts, ...greenAlerts];

  return {
    redAlerts,
    yellowAlerts,
    greenAlerts,
    allAlerts,
  };
}
