'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, RotateCCw, ZoomIn, ZoomOut, Download, Box, ImageIcon, FileText } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { loadImage } from '@/engine/pdf-processor';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const BookPreview3D = dynamic(() => import('./BookPreview3D'), { ssr: false });

export default function PreviewFeature() {
  const { uploadedCover, measurements, setUploadedCover, bookConfig, setProcessing, isProcessing, processingMessage } = useAppStore();
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [dragActive, setDragActive] = useState(false);

  const handleCoverUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return;
    
    setProcessing(true, 'Processing cover image...');
    try {
      const result = await loadImage(file);
      setCoverUrl(result.dataUrl);
      setUploadedCover({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        dimensions: { width: result.width, height: result.height },
        dataUrl: result.dataUrl,
      });
    } catch (err) {
      console.error('Error loading cover:', err);
    } finally {
      setProcessing(false);
    }
  }, [setUploadedCover, setProcessing]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleCoverUpload(file);
  }, [handleCoverUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverUpload(file);
  }, [handleCoverUpload]);

  // If cover was already uploaded from checker
  useEffect(() => {
    if (uploadedCover?.dataUrl && !coverUrl) {
      setCoverUrl(uploadedCover.dataUrl);
    }
  }, [uploadedCover, coverUrl]);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Left Panel - Controls */}
      <div className="lg:w-80 shrink-0 space-y-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <h3 className="text-white/90 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
            <Box className="w-4 h-4" />
            3D Preview
          </h3>
          
          {/* Cover Upload */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Cover Image</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                dragActive 
                  ? 'border-white/30 bg-white/[0.05]' 
                  : coverUrl 
                    ? 'border-emerald-500/30 bg-emerald-500/[0.05]' 
                    : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {coverUrl ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <ImageIcon className="w-4 h-4" />
                  Cover loaded
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-5 h-5 mx-auto text-white/30" />
                  <p className="text-xs text-white/40">Drop cover image or click</p>
                </div>
              )}
            </div>
          </div>

          {/* Book Dimensions Display */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider">Book Dimensions</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/[0.03] rounded-lg p-2.5">
                <span className="text-white/40">Trim</span>
                <p className="text-white/80 font-medium">{measurements.trimWidthIn}" × {measurements.trimHeightIn}"</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2.5">
                <span className="text-white/40">Spine</span>
                <p className="text-white/80 font-medium">{measurements.spineWidthIn}"</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2.5">
                <span className="text-white/40">Bleed</span>
                <p className="text-white/80 font-medium">{measurements.bleedIn}"</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2.5">
                <span className="text-white/40">Pages</span>
                <p className="text-white/80 font-medium">{bookConfig.pageCount}</p>
              </div>
            </div>
          </div>

          {/* Controls Info */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider">Controls</label>
            <div className="text-xs text-white/40 space-y-1">
              <p>🖱️ Drag to rotate</p>
              <p>🔍 Scroll to zoom</p>
              <p>✋ Right-drag to pan</p>
            </div>
          </div>
        </div>

        {/* Processing overlay */}
        {isProcessing && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
              <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              {processingMessage}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - 3D Viewport */}
      <div className="flex-1 min-h-[400px] lg:min-h-0 bg-[#0a0a0f] rounded-2xl border border-white/[0.06] overflow-hidden relative">
        {coverUrl ? (
          <BookPreview3D
            coverUrl={coverUrl}
            spineWidth={measurements.spineWidthIn}
            trimWidth={measurements.trimWidthIn}
            trimHeight={measurements.trimHeightIn}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/20">
            <Box className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Upload a cover to preview</p>
            <p className="text-sm mt-1">Your book will appear here in realistic 3D</p>
          </div>
        )}
      </div>
    </div>
  );
}
