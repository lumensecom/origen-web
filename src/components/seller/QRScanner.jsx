import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertTriangle } from 'lucide-react';

const SCANNER_ID = 'origen-qr-reader';

// Live camera QR scanner built on html5-qrcode (works on iOS Safari, Android &
// desktop). Fires onScan exactly once, then the parent unmounts us by switching
// view — the cleanup stops the camera stream.
const QRScanner = ({ onScan, onError }) => {
  const instanceRef = useRef(null);
  const startedRef = useRef(false);
  const scannedRef = useRef(false);
  const [status, setStatus] = useState('starting'); // starting | scanning | error

  useEffect(() => {
    if (!document.getElementById(SCANNER_ID)) return undefined;

    const html5 = new Html5Qrcode(SCANNER_ID, { verbose: false });
    instanceRef.current = html5;
    let cancelled = false;

    html5
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
        (decodedText) => {
          if (cancelled || scannedRef.current) return;
          scannedRef.current = true;
          onScan?.(decodedText.trim());
        },
        () => {} // per-frame decode misses are normal — ignore
      )
      .then(() => {
        if (!cancelled) { startedRef.current = true; setStatus('scanning'); }
      })
      .catch((err) => {
        if (!cancelled) { setStatus('error'); onError?.(err); }
      });

    return () => {
      cancelled = true;
      const inst = instanceRef.current;
      if (inst && startedRef.current) {
        inst.stop().then(() => inst.clear()).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full">
      <div id={SCANNER_ID} className="w-full aspect-square overflow-hidden rounded-[24px] bg-black [&>video]:object-cover" />

      {/* Corner viewfinder guides */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative w-[70%] aspect-square">
          <span className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[var(--terracota-vivo)] rounded-tl-[12px]" />
          <span className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[var(--terracota-vivo)] rounded-tr-[12px]" />
          <span className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[var(--terracota-vivo)] rounded-bl-[12px]" />
          <span className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[var(--terracota-vivo)] rounded-br-[12px]" />
        </div>
      </div>

      {status === 'starting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80 bg-black/40 rounded-[24px]">
          <Camera size={28} className="animate-pulse" />
          <p className="font-ui text-sm">Iniciando cámara…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white text-center px-6 bg-black/70 rounded-[24px]">
          <AlertTriangle size={28} className="text-[var(--terracota-vivo)]" />
          <p className="font-ui text-sm font-semibold">No pudimos acceder a la cámara</p>
          <p className="font-ui text-xs text-white/70">Revisa los permisos del navegador o usa el código manual abajo.</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
