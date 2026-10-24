import * as XLSX from 'xlsx';
import { Contract, Employee, LeaveBalance, LeaveRequest, PayrollRecord, SystemData, TimekeepingRecord } from '../types';

export interface FileValidationResult {
  fileName: string;
  fileType: string;
  isValid: boolean;
  headerRow: number;
  dataRowCount: number;
  excludedTotalRow: boolean;
  sheets: string[];
  message: string;
  details: string[];
}

export function identifyExcelType(fileName: string, sheetNames: string[]): string {
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes('00_') || lowerName.includes('danh_muc') || sheetNames.includes('Phong_ban')) {
    return '00_Danh_muc_he_thong';
  }
  if (lowerName.includes('01_') || lowerName.includes('ho_so') || sheetNames.includes('Ho_so_nhan_vien')) {
    return '01_Ho_so_nhan_vien';
  }
  if (lowerName.includes('02_') || lowerName.includes('hop_dong') || sheetNames.includes('Hop_dong_lao_dong')) {
    return '02_Hop_dong';
  }
  if (lowerName.includes('03_') || lowerName.includes('cham_cong') || sheetNames.some(s => s.startsWith('Cham_cong'))) {
    return '03_Cham_cong';
  }
  if (lowerName.includes('04_') || lowerName.includes('nghi_phep') || sheetNames.includes('Theo_doi_don_nghi')) {
    return '04_Nghi_phep';
  }
  if (lowerName.includes('05_') || lowerName.includes('bang_luong') || sheetNames.some(s => s.startsWith('Bang_luong'))) {
    return '05_Bang_luong';
  }
  return 'unknown';
}

export function extractMonthFromFileName(fileName: string): string {
  const match = fileName.match(/2026[_-](\d{2})/);
  if (match) {
    return `${match[1]}/2026`;
  }
  if (fileName.includes('T07') || fileName.includes('07')) return '07/2026';
  if (fileName.includes('T08') || fileName.includes('08')) return '08/2026';
  if (fileName.includes('T09') || fileName.includes('09')) return '09/2026';
  if (fileName.includes('T10') || fileName.includes('10')) return '10/2026';
  return '09/2026';
}

export async function parseUploadedExcel(
  file: File,
  currentData: SystemData
): Promise<{ updatedData: SystemData; validation: FileValidationResult }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const fileType = identifyExcelType(file.name, sheetNames);

  const validation: FileValidationResult = {
    fileName: file.name,
    fileType,
    isValid: true,
    headerRow: 4,
    dataRowCount: 0,
    excludedTotalRow: false,
    sheets: sheetNames,
    message: 'Tải và kiểm tra cấu trúc thành công',
    details: [],
  };

  const updatedData: SystemData = JSON.parse(JSON.stringify(currentData));

  try {
    if (fileType === '01_Ho_so_nhan_vien') {
      const sheet = workbook.Sheets['Ho_so_nhan_vien'] || workbook.Sheets[sheetNames[0]];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      // Header at row 4 (index 3), data rows 5 to 54 (index 4 to 53)
      const dataRows = rawRows.slice(4, 54);
      validation.dataRowCount = dataRows.length;
      if (rawRows.length >= 55) {
        validation.excludedTotalRow = true;
        validation.details.push('Đã tự động loại bỏ dòng 55 (TỔNG CỘNG) để chống nhân đôi số liệu');
      }

      const newEmployees: Employee[] = dataRows
        .filter(r => r[0] && String(r[0]).startsWith('TP'))
        .map(r => ({
          id: String(r[0] || '').trim(),
          name: String(r[1] || '').trim(),
          gender: String(r[2] || '').trim(),
          dob: String(r[3] || '').trim(),
          id_card: String(r[4] || '').trim(),
          hometown: String(r[5] || '').trim(),
          department: String(r[6] || '').trim(),
          title: String(r[7] || '').trim(),
          education: String(r[8] || '').trim(),
          start_date: String(r[9] || '').trim(),
          email: String(r[10] || '').trim(),
          phone: String(r[11] || '').trim(),
          bank_account: String(r[12] || '').trim(),
          bank_name: String(r[13] || '').trim(),
          social_insurance_code: String(r[14] || '').trim(),
          dependents: Number(r[15]) || 0,
          status: String(r[16] || 'Đang làm việc').trim(),
        }));

      if (newEmployees.length > 0) {
        updatedData.employees = newEmployees;
        validation.details.push(`Đã cập nhật ${newEmployees.length} hồ sơ nhân sự (TP0001 -> TP0050)`);
      }
    } else if (fileType === '02_Hop_dong') {
      const sheet = workbook.Sheets['Hop_dong_lao_dong'] || workbook.Sheets[sheetNames[0]];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const dataRows = rawRows.slice(4, 54);
      validation.dataRowCount = dataRows.length;
      if (rawRows.length >= 55) {
        validation.excludedTotalRow = true;
        validation.details.push('Đã tự động loại bỏ dòng 55 (TỔNG CỘNG)');
      }

      const newContracts: Contract[] = dataRows
        .filter(r => r[1] && String(r[1]).startsWith('TP'))
        .map(r => ({
          contract_number: String(r[0] || '').trim(),
          employee_id: String(r[1] || '').trim(),
          name: String(r[2] || '').trim(),
          department: String(r[3] || '').trim(),
          title: String(r[4] || '').trim(),
          contract_type: String(r[5] || '').trim(),
          sign_date: String(r[6] || '').trim(),
          effective_date: String(r[7] || '').trim(),
          expiration_date: String(r[8] || '').trim(),
          insurance_salary: Number(r[9]) || 0,
          workplace: String(r[10] || '').trim(),
          status: String(r[11] || '').trim(),
        }));

      if (newContracts.length > 0) {
        updatedData.contracts = newContracts;
        validation.details.push(`Đã cập nhật ${newContracts.length} hợp đồng lao động`);
      }
    } else if (fileType === '03_Cham_cong') {
      const month = extractMonthFromFileName(file.name);
      const sheet = workbook.Sheets[sheetNames[0]];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const dataRows = rawRows.slice(4, 54);
      validation.dataRowCount = dataRows.length;
      if (rawRows.length >= 55) {
        validation.excludedTotalRow = true;
        validation.details.push('Đã tự động loại bỏ dòng 55 (TỔNG CỘNG HỆ THỐNG)');
      }

      const records: TimekeepingRecord[] = dataRows
        .filter(r => r[0] && String(r[0]).startsWith('TP'))
        .map(r => {
          const actual_work_days = Number(r[5]) || 0;
          const paid_leave_days = Number(r[6]) || 0;
          return {
            month,
            employee_id: String(r[0] || '').trim(),
            name: String(r[1] || '').trim(),
            department: String(r[2] || '').trim(),
            title: String(r[3] || '').trim(),
            standard_days: Number(r[4]) || 26,
            actual_work_days,
            paid_leave_days,
            unpaid_leave_days: Number(r[7]) || 0,
            sick_leave_days: Number(r[8]) || 0,
            maternity_leave_days: Number(r[9]) || 0,
            total_paid_days: Number(r[10]) || (actual_work_days + paid_leave_days),
            ot_weekday_hours: Number(r[11]) || 0,
            ot_sunday_hours: Number(r[12]) || 0,
            late_early_count: Number(r[13]) || 0,
            note: String(r[14] || '').trim(),
          };
        });

      if (records.length > 0) {
        updatedData.timekeeping[month] = records;
        validation.details.push(`Đã cập nhật ${records.length} bản ghi chấm công kỳ ${month}`);
      }
    } else if (fileType === '04_Nghi_phep') {
      const reqSheet = workbook.Sheets['Theo_doi_don_nghi'] || workbook.Sheets[sheetNames[0]];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(reqSheet, { header: 1, defval: '' });
      const dataRows = rawRows.slice(4); // header is at row 4
      validation.dataRowCount = dataRows.length;

      const newRequests: LeaveRequest[] = dataRows
        .filter(r => r[0] && String(r[0]).startsWith('NP-'))
        .map(r => ({
          id: String(r[0] || '').trim(),
          employee_id: String(r[1] || '').trim(),
          name: String(r[2] || '').trim(),
          department: String(r[3] || '').trim(),
          leave_type: String(r[4] || '').trim(),
          from_date: String(r[5] || '').trim(),
          to_date: String(r[6] || '').trim(),
          days: Number(r[7]) || 1,
          reason: String(r[8] || '').trim(),
          approver: String(r[9] || '').trim(),
          status: String(r[10] || 'Chờ duyệt').trim(),
        }));

      if (newRequests.length > 0) {
        updatedData.leave_requests = newRequests;
        validation.details.push(`Đã cập nhật ${newRequests.length} đơn nghỉ phép 2026`);
      }
    } else if (fileType === '05_Bang_luong') {
      const month = extractMonthFromFileName(file.name);
      const sheet = workbook.Sheets[sheetNames[0]];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const dataRows = rawRows.slice(4, 54);
      validation.dataRowCount = dataRows.length;
      if (rawRows.length >= 55) {
        validation.excludedTotalRow = true;
        validation.details.push('Đã tự động loại bỏ dòng 55 (TỔNG CỘNG QUỸ LƯƠNG)');
      }

      const records: PayrollRecord[] = dataRows
        .filter(r => r[0] && String(r[0]).startsWith('TP'))
        .map(r => {
          const contract_salary = Number(r[4]) || 0;
          const work_days = Number(r[5]) || 0;
          const time_salary = Number(r[6]) || Math.round((contract_salary / 26) * work_days);
          const responsibility_allowance = Number(r[7]) || 0;
          const lunch_allowance = Number(r[8]) || 0;
          const ot_pay = Number(r[9]) || 0;
          const performance_bonus = Number(r[10]) || 0;
          const total_income = Number(r[11]) || (time_salary + responsibility_allowance + lunch_allowance + ot_pay + performance_bonus);
          const insurance_deduction = Number(r[12]) || 0;
          const pit = Number(r[13]) || 0;
          const net_salary = Number(r[14]) || (total_income - insurance_deduction - pit);

          return {
            month,
            employee_id: String(r[0] || '').trim(),
            name: String(r[1] || '').trim(),
            department: String(r[2] || '').trim(),
            title: String(r[3] || '').trim(),
            contract_salary,
            work_days,
            time_salary,
            responsibility_allowance,
            lunch_allowance,
            ot_pay,
            performance_bonus,
            total_income,
            insurance_deduction,
            pit,
            net_salary,
            note: String(r[15] || '').trim(),
          };
        });

      if (records.length > 0) {
        updatedData.payroll[month] = records;
        validation.details.push(`Đã cập nhật ${records.length} bảng lương kỳ ${month}`);
      }
    }
  } catch (err: any) {
    validation.isValid = false;
    validation.message = `Lỗi đọc file: ${err.message || String(err)}`;
    validation.details.push(String(err));
  }

  return { updatedData, validation };
}
