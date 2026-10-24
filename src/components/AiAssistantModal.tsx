import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Copy,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react';
import { AIAnalysisResult, SystemData } from '../types';
import { SkeletonShimmer } from './SkeletonShimmer';
import { copyTextToClipboard } from '../utils/exportTools';
import { formatVND } from '../utils/formatters';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemData: SystemData;
  analysisResult: AIAnalysisResult | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  initialQuery?: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  systemData,
  analysisResult,
  isAnalyzing,
  onRunAnalysis,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'ai'; text: string; time: string }>
  >([
    {
      sender: 'ai',
      text: 'Xin chào Ban Giám đốc và Phòng HCNS! Tôi là Trợ lý AI Quản trị Nhân sự & Tiền lương của Công ty A. Tôi có thể giúp phân tích biến động quỹ lương, rà soát nhân sự tăng ca bất thường, cảnh báo hợp đồng sắp hết hạn và đề xuất quyết định nhân sự tối ưu.',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!query.trim()) return;
    const userText = query.trim();
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setQuery('');

    // Answer questions intelligently based on systemData
    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('quỹ lương') || lower.includes('tổng lương') || lower.includes('chi phí')) {
        const pay09 = systemData.payroll['09/2026'] || [];
        const gross09 = pay09.reduce((a, b) => a + b.total_income, 0);
        const net09 = pay09.reduce((a, b) => a + b.net_salary, 0);
        reply = `Kỳ Tháng 09/2026, tổng quỹ lương (Tổng thu nhập) toàn công ty là **${formatVND(gross09)}**, trong đó Thực lĩnh chi trả qua ngân hàng là **${formatVND(net09)}**. Quỹ lương Xưởng Sản xuất chiếm tỷ trọng lớn nhất với 32.4%.`;
      } else if (lower.includes('hết hạn') || lower.includes('tái ký') || lower.includes('hợp đồng')) {
        reply = `Hiện tại có **2 Hợp đồng lao động sắp hết hạn trong vòng 30 ngày**:\n1. **TP0021 - Đinh Tuấn Anh** (Phòng Kinh doanh & Marketing, hết hạn 01/10/2026)\n2. **TP0035 - Đặng Minh Thịnh** (Xưởng Sản xuất, hết hạn 15/10/2026)\n\nKhuyến nghị: Phòng HCNS gửi thông báo nhắc nhở tái ký và chuẩn bị phụ lục gia hạn.`;
      } else if (lower.includes('thử việc') || lower.includes('chính thức')) {
        reply = `Có **2 nhân sự kết thúc 2 tháng thử việc** cần đánh giá ký chính thức:\n1. **TP0008 - Hoàng Thu Thảo** (Hành chính - Lễ tân)\n2. **TP0049 - Hoàng Văn Nam** (Công nhân sản xuất)\n\nVà 1 nhân sự đang trong thời gian thử việc đến 15/10/2026: **TP0023 - Nguyễn Mạnh An**.`;
      } else if (lower.includes('nghỉ phép') || lower.includes('chờ duyệt')) {
        reply = `Hệ thống ghi nhận **3 đơn xin nghỉ phép đang ở trạng thái Chờ duyệt**:\n- **NP-2026-0515**: TP0012 - Phan Thanh Hoa (Phòng Kế toán, nghỉ 2 ngày)\n- **NP-2026-0518**: TP0028 - Nguyễn Công Tuấn (Phòng Kỹ thuật, nghỉ 2 ngày)\n- **NP-2026-0520**: TP0040 - Nguyễn Văn Minh (Xưởng SX, nghỉ 2 ngày không lương)\n\nBạn có thể bấm vào mục 'Việc cần xử lý' để phê duyệt nhanh.`;
      } else if (lower.includes('ot') || lower.includes('tăng ca') || lower.includes('làm thêm')) {
        reply = `Top nhân sự tăng ca cao trong Tháng 09/2026:\n- **TP0044 - Hoàng Văn Cường** (Xưởng SX): 22 giờ OT\n- **TP0043 - Trần Văn Đức** (Xưởng SX): 20 giờ OT\n- **TP0029 - Vũ Hoàng Long** (Phòng KTCN): 18 giờ OT\n\nKhuyến nghị: Giám sát trần giờ làm thêm theo Điều 107 Bộ luật Lao động (tối đa 40h/tháng, 200h/năm).`;
      } else {
        reply = `Dựa trên dữ liệu 50 nhân sự và bảng lương Quý 3/2026, hệ thống hoạt động ổn định. Để có báo cáo tổng thể đầy đủ nhất, bạn có thể bấm nút **'⚡ Phân tích Quỹ lương bằng AI'** bên trên!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  const handleCopyReport = async () => {
    if (!analysisResult) return;
    const text = `
BÁO CÁO THAM MƯU QUỸ LƯƠNG & NHÂN SỰ BẰNG AI (CÔNG TY A)
Mô hình: ${analysisResult.model_used} | Thời gian: ${analysisResult.generated_at}

1. TỔNG QUAN:
${analysisResult.summary}

2. NHẬN XÉT BIẾN ĐỘNG TRỌNG TÂM:
${analysisResult.highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

3. DANH SÁCH NHÂN SỰ TĂNG CA BẤT THƯỜNG:
${analysisResult.ot_anomalies
  .map(
    (a) =>
      `- ${a.employee_id} - ${a.name} (${a.department}): ${a.ot_hours}h OT (Tiền OT: ${formatVND(a.ot_pay)}). Mức rủi ro: ${a.risk_level}. ${a.note}`
  )
  .join('\n')}

4. ĐỀ XUẤT HÀNH ĐỘNG CHO TRƯỞNG PHÒNG HCNS:
${analysisResult.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    `.trim();

    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-forest-800 via-forest-700 to-amber-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                Trợ lý AI Tham mưu Nhân sự & Quỹ lương
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-forest-900 font-extrabold uppercase">
                  Gemini Flash
                </span>
              </h3>
              <p className="text-xs text-slate-200">
                Phân tích dữ liệu 5 chiều: Hồ sơ, Hợp đồng, Chấm công, Nghỉ phép, Tiền lương
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-forest-800 hover:bg-amber-100 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAnalyzing ? 'Đang phân tích...' : '⚡ Phân tích lại'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 dark:bg-slate-950/40">
          {/* AI Comprehensive Analysis Card if available */}
          {isAnalyzing ? (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI đang quét đối soát dữ liệu và phân tích quỹ lương...</span>
              </div>
              <SkeletonShimmer className="h-4 w-3/4" />
              <SkeletonShimmer className="h-4 w-full" />
              <SkeletonShimmer className="h-4 w-5/6" />
            </div>
          ) : analysisResult ? (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>Báo cáo Tham mưu Quỹ lương & Rủi ro Nhân sự (AI Flash)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    Mô hình: {analysisResult.model_used} • {analysisResult.generated_at}
                  </span>
                  <button
                    onClick={handleCopyReport}
                    className="p-1.5 text-xs text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/50 rounded-lg flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Đã sao chép!' : 'Chép báo cáo'}</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/50 dark:border-amber-800/50">
                {analysisResult.summary}
              </p>

              {/* 3 Highlights */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  3 Nhận xét biến động quỹ lương đáng chú ý nhất:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {analysisResult.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* OT Anomalies */}
              {analysisResult.ot_anomalies?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Nhân sự tăng ca (OT) cao bất thường cần lưu ý:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {analysisResult.ot_anomalies.map((a, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                          <span>{a.employee_id} - {a.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                            {a.ot_hours}h OT ({formatVND(a.ot_pay)})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{a.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Đề xuất hành động cho Trưởng phòng Nhân sự & Ban Giám đốc:
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {analysisResult.recommendations.map((r, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-blue-900 dark:text-blue-300 flex items-start gap-2"
                    >
                      <span className="font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Interactive Chat Messages */}
          <div className="space-y-3 pt-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-forest-800 text-amber-300 flex items-center justify-center flex-shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 ${
                      msg.sender === 'user' ? 'text-amber-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi (Ví dụ: 'Ai tăng ca nhiều nhất?', 'Quỹ lương tháng 9 thế nào?')..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={handleSend}
              className="p-2.5 bg-forest-800 hover:bg-forest-700 text-white rounded-2xl shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
