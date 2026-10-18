import React, { useState } from "react";
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  Film,
  Archive,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ProjectData } from "../types";
import {
  exportProductionBundle,
  printStoryboardBinder,
  generateCSV,
  generateEDL,
} from "../utils/exportUtils";

interface ExportProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
}

export const ExportProductionModal: React.FC<ExportProductionModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [isBundling, setIsBundling] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  if (!isOpen) return null;

  const handleZipExport = async () => {
    setIsBundling(true);
    setDownloadDone(false);
    try {
      await exportProductionBundle(project);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to create production zip bundle.");
    } finally {
      setIsBundling(false);
    }
  };

  const handlePrintBinder = () => {
    printStoryboardBinder(project);
  };

  const handleDownloadCsv = () => {
    const csvContent = generateCSV(project);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_ShotList.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadEdl = () => {
    const edlContent = generateEDL(project);
    const blob = new Blob([edlContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Timeline.edl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Export Storyboards for Video Production</h2>
              <p className="text-xs text-neutral-400">
                Industry-standard production binder, NLE timelines, shot lists, and high-res frames
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="p-6 space-y-4 text-xs">
          {/* Primary Recommended: Full Production Bundle ZIP */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-neutral-950 to-neutral-950 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 font-black flex items-center justify-center shrink-0 shadow-md">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-neutral-100">
                  <span>Complete Video Production ZIP Package</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-neutral-400 text-[11px] mt-1 leading-relaxed">
                  Contains all 9:16 high-resolution storyboard image files ({project.selectedImageSize}), EDL timeline for Premiere/DaVinci, production shot list CSV, Character Bible, and JSON metadata.
                </p>
              </div>
            </div>

            <button
              id="btn-download-production-zip"
              type="button"
              onClick={handleZipExport}
              disabled={isBundling}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center gap-2 shrink-0 shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {isBundling ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Packaging ZIP...</span>
                </>
              ) : downloadDone ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Package</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Printable PDF Director Binder */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 mb-2">
                  <Printer className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-neutral-200">Director Binder (PDF)</div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Print-ready presentation with 10s cards, dialogue, camera movements & character bible.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrintBinder}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                Print / Save PDF
              </button>
            </div>

            {/* Shot List CSV */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-emerald-400 mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-neutral-200">Production Shot List (.CSV)</div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Structured spreadsheet of camera setups, lighting, cliffhangers & audio cues for line producers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                Download CSV
              </button>
            </div>

            {/* NLE Edit Decision List (EDL) */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-blue-400 mb-2">
                  <Film className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-neutral-200">NLE Timeline (.EDL)</div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Import directly into Premiere Pro, Final Cut Pro, or DaVinci Resolve with 10s cuts.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadEdl}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                Download EDL
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
