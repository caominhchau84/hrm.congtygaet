import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { Employee, PayrollRecord, Contract } from '../types';
import { formatVND, formatDateVN } from './formatters';

// 1. Export Excel for filtered records
export function exportTableToExcel(data: any[], fileName: string, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

// 2. Google Calendar Reminder Link
export function createGoogleCalendarUrl(
  title: string,
  details: string,
  dateStr: string,
  location = 'Công ty A'
): string {
  // Convert dateStr (e.g. 2026-10-15) to YYYYMMDDTHHMMSSZ
  let start = '20261015T020000Z'; // default 9:00 AM VN (UTC+7 -> 02:00 UTC)
  let end = '20261015T030000Z';
  try {
    const clean = dateStr.replace(/-/g, '');
    if (clean.length === 8) {
      start = `${clean}T020000Z`;
      end = `${clean}T030000Z`;
    }
  } catch {
    // fallback
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details,
    dates: `${start}/${end}`,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// 3. Gmail Compose Link
export function createGmailComposeUrl(
  toEmail: string,
  subject: string,
  body: string
): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: toEmail,
    su: subject,
    body: body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

// 4. Copy to Clipboard with toast
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  }
}

// 5. Generate Word Document (.docx) for Employee Payslip
export async function exportPayslipToWord(
  emp: Employee,
  pay: PayrollRecord,
  companyName = 'CÔNG TY A'
) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: companyName.toUpperCase(),
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `PHIẾU LƯƠNG CHI TIẾT - THÁNG ${pay.month}`,
                bold: true,
                size: 32,
                color: '0F291E',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Mã nhân viên: `, bold: true }),
              new TextRun(emp.id),
              new TextRun({ text: `    |    Họ và tên: `, bold: true }),
              new TextRun(emp.name),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Phòng ban: `, bold: true }),
              new TextRun(emp.department),
              new TextRun({ text: `    |    Chức danh: `, bold: true }),
              new TextRun(emp.title),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Số tài khoản: `, bold: true }),
              new TextRun(`${emp.bank_account} (${emp.bank_name})`),
              new TextRun({ text: `    |    Mã số BHXH: `, bold: true }),
              new TextRun(emp.social_insurance_code),
            ],
            spacing: { after: 300 },
          }),

          // Table of Salary Items
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'KHOẢN MỤC', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'SỐ TIỀN (VNĐ)', bold: true })], alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('1. Mức lương HĐ / Lương đóng BH')] }),
                  new TableCell({ children: [new Paragraph({ text: formatVND(pay.contract_salary), alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`2. Lương thời gian thực tế (${pay.work_days} công)`)] }),
                  new TableCell({ children: [new Paragraph({ text: formatVND(pay.time_salary), alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('3. Phụ cấp trách nhiệm')] }),
                  new TableCell({ children: [new Paragraph({ text: formatVND(pay.responsibility_allowance), alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('4. Phụ cấp ăn trưa')] }),
                  new TableCell({ children: [new Paragraph({ text: formatVND(pay.lunch_allowance), alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('5. Tiền làm thêm giờ (OT)')] }),
                  new TableCell({ children: [new Paragraph({ text: formatVND(pay.ot_pay), alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('6. Thưởng hiệu quả')] }),
                  new TableCell({ children: [new Paragraph({ text: formatVND(pay.performance_bonus), alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'TỔNG THU NHẬP (A)', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatVND(pay.total_income), bold: true })], alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('7. Trừ BHXH, BHYT, BHTN (10.5%)')] }),
                  new TableCell({ children: [new Paragraph({ text: `-${formatVND(pay.insurance_deduction)}`, alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('8. Trừ thuế thu nhập cá nhân (TNCN)')] }),
                  new TableCell({ children: [new Paragraph({ text: `-${formatVND(pay.pit)}`, alignment: AlignmentType.RIGHT })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'THỰC LĨNH CHUYỂN KHOẢN (B = A - Trừ)', bold: true, color: 'D97706' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatVND(pay.net_salary), bold: true, size: 28, color: 'D97706' })], alignment: AlignmentType.RIGHT })] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '\nNgày lập phiếu: ', italics: true }),
              new TextRun({ text: new Date().toLocaleDateString('vi-VN'), italics: true }),
            ],
            spacing: { before: 300, after: 300 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'NGƯỜI LẬP BIỂU', bold: true })], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [new TextRun({ text: '(Ký, ghi rõ họ tên)', italics: true })], alignment: AlignmentType.CENTER }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'KẾ TOÁN TRƯỞNG', bold: true })], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [new TextRun({ text: '(Ký, ghi rõ họ tên)', italics: true })], alignment: AlignmentType.CENTER }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'NGƯỜI NHẬN LƯƠNG', bold: true })], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [new TextRun({ text: '(Ký xác nhận)', italics: true })], alignment: AlignmentType.CENTER }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Phieu_luong_${emp.id}_${pay.month.replace('/', '_')}.docx`);
}

// 6. Generate Word Document (.docx) for Probation Evaluation Report (Tờ trình đánh giá thử việc)
export async function exportProbationEvaluationToWord(
  emp: Employee,
  contract: Contract,
  companyName = 'CÔNG TY A'
) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: companyName.toUpperCase(),
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: companyName.toUpperCase(), bold: true, size: 24 })],
          }),
          new Paragraph({
            text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc',
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'TỜ TRÌNH ĐÁNH GIÁ KẾT QUẢ THỬ VIỆC VÀ ĐỀ XUẤT KÝ HỢP ĐỒNG LAO ĐỘNG',
                bold: true,
                size: 28,
                color: '0F291E',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            text: 'Kính gửi: TỔNG GIÁM ĐỐC CÔNG TY A',
            children: [new TextRun({ text: 'Kính gửi: TỔNG GIÁM ĐỐC CÔNG TY A', bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `Căn cứ Hợp đồng thử việc số ${contract.contract_number} ký ngày ${formatDateVN(contract.sign_date)};`,
          }),
          new Paragraph({
            text: `Căn cứ báo cáo đánh giá thử việc 02 tháng của Trưởng bộ phận ${emp.department};`,
          }),
          new Paragraph({
            text: `Phòng Hành chính - Nhân sự xin kính trình Ban Giám đốc kết quả đánh giá đối với nhân sự:`,
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `1. Họ và tên: `, bold: true }),
              new TextRun(`${emp.name}    |   Mã NV: ${emp.id}`),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `2. Vị trí công việc: `, bold: true }),
              new TextRun(`${emp.title} - ${emp.department}`),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `3. Thời gian thử việc: `, bold: true }),
              new TextRun(`Từ ${formatDateVN(contract.effective_date)} đến ${formatDateVN(contract.expiration_date)} (02 tháng)`),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `4. Nhận xét kết quả: `, bold: true }),
              new TextRun('Nhân sự hoàn thành xuất sắc các chỉ tiêu công việc được giao, tuân thủ nghiêm túc nội quy công ty, có tinh thần trách nhiệm cao và hòa nhập tốt với tập thể.'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `5. Đề xuất của Phòng HCNS: `, bold: true }),
              new TextRun(`Ký kết HỢP ĐỒNG LAO ĐỘNG XÁC ĐỊNH THỜI HẠN 01 NĂM, mức lương chính thức 100% theo thang bảng lương, có hiệu lực từ ngày kế tiếp ngày hết hạn thử việc.`),
            ],
            spacing: { before: 150, after: 300 },
          }),
          new Paragraph({
            text: 'Kính trình Tổng Giám đốc xem xét phê duyệt./.',
            spacing: { after: 400 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'TRƯỞNG PHÒNG HCNS', bold: true })], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [new TextRun({ text: '(Ký, họ tên)', italics: true })], alignment: AlignmentType.CENTER }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'TỔNG GIÁM ĐỐC PHÊ DUYỆT', bold: true })], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [new TextRun({ text: '(Ký, đóng dấu)', italics: true })], alignment: AlignmentType.CENTER }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `To_trinh_danh_gia_thu_viec_${emp.id}.docx`);
}
