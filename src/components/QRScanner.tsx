'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
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
          // Pleasant high double beep
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5

          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(ctx.currentTime);
          osc1.stop(ctx.currentTime + 0.1);
          osc2.start(ctx.currentTime + 0.1);
          osc2.stop(ctx.currentTime + 0.3);
        } else {
          // Warning low buzz
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);

          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
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
          // Prefer environment (back) camera if available, else first camera
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setCameraError('No camera found on this device.');
        }
      })
      .catch((err) => {
        console.warn('Camera enumeration error:', err);
        setCameraError('Unable to access camera permissions. You can also use the manual code input below.');
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
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (isProcessing) return;
          // Avoid spamming the exact same scan in a 2-second burst
          if (lastScanned === decodedText) return;

          setLastScanned(decodedText);
          playAudioTone('success');
          onScanSuccess(decodedText);

          setTimeout(() => {
            setLastScanned(null);
          }, 2500);
        },
        () => {
          // Scan frame without QR code
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setCameraError(err.message || 'Failed to start camera. Please check permissions.');
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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col">
      {/* Scanner Header Controls */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5">
            Live QR Scanner
            {isScanning && (
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Chime Sound' : 'Enable Chime Sound'}
            className="p-1.5 text-[var(--text-muted)] hover:text-[#8f1b1b] rounded-lg bg-[var(--surface-2)] text-xs flex items-center gap-1 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#8f1b1b]" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Scan Camera Button */}
          <button
            type="button"
            onClick={handleToggleCamera}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
              isScanning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#8f1b1b] hover:bg-[#a12626] text-white'
            }`}
          >
            {isScanning ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                Stop
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Start Scanner
              </>
            )}
          </button>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-xl overflow-hidden bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center">
        {/* html5-qrcode reader mounting element */}
        <div id={readerElementId} className="w-full h-full" />

        {/* Overlay guides when scanning */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Corner Reticle */}
            <div className="w-56 h-56 relative border-2 border-[#b07c12]/80 rounded-2xl shadow-lg">
              {/* Animated laser line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#e5a93c] to-transparent animate-bounce top-1/2 opacity-90 shadow-sm" />
            </div>
            <p className="mt-3 text-[11px] font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur">
              Point camera at student&apos;s E-Pass QR
            </p>
          </div>
        )}

        {/* Inactive State Display */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-neutral-950/95 text-neutral-300">
            <div className="w-14 h-14 rounded-2xl bg-[#8f1b1b]/20 border border-[#8f1b1b]/40 flex items-center justify-center text-[#e5a93c] mb-3">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Camera Standby</h3>
            <p className="text-xs text-neutral-400 mb-4 max-w-[220px]">
              Tap &apos;Start Scanner&apos; to verify student tickets using your phone or laptop camera.
            </p>
            <button
              onClick={() => startCamera()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8f1b1b] to-[#a12626] text-white text-xs font-bold rounded-xl shadow-md hover:scale-102 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fce79f]" />
              Activate Scanner
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
            <RefreshCw className="w-8 h-8 text-[#e5a93c] animate-spin mb-2" />
            <span className="text-xs font-semibold tracking-wide">Verifying E-Pass...</span>
          </div>
        )}
      </div>

      {/* Camera Selection & Status footer */}
      <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-col gap-2">
        {cameras.length > 1 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] text-[11px]">Select Camera:</span>
            <select
              value={selectedCameraId}
              onChange={handleCameraChange}
              className="text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2 py-1 text-[var(--text)] max-w-[190px] truncate"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Camera ${c.id.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {cameraError && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
