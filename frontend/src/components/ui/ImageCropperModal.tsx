import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Crop, RotateCw, ZoomIn, ZoomOut, Check, SlidersHorizontal, Sparkles, RefreshCcw } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onApplyCrop: (croppedDataUrl: string) => void;
  title?: string;
}

type AspectRatioOption = {
  id: string;
  label: string;
  sublabel: string;
  ratio: number;
  badge?: string;
};

const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: 'original', label: 'Original', sublabel: 'Keep Full', ratio: 0, badge: 'Recommended' },
  { id: '16-10', label: '16:10', sublabel: 'Wide', ratio: 16 / 10 },
  { id: '4-3', label: '4:3', sublabel: 'Standard', ratio: 4 / 3 },
  { id: '1-1', label: '1:1', sublabel: 'Square', ratio: 1 / 1 },
  { id: '3-4', label: '3:4', sublabel: 'Portrait', ratio: 3 / 4 },
];

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onApplyCrop,
  title = 'Crop & Resize Photo',
}: ImageCropperModalProps) {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioOption>(ASPECT_RATIOS[0]);
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  // Reset transforms whenever a new image is loaded or modal opens
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setIsImageLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      setIsImageLoaded(true);
      setZoom(1.0);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Handle aspect ratio change
  const handleRatioChange = (ratioOption: AspectRatioOption) => {
    setSelectedRatio(ratioOption);
    setOffset({ x: 0, y: 0 });
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setOffset({ x: 0, y: 0 });
  };

  // Reset all adjustments
  const handleReset = () => {
    setZoom(1.0);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Render preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img || !isImageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine rotated natural dimensions
    const isSideways = rotation === 90 || rotation === 270;
    const effWidth = isSideways ? img.naturalHeight : img.naturalWidth;
    const effHeight = isSideways ? img.naturalWidth : img.naturalHeight;
    const activeRatio = selectedRatio.ratio > 0 ? selectedRatio.ratio : (effWidth / effHeight);

    // Viewport box dimensions
    const maxBoxWidth = 360;
    const maxBoxHeight = 240;
    let boxWidth = maxBoxWidth;
    let boxHeight = maxBoxWidth / activeRatio;

    if (boxHeight > maxBoxHeight) {
      boxHeight = maxBoxHeight;
      boxWidth = boxHeight * activeRatio;
    }

    // Set canvas display size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = boxWidth * dpr;
    canvas.height = boxHeight * dpr;
    canvas.style.width = `${boxWidth}px`;
    canvas.style.height = `${boxHeight}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, boxWidth, boxHeight);

    // Fill dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, boxWidth, boxHeight);

    // Calculate base scale to fill box
    const baseScale = Math.max(boxWidth / effWidth, boxHeight / effHeight);
    const currentScale = baseScale * zoom;

    // Draw transformed image
    ctx.save();
    ctx.translate(boxWidth / 2 + offset.x, boxHeight / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(currentScale, currentScale);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    // Draw Rule-of-Thirds Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;

    // Vertical third lines
    ctx.beginPath();
    ctx.moveTo(boxWidth / 3, 0);
    ctx.lineTo(boxWidth / 3, boxHeight);
    ctx.moveTo((boxWidth * 2) / 3, 0);
    ctx.lineTo((boxWidth * 2) / 3, boxHeight);

    // Horizontal third lines
    ctx.moveTo(0, boxHeight / 3);
    ctx.lineTo(boxWidth, boxHeight / 3);
    ctx.moveTo(0, (boxHeight * 2) / 3);
    ctx.lineTo(boxWidth, (boxHeight * 2) / 3);
    ctx.stroke();

    // Outer frame border
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, boxWidth, boxHeight);
  }, [isImageLoaded, selectedRatio, zoom, rotation, offset]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(3.0, Math.max(1.0, parseFloat((prev + delta).toFixed(2)))));
  };

  // Export cropped high-res image
  const handleApply = () => {
    const img = imageObjRef.current;
    if (!img) return;

    const isSideways = rotation === 90 || rotation === 270;
    const effWidth = isSideways ? img.naturalHeight : img.naturalWidth;
    const effHeight = isSideways ? img.naturalWidth : img.naturalHeight;
    const activeRatio = selectedRatio.ratio > 0 ? selectedRatio.ratio : (effWidth / effHeight);

    const maxDim = 1200;
    let targetWidth = 1200;
    let targetHeight = Math.round(1200 / activeRatio);
    if (targetHeight > maxDim) {
      targetHeight = maxDim;
      targetWidth = Math.round(maxDim * activeRatio);
    }

    const outCanvas = document.createElement('canvas');
    outCanvas.width = targetWidth;
    outCanvas.height = targetHeight;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    // Background fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Box dimensions on screen
    const maxBoxWidth = 360;
    const maxBoxHeight = 240;
    let boxWidth = maxBoxWidth;
    let boxHeight = maxBoxWidth / activeRatio;
    if (boxHeight > maxBoxHeight) {
      boxHeight = maxBoxHeight;
      boxWidth = boxHeight * activeRatio;
    }

    const scaleFactor = targetWidth / boxWidth;
    const baseScale = Math.max(boxWidth / effWidth, boxHeight / effHeight);
    const currentScale = baseScale * zoom;

    ctx.save();
    ctx.translate(targetWidth / 2 + offset.x * scaleFactor, targetHeight / 2 + offset.y * scaleFactor);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(currentScale * scaleFactor, currentScale * scaleFactor);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    const croppedDataUrl = outCanvas.toDataURL('image/jpeg', 0.88);
    onApplyCrop(croppedDataUrl);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 z-10 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>URGENIE Image Studio</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Crop className="h-5 w-5 text-blue-600" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Frame your photo perfectly so it doesn't get cut off on mobile or desktop ad cards.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
            Select Output Framing / Aspect Ratio:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {ASPECT_RATIOS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleRatioChange(option)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                  selectedRatio.id === option.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-black shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 font-bold hover:bg-slate-50'
                }`}
              >
                {option.badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[8px] font-extrabold uppercase tracking-tight">
                    Best
                  </span>
                )}
                <div className="text-xs">{option.label}</div>
                <div className="text-[9px] text-slate-400 font-medium truncate">{option.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Crop Area */}
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-950 rounded-2xl mb-4 overflow-hidden select-none">
          <div 
            className="relative cursor-grab active:cursor-grabbing touch-none flex items-center justify-center rounded-lg overflow-hidden shadow-inner"
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={handlePointerUp}
            onWheel={handleWheel}
          >
            <canvas ref={canvasRef} className="block rounded-lg shadow-lg" />
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 font-medium">
            <SlidersHorizontal className="h-3 w-3 text-blue-400" />
            <span>Drag image to reposition · Wheel or slider to zoom</span>
          </div>
        </div>

        {/* Adjustments: Zoom & Rotate Controls */}
        <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5">
          {/* Zoom Control */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1.0, parseFloat((prev - 0.1).toFixed(2))))}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />

            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3.0, parseFloat((prev + 0.1).toFixed(2))))}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-700 w-11 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Quick Buttons: Rotate & Reset */}
          <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5">
            <button
              type="button"
              onClick={handleRotate}
              className="btn btn-outline py-1.5 px-3 text-xs font-bold gap-1.5 rounded-xl text-slate-700 hover:bg-white"
            >
              <RotateCw className="h-3.5 w-3.5 text-blue-600" />
              <span>Rotate 90° ({rotation}°)</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 cursor-pointer"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline flex-1 py-2.5 text-xs font-bold rounded-xl"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleApply}
            className="btn btn-primary flex-1 py-2.5 text-xs font-black rounded-xl gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Check className="h-4 w-4" />
            <span>Apply Crop & Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
