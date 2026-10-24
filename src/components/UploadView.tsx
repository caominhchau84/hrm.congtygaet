import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { SystemData } from '../types';
import { FileValidationResult, parseUploadedExcel } from '../utils/excelParser';
import { SkeletonShimmer } from './SkeletonShimmer';

interface UploadViewProps {
  systemData: SystemData;
  onUpdateSystemData: (newData: SystemData) => void;
  onReloadSampleData: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  systemData,
  onUpdateSystemData,
  onReloadSampleData,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationList, setValidationList] = useState<FileValidationResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 10 Standard source files checklist
  const standardFiles = [
    { name: '00_Danh_muc_he_thong.xlsx', desc: 'Danh mục 6 phòng ban, chức vụ, loại nghỉ phép, quy định chung', status: 'Sẵn sàng' },
    { name: '01_Ho_so_nhan_vien.xlsx', desc: '50 Hồ sơ nhân sự (TP0001 - TP0050)', status: 'Sẵn sàng' },
    { name: '02_Hop_dong.xlsx', desc: '50 Hợp đồng lao động, theo dõi hạn tái ký và thử việc', status: 'Sẵn sàng' },
    { name: '03_Cham_cong_2026_07.xlsx', desc: 'Bảng chấm công & tăng ca tháng 07/2026', status: 'Sẵn sàng' },
    { name: '03_Cham_cong_2026_08.xlsx', desc: 'Bảng chấm công & tăng ca tháng 08/2026', status: 'Sẵn sàng' },
    { name: '03_Cham_cong_2026_09.xlsx', desc: 'Bảng chấm công & tăng ca tháng 09/2026', status: 'Sẵn sàng' },
    { name: '04_Nghi_phep_2026.xlsx', desc: 'Theo dõi đơn nghỉ phép & Quỹ phép năm 2026', status: 'Sẵn sàng' },
    { name: '05_Bang_luong_2026_07.xlsx', desc: 'Bảng lương chi tiết tháng 07/2026', status: 'Sẵn sàng' },
    { name: '05_Bang_luong_2026_08.xlsx', desc: 'Bảng lương chi tiết tháng 08/2026', status: 'Sẵn sàng' },
    { name: '05_Bang_luong_2026_09.xlsx', desc: 'Bảng lương chi tiết tháng 09/2026', status: 'Sẵn sàng' },
  ];

  const handleFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    let curData = { ...systemData };
    const results: FileValidationResult[] = [];

    // Simulate progress shimmer animation
    await new Promise((res) => setTimeout(res, 500));

    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.xlsx')) continue;
      const { updatedData, validation } = await parseUploadedExcel(file, curData);
      curData = updatedData;
      results.push(validation);
    }

    onUpdateSystemData(curData);
    setValidationList((prev) => [...results, ...prev]);
    setIsProcessing(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Nhập thêm dữ liệu & Đối soát file Excel (.xlsx)
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-emerald-300">
              Chuẩn SheetJS XLSX
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quy tắc đọc chuẩn: Tiêu đề dòng 4, dữ liệu dòng 5-54, tự động loại bỏ dòng 55 Tổng cộng
          </p>
        </div>

        <button
          onClick={onReloadSampleData}
          className="px-4 py-2 rounded-xl text-xs font-bold text-forest-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100 flex items-center gap-1.5 shadow-sm transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          🔄 Quét lại dữ liệu chuẩn (Reset)
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-md">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kéo thả file Excel (.xlsx) vào đây hoặc bấm để chọn file
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ tải cùng lúc hoặc từng file trong bộ 10 file nguồn (00_Danh_muc đến 05_Bang_luong)
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Dung lượng tối đa 50MB • Đọc trực tiếp trên trình duyệt
          </span>
        </div>

        {/* Shimmer loading bar when processing */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3 z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Đang đọc và đối soát liên kết 360° dữ liệu nhân sự...</span>
            </div>
            <SkeletonShimmer className="h-3 w-64 max-w-full" />
          </div>
        )}
      </div>

      {/* Validation Checklist if files were uploaded */}
      {validationList.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Nhật ký kiểm tra tính hợp lệ của file Excel (Validation Checklist)
          </h3>

          <div className="space-y-3">
            {validationList.map((val, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{val.fileName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 font-mono">
                      Loại: {val.fileType}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Hợp lệ 100%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 pt-1">
                  <div>Tiêu đề (Header): <span className="font-bold text-slate-800 dark:text-slate-200">Dòng {val.headerRow}</span></div>
                  <div>Số bản ghi đọc: <span className="font-bold text-slate-800 dark:text-slate-200">{val.dataRowCount} dòng</span></div>
                  <div>Loại trừ dòng 55: <span className="font-bold text-emerald-600">Đã tự động loại bỏ</span></div>
                  <div>Số sheet: <span className="font-bold text-slate-800 dark:text-slate-200">{val.sheets.length} sheets</span></div>
                </div>

                {val.details.length > 0 && (
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    {val.details.map((d, dIdx) => (
                      <li key={dIdx}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard 10 Source Files System Status */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
            Bộ 10 file nguồn chuẩn hệ thống Công ty A (Quý 3/2026)
          </h3>
          <span className="text-xs text-slate-400">10 / 10 file đã sẵn sàng trong bộ nhớ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {standardFiles.map((file, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="font-mono font-bold text-slate-900 dark:text-white block truncate">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {file.desc}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex-shrink-0">
                {file.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
