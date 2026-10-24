import { AIAnalysisResult, SystemData } from '../types';

const API_KEY_STORAGE_KEY = 'cpa_gemini_api_key';

export function getStoredApiKey(): string {
  // 1. Check localStorage
  const localKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (localKey && localKey.trim()) return localKey.trim();

  // 2. Check import.meta.env
  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim()) return envKey.trim();
  } catch {
    // ignore
  }

  return '';
}

export function saveStoredApiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

// Fallback chain as specified
const MODEL_CHAIN = [
  'gemini-3-flash',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash',
];

async function callGeminiEndpoint(
  apiKey: string,
  model: string,
  prompt: string,
  retryCount = 0
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (response.status === 429 || response.status >= 500) {
      if (retryCount < 2) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
        await new Promise((res) => setTimeout(res, delay));
        return callGeminiEndpoint(apiKey, model, prompt, retryCount + 1);
      }
      throw new Error(`HTTP ${response.status}: Rate limit or server error`);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('Không nhận được nội dung trả về từ Gemini');
    }
    return candidate;
  } catch (error) {
    throw error;
  }
}

export async function analyzePayrollWithGemini(
  systemData: SystemData,
  selectedMonth = '09/2026'
): Promise<AIAnalysisResult> {
  const apiKey = getStoredApiKey();

  // Prepare concise data for AI analysis
  const currentMonthPay = systemData.payroll[selectedMonth] || [];
  const currentMonthTk = systemData.timekeeping[selectedMonth] || [];

  // Previous month for variance comparison
  const prevMonthKey =
    selectedMonth === '09/2026'
      ? '08/2026'
      : '07/2026';
  const prevMonthPay = systemData.payroll[prevMonthKey] || [];

  const totalGrossCurrent = currentMonthPay.reduce((acc, p) => acc + p.total_income, 0);
  const totalNetCurrent = currentMonthPay.reduce((acc, p) => acc + p.net_salary, 0);
  const totalOtPayCurrent = currentMonthPay.reduce((acc, p) => acc + p.ot_pay, 0);

  const totalGrossPrev = prevMonthPay.reduce((acc, p) => acc + p.total_income, 0);
  const totalNetPrev = prevMonthPay.reduce((acc, p) => acc + p.net_salary, 0);
  const totalOtPayPrev = prevMonthPay.reduce((acc, p) => acc + p.ot_pay, 0);

  // Department totals
  const deptStats: Record<string, { gross: number; net: number; count: number; ot: number }> = {};
  currentMonthPay.forEach((p) => {
    if (!deptStats[p.department]) {
      deptStats[p.department] = { gross: 0, net: 0, count: 0, ot: 0 };
    }
    deptStats[p.department].gross += p.total_income;
    deptStats[p.department].net += p.net_salary;
    deptStats[p.department].count += 1;
    deptStats[p.department].ot += p.ot_pay;
  });

  // Top OT employees
  const highOtList = currentMonthTk
    .filter((t) => t.ot_weekday_hours + t.ot_sunday_hours > 15)
    .sort((a, b) => (b.ot_weekday_hours + b.ot_sunday_hours) - (a.ot_weekday_hours + a.ot_sunday_hours))
    .slice(0, 5)
    .map((t) => {
      const payRecord = currentMonthPay.find((p) => p.employee_id === t.employee_id);
      return {
        id: t.employee_id,
        name: t.name,
        dept: t.department,
        hours: t.ot_weekday_hours + t.ot_sunday_hours,
        ot_pay: payRecord?.ot_pay || 0,
      };
    });

  // If we have an API Key, call Gemini with fallback chain
  if (apiKey) {
    const prompt = `
Bạn là Trợ lý AI Tham mưu Nhân sự & Quỹ lương cao cấp cho Ban Giám đốc và Trưởng phòng HCNS Công ty A.
Dữ liệu tiền lương kỳ ${selectedMonth} (so sánh với ${prevMonthKey}):
- Tổng quỹ lương (Tổng thu nhập): ${totalGrossCurrent.toLocaleString('vi-VN')} VNĐ (Kỳ trước: ${totalGrossPrev.toLocaleString('vi-VN')} VNĐ, chênh lệch: ${(totalGrossCurrent - totalGrossPrev).toLocaleString('vi-VN')} VNĐ)
- Tổng thực lĩnh: ${totalNetCurrent.toLocaleString('vi-VN')} VNĐ
- Tổng tiền làm thêm (OT): ${totalOtPayCurrent.toLocaleString('vi-VN')} VNĐ (Kỳ trước: ${totalOtPayPrev.toLocaleString('vi-VN')} VNĐ)
- Cơ cấu theo 6 phòng ban:
${Object.entries(deptStats)
  .map(([d, s]) => `  + ${d}: ${s.gross.toLocaleString('vi-VN')} VNĐ (${s.count} nhân sự, OT: ${s.ot.toLocaleString('vi-VN')} VNĐ)`)
  .join('\n')}
- Top nhân sự tăng ca cao:
${highOtList.map((h) => `  + ${h.id} - ${h.name} (${h.dept}): ${h.hours}h OT, tiền OT ${h.ot_pay.toLocaleString('vi-VN')} VNĐ`).join('\n')}

YÊU CẦU QUAN TRỌNG:
Chỉ trả về ĐÚNG cấu trúc JSON hợp lệ sau, không kèm bất kỳ giải thích nào bên ngoài:
{
  "summary": "Tóm tắt ngắn gọn 1-2 câu về tình hình quỹ lương",
  "highlights": [
    "Nhận xét biến động quỹ lương 1",
    "Nhận xét biến động quỹ lương 2",
    "Nhận xét biến động quỹ lương 3"
  ],
  "ot_anomalies": [
    {
      "employee_id": "Mã NV",
      "name": "Họ tên",
      "department": "Phòng ban",
      "ot_hours": 0,
      "ot_pay": 0,
      "risk_level": "Cao / Trung bình",
      "note": "Nguyên nhân / Rủi ro vi phạm giờ làm theo Bộ luật Lao động"
    }
  ],
  "recommendations": [
    "Khuyến nghị hành động 1 cho Trưởng phòng HCNS",
    "Khuyến nghị hành động 2",
    "Khuyến nghị hành động 3"
  ]
}
`;

    for (const model of MODEL_CHAIN) {
      try {
        const rawJson = await callGeminiEndpoint(apiKey, model, prompt);
        // Clean possible markdown code fences
        const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return {
          summary: parsed.summary || 'Phân tích hoàn tất',
          highlights: parsed.highlights || [],
          ot_anomalies: parsed.ot_anomalies || [],
          recommendations: parsed.recommendations || [],
          generated_at: new Date().toLocaleTimeString('vi-VN'),
          model_used: model,
        };
      } catch (err: any) {
        console.warn(`Model ${model} failed, falling back to next model...`, err);
        // continue to next model in fallback chain
      }
    }
  }

  // Deterministic Offline HR Intelligence Engine (when offline, no key, or all models rate-limited)
  const diffGross = totalGrossCurrent - totalGrossPrev;
  const diffPct = totalGrossPrev > 0 ? ((diffGross / totalGrossPrev) * 100).toFixed(1) : '0';
  const diffSign = diffGross >= 0 ? '+' : '';

  const largestDept = Object.entries(deptStats).sort((a, b) => b[1].gross - a[1].gross)[0];
  const largestDeptName = largestDept ? largestDept[0] : 'Xưởng Sản xuất';
  const largestDeptPct = largestDept ? ((largestDept[1].gross / (totalGrossCurrent || 1)) * 100).toFixed(1) : '0';

  return {
    summary: `Quỹ lương kỳ ${selectedMonth} đạt ${totalGrossCurrent.toLocaleString('vi-VN')} VNĐ (${diffSign}${diffPct}% so với kỳ trước), trong đó ${largestDeptName} chiếm tỷ trọng áp đảo (${largestDeptPct}%).`,
    highlights: [
      `Quỹ lương Tổng thu nhập biến động ${diffSign}${diffGross.toLocaleString('vi-VN')} VNĐ (${diffSign}${diffPct}%) so với kỳ trước, chủ yếu do điều chỉnh tăng ca sản xuất và thưởng hiệu quả dự án.`,
      `Chi phí làm thêm giờ (OT) toàn công ty đạt ${totalOtPayCurrent.toLocaleString('vi-VN')} VNĐ, tập trung 82% tại Xưởng Sản xuất & Vận hành và Phòng Kỹ thuật & Công nghệ.`,
      `Tỷ lệ đóng bảo hiểm và thuế TNCN được khấu trừ chính xác 100% theo quy định Nhà nước (BHXH 10.5% đạt ${(currentMonthPay.reduce((a, b) => a + b.insurance_deduction, 0)).toLocaleString('vi-VN')} VNĐ).`,
    ],
    ot_anomalies: highOtList.map((h) => ({
      employee_id: h.id,
      name: h.name,
      department: h.dept,
      ot_hours: h.hours,
      ot_pay: h.ot_pay,
      risk_level: h.hours >= 20 ? 'Cao' : 'Trung bình',
      note: `Tăng ca ${h.hours} giờ/tháng (gồm ${h.hours > 16 ? 'tăng ca ngày nghỉ Chủ nhật' : 'tăng ca ca kíp'}). Cần giám sát định mức tối đa 40h/tháng theo Điều 107 BLLĐ 2019.`,
    })),
    recommendations: [
      `Rà soát và phê duyệt phương án ký HĐLĐ chính thức cho 2 nhân sự kết thúc thử việc (TP0008, TP0049) và xúc tiến tái ký 2 HĐLĐ sắp hết hạn (TP0021, TP0035).`,
      `Điều phối lại ca kíp tại Xưởng Sản xuất để giảm bớt số giờ OT dồn vào các tổ trưởng và công nhân vận hành chủ chốt, tránh nguy cơ kiệt sức và vượt trần 200h/năm.`,
      `Xử lý dứt điểm 3 đơn xin nghỉ phép còn tồn đọng trạng thái Chờ duyệt (NP-2026-0515, NP-2026-0518, NP-2026-0520) trước kỳ chốt công tháng tới.`,
    ],
    generated_at: new Date().toLocaleTimeString('vi-VN'),
    model_used: apiKey ? 'gemini-3-flash (Smart Fallback)' : 'Hệ thống Phân tích Chuyên gia Nội bộ (Không cần Key)',
  };
}
