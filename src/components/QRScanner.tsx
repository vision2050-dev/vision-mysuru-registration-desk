'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Volume2, VolumeX, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isProcessing?: boolean;
}

export default function QRScanner({ onScanSuccess, isProcessing = false }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'qr-reader-container';

  // Audio tone synthesizer using Web Audio API
  const playAudioTone = useCallback(
    (type: 'success' | 'alert' | 'error') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'success') {
          // Pleasant high double chime
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08);

          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.25);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(ctx.currentTime);
          osc1.stop(ctx.currentTime + 0.08);
          osc2.start(ctx.currentTime + 0.08);
          osc2.stop(ctx.currentTime + 0.25);
        } else {
          // Warning tone
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          osc.frequency.setValueAtTime(160, ctx.currentTime + 0.12);

          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (e) {
        console.warn('Audio tone error:', e);
      }
    },
    [soundEnabled]
  );

  // Discover available camera devices
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setCameraError('No camera detected on this device.');
        }
      })
      .catch((err) => {
        console.warn('Camera enumeration error:', err);
        setCameraError('Camera access not granted. Use manual search/code entry below.');
      });

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (cameraId?: string) => {
    const targetCamera = cameraId || selectedCameraId;
    if (!targetCamera) return;

    setCameraError(null);

    try {
      if (scannerRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        targetCamera,
        {
          fps: 15,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (isProcessing) return;
          if (lastScanned === decodedText) return;

          setLastScanned(decodedText);
          playAudioTone('success');
          onScanSuccess(decodedText);

          setTimeout(() => {
            setLastScanned(null);
          }, 2400);
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setCameraError(err.message || 'Failed to start camera.');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleToggleCamera = () => {
    if (isScanning) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    if (isScanning) {
      startCamera(newId);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300'
            }`}
          />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
            Camera QR Scanner
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
            className="p-1.5 text-[var(--text-subtle)] hover:text-[var(--text)] rounded-md hover:bg-[var(--surface-2)] transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#b07c12]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Start/Stop Camera */}
          <button
            type="button"
            onClick={handleToggleCamera}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isScanning
                ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                : 'bg-[#8f1b1b] hover:bg-[#781616] text-white shadow-2xs'
            }`}
          >
            {isScanning ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Start Camera</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Viewport Frame */}
      <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
        <div id={readerElementId} className="w-full h-full" />

        {/* Reticle Overlay when scanning */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-48 h-48 relative border border-white/20 rounded-xl">
              {/* Corner accents */}
              <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-[#e5a93c] rounded-tl-sm" />
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-[#e5a93c] rounded-tr-sm" />
              <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-[#e5a93c] rounded-bl-sm" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-[#e5a93c] rounded-br-sm" />

              {/* Scanning beam */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#e5a93c] to-transparent animate-pulse top-1/2 opacity-75" />
            </div>
            <p className="mt-3 text-[10px] font-medium text-white/80 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Position delegate QR pass inside frame
            </p>
          </div>
        )}

        {/* Inactive Standby View */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-neutral-900/95 text-neutral-300">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e5a93c] mb-2.5">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">Camera Standby</h3>
            <p className="text-[11px] text-neutral-400 mb-3 max-w-[200px] leading-relaxed">
              Use your device camera to rapidly verify arriving delegates.
            </p>
            <button
              onClick={() => startCamera()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-[#fce79f]" />
              <span>Enable Camera</span>
            </button>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
            <RefreshCw className="w-7 h-7 text-[#e5a93c] animate-spin mb-2" />
            <span className="text-xs font-medium tracking-wide">Verifying delegate...</span>
          </div>
        )}
      </div>

      {/* Footer Controls: Camera selector */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs">
        {cameras.length > 1 ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="text-[11px] text-[var(--text-subtle)]">Camera:</span>
            <select
              value={selectedCameraId}
              onChange={handleCameraChange}
              className="text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2 py-1 text-[var(--text)] max-w-[200px] truncate"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Camera ${c.id.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-[11px] text-[var(--text-subtle)]">
            {isScanning ? 'Scanner active' : 'Click "Start Camera" or use search below'}
          </span>
        )}

        {cameraError && (
          <div className="flex items-center gap-1 text-amber-700 text-[11px]">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[220px]">{cameraError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
