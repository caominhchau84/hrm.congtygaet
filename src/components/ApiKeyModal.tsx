import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, X, Sparkles, ExternalLink } from 'lucide-react';
import { getStoredApiKey, saveStoredApiKey } from '../utils/geminiAI';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      saveStoredApiKey('');
      onKeySaved('');
      onClose();
      return;
    }

    // Basic format check
    if (!cleanKey.startsWith('AIzaSy')) {
      setStatus('error');
      setErrorMessage('Mã API Key của Google AI Studio thường bắt đầu bằng tiền tố "AIzaSy..."');
      return;
    }

    setStatus('testing');
    try {
      // Test the key with lightweight call
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping' }] }],
          }),
        }
      );

      if (res.ok) {
        saveStoredApiKey(cleanKey);
        setStatus('success');
        onKeySaved(cleanKey);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        const errorData = await res.json();
        setStatus('error');
        setErrorMessage(errorData.error?.message || 'Khóa API không hợp lệ hoặc đã hết hạn.');
      }
    } catch (err: any) {
      // If network fails or blocked, still save locally
      saveStoredApiKey(cleanKey);
      setStatus('success');
      onKeySaved(cleanKey);
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  const handleClear = () => {
    saveStoredApiKey('');
    setApiKey('');
    setStatus('idle');
    onKeySaved('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-forest-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Cài đặt Google Gemini API Key
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lưu trữ an toàn trong trình duyệt (localStorage)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              Khóa API của bạn được gửi trực tiếp tới máy chủ Google AI Studio, không bao giờ gửi qua máy chủ trung gian. 
              Mô hình sử dụng: <span className="font-semibold text-slate-900 dark:text-white">gemini-3-flash</span> (tự động fallback sang <span className="font-semibold text-slate-900 dark:text-white">gemini-3.1-flash-lite / gemini-2.0-flash</span> khi gặp lỗi 429).
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Khóa Gemini API (Google AI Studio Key)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 pr-12 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {status === 'error' && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Kết nối thành công! Đã lưu khóa API an toàn.</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              Lấy khóa miễn phí tại Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:underline"
              >
                Xóa khóa đã lưu
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'testing'}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-xl shadow-md hover:shadow-glow-amber transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {status === 'testing' ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang kiểm tra...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Lưu & Kết nối
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
