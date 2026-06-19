'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { motion } from 'framer-motion';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onClose: () => void;
}

export default function ImageCropperModal({ imageSrc, onCropComplete, onClose }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-container rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">crop</span>
              Crop Product Image
            </h2>
            <p className="text-xs text-outline font-medium mt-1">Adjust the image to fit a 1:1 square ratio.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-outline">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="relative w-full flex-1 bg-black/5 min-h-[350px] sm:min-h-[450px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Strict 1:1 Aspect Ratio
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            objectFit="contain"
          />
        </div>

        <div className="p-5 bg-white shrink-0">
          <div className="mb-6 max-w-sm mx-auto flex items-center gap-4">
            <span className="material-symbols-outlined text-outline">zoom_out</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value));
              }}
              className="flex-1 h-1.5 bg-outline-variant/40 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
            <span className="material-symbols-outlined text-outline">zoom_in</span>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-full font-bold text-sm text-primary bg-surface-container-low hover:bg-outline-variant/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className={`px-8 py-2.5 rounded-full font-bold text-sm text-white transition-all shadow-md flex items-center gap-2 ${
                isProcessing ? 'bg-secondary/70 cursor-wait' : 'bg-secondary hover:bg-primary active:scale-95 cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">check</span>
              )}
              {isProcessing ? 'Processing...' : 'Crop & Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
