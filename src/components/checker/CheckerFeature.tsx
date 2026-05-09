'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileCheck, AlertTriangle, CheckCircle2, AlertCircle, XCircle, ChevronDown, Shield, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { loadPDF, loadImage, analyzePDF } from '@/engine/pdf-processor';
import { validateCover, validateManuscript, getOverallStatus, generateSummary } from '@/engine/validator';
import { ValidationCheck, ValidationReport, CheckStatus } from '@/types/kdp';
import { getStatusColor, getStatusBg, getStatusIcon } from '@/engine/kdp-constants';

// --- File Upload Zone ---
function UploadZone({ 
  label, 
  accept, 
  onFile, 
  isProcessing,
  fileName 
}: { 
  label: string; 
  accept: string; 
  onFile: (file: File) => void; 
  isProcessing: boolean;
  fileName?: string;
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
        dragActive
          ? 'border-emerald-500/40 bg-emerald-500/[0.05]'
          : fileName
            ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        className="hidden"
      />
      {isProcessing ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          <p className="text-sm text-white/50">Analyzing file...</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          <p className="text-sm text-emerald-400 font-medium">{fileName}</p>
          <p className="text-xs text-white/30">Click to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-white/20" />
          <p className="text-sm text-white/50">{label}</p>
          <p className="text-xs text-white/30">Drop file or click to browse</p>
        </div>
      )}
    </div>
  );
}

// --- Check Item ---
function CheckItem({ check }: { check: ValidationCheck }) {
  const [expanded, setExpanded] = useState(false);
  
  const IconComponent = {
    pass: CheckCircle2,
    safe: CheckCircle2,
    warning: AlertTriangle,
    risk: AlertCircle,
    fail: XCircle,
  }[check.status];

  const iconColor = {
    pass: 'text-emerald-400',
    safe: 'text-green-400',
    warning: 'text-amber-400',
    risk: 'text-orange-400',
    fail: 'text-red-400',
  }[check.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-3 ${getStatusBg(check.status)}`}
    >
      <button
        className="w-full flex items-center gap-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <IconComponent className={`w-4 h-4 shrink-0 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/80 font-medium">{check.name}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 mt-2 border-t border-white/[0.06] space-y-2">
              <p className="text-xs text-white/50">{check.description}</p>
              <p className="text-xs text-white/60">{check.message}</p>
              {check.suggestion && (
                <div className="flex gap-1.5 items-start bg-white/[0.03] rounded-md p-2">
                  <Shield className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-400/80">{check.suggestion}</p>
                </div>
              )}
              {check.value !== undefined && check.expected !== undefined && (
                <div className="flex gap-4 text-[10px] text-white/30">
                  <span>Actual: {typeof check.value === 'number' ? check.value.toFixed(3) : check.value}</span>
                  <span>Expected: {typeof check.expected === 'number' ? check.expected.toFixed(3) : check.expected}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Report Card ---
function ReportCard({ report }: { report: ValidationReport }) {
  const overallIcon = {
    pass: CheckCircle2,
    safe: CheckCircle2,
    warning: AlertTriangle,
    risk: AlertCircle,
    fail: XCircle,
  }[report.overallStatus];
  
  const overallColor = {
    pass: 'text-emerald-400',
    safe: 'text-green-400',
    warning: 'text-amber-400',
    risk: 'text-orange-400',
    fail: 'text-red-400',
  }[report.overallStatus];
  
  const statusCounts = {
    pass: report.checks.filter(c => c.status === 'pass').length,
    safe: report.checks.filter(c => c.status === 'safe').length,
    warning: report.checks.filter(c => c.status === 'warning').length,
    risk: report.checks.filter(c => c.status === 'risk').length,
    fail: report.checks.filter(c => c.status === 'fail').length,
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          {React.createElement(overallIcon, { className: `w-6 h-6 ${overallColor}` })}
          <div>
            <h3 className="text-white/90 font-semibold">{report.fileName}</h3>
            <p className="text-xs text-white/40">{report.fileType === 'cover' ? 'Cover File' : 'Manuscript File'}</p>
          </div>
        </div>
        
        {/* Status bar */}
        <div className="mt-3 flex gap-2">
          {Object.entries(statusCounts).map(([status, count]) => 
            count > 0 ? (
              <span key={status} className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBg(status)} ${getStatusColor(status)}`}>
                {count} {status.toUpperCase()}
              </span>
            ) : null
          )}
        </div>
        
        {/* Summary */}
        <p className="mt-3 text-sm text-white/60">{report.summary}</p>
      </div>
      
      {/* Checks */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {report.checks.map((check) => (
          <CheckItem key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}

// --- Main Checker Feature ---
export default function CheckerFeature() {
  const { 
    bookConfig, measurements, 
    setUploadedCover, setUploadedManuscript,
    uploadedCover, uploadedManuscript,
    validationReports, setValidationReports, clearValidationReports,
    setProcessing, isProcessing, processingMessage
  } = useAppStore();

  const [coverProcessing, setCoverProcessing] = useState(false);
  const [manuscriptProcessing, setManuscriptProcessing] = useState(false);

  const handleCoverUpload = useCallback(async (file: File) => {
    setCoverProcessing(true);
    clearValidationReports();
    
    try {
      if (file.type === 'application/pdf') {
        const result = await loadPDF(file);
        const analysis = analyzePDF(result.widthIn, result.heightIn, result.pageCount, result.pages);
        const checks = validateCover(analysis, bookConfig, measurements);
        const overallStatus = getOverallStatus(checks);
        const summary = generateSummary(checks);
        
        setUploadedCover({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          pageCount: result.pageCount,
          dimensions: { width: result.widthIn * 300, height: result.heightIn * 300 },
          dataUrl: result.pages[0]?.dataUrl,
        });
        
        setValidationReports([{
          fileId: crypto.randomUUID(),
          fileName: file.name,
          fileType: 'cover',
          checks,
          overallStatus,
          summary,
          timestamp: Date.now(),
        }]);
      } else {
        // Image file
        const result = await loadImage(file);
        const widthIn = result.width / 300;
        const heightIn = result.height / 300;
        const analysis = {
          widthIn,
          heightIn,
          pageCount: 1,
          hasBleed: false,
          dpi: 300,
          isGrayscale: false,
          hasTransparency: false,
          blankPages: [],
          pageWidths: [widthIn],
          pageHeights: [heightIn],
          imageResolutions: [],
        };
        const checks = validateCover(analysis, bookConfig, measurements);
        const overallStatus = getOverallStatus(checks);
        const summary = generateSummary(checks);
        
        setUploadedCover({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          dimensions: { width: result.width, height: result.height },
          dataUrl: result.dataUrl,
        });
        
        setValidationReports([{
          fileId: crypto.randomUUID(),
          fileName: file.name,
          fileType: 'cover',
          checks,
          overallStatus,
          summary,
          timestamp: Date.now(),
        }]);
      }
    } catch (err) {
      console.error('Error analyzing cover:', err);
      setValidationReports([{
        fileId: crypto.randomUUID(),
        fileName: file.name,
        fileType: 'cover',
        checks: [{
          id: 'error',
          category: 'general',
          name: 'Analysis Error',
          description: 'Could not analyze the uploaded file',
          status: 'fail',
          message: `Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}. Please ensure the file is a valid PDF or image.`,
        }],
        overallStatus: 'fail',
        summary: 'Could not analyze the uploaded file.',
        timestamp: Date.now(),
      }]);
    } finally {
      setCoverProcessing(false);
    }
  }, [bookConfig, measurements, setUploadedCover, setValidationReports, clearValidationReports]);

  const handleManuscriptUpload = useCallback(async (file: File) => {
    setManuscriptProcessing(true);
    clearValidationReports();
    
    try {
      if (file.type === 'application/pdf') {
        const result = await loadPDF(file);
        const analysis = analyzePDF(result.widthIn, result.heightIn, result.pageCount, result.pages);
        const checks = validateManuscript(analysis, bookConfig, measurements);
        const overallStatus = getOverallStatus(checks);
        const summary = generateSummary(checks);
        
        setUploadedManuscript({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          pageCount: result.pageCount,
          dimensions: { width: result.widthIn * 300, height: result.heightIn * 300 },
        });
        
        setValidationReports([{
          fileId: crypto.randomUUID(),
          fileName: file.name,
          fileType: 'manuscript',
          checks,
          overallStatus,
          summary,
          timestamp: Date.now(),
        }]);
      }
    } catch (err) {
      console.error('Error analyzing manuscript:', err);
      setValidationReports([{
        fileId: crypto.randomUUID(),
        fileName: file.name,
        fileType: 'manuscript',
        checks: [{
          id: 'error',
          category: 'general',
          name: 'Analysis Error',
          description: 'Could not analyze the uploaded manuscript',
          status: 'fail',
          message: `Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}.`,
        }],
        overallStatus: 'fail',
        summary: 'Could not analyze the uploaded manuscript.',
        timestamp: Date.now(),
      }]);
    } finally {
      setManuscriptProcessing(false);
    }
  }, [bookConfig, measurements, setUploadedManuscript, setValidationReports, clearValidationReports]);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Left Panel - Upload */}
      <div className="lg:w-80 shrink-0 space-y-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h3 className="text-white/90 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Format Checker
          </h3>
          
          <UploadZone
            label="Upload Cover (PDF, PNG, JPG)"
            accept=".pdf,.png,.jpg,.jpeg"
            onFile={handleCoverUpload}
            isProcessing={coverProcessing}
            fileName={uploadedCover?.name}
          />
          
          <UploadZone
            label="Upload Manuscript (PDF)"
            accept=".pdf"
            onFile={handleManuscriptUpload}
            isProcessing={manuscriptProcessing}
            fileName={uploadedManuscript?.name}
          />

          <div className="text-xs text-white/30 space-y-1">
            <p>• Cover: PDF, PNG, or JPG up to 650MB</p>
            <p>• Manuscript: PDF only</p>
            <p>• Checks: dimensions, bleed, spine, margins, resolution</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {validationReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/20 py-20">
            <Shield className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Upload a file to check</p>
            <p className="text-sm mt-1">We&apos;ll analyze it against KDP requirements</p>
          </div>
        ) : (
          validationReports.map((report) => (
            <ReportCard key={report.fileId} report={report} />
          ))
        )}
      </div>
    </div>
  );
}
