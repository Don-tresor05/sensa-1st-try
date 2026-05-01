import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Header } from '../components/Header';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n';
import { useTTS } from '../hooks/useTTS';

interface DetectedObject {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

// Simulated detection labels for demo (in production: TensorFlow.js COCO-SSD)
const DEMO_OBJECTS_EN = [
  'person', 'chair', 'table', 'door', 'window', 'book', 'phone', 'bottle',
  'cup', 'laptop', 'bag', 'car', 'bicycle', 'sign', 'tree',
];
const DEMO_OBJECTS_RW = [
  'umuntu', 'intebe', 'ameza', 'umuryango', 'idirishya', 'igitabo', 'telefone', 'icupa',
  'ikibindi', 'mudasobwa', 'umusaho', 'imodoka', 'igare', 'ikimenyetso', 'igiti',
];

function buildSceneDescription(objects: DetectedObject[], language: 'en' | 'rw'): string {
  if (objects.length === 0) return language === 'en' ? 'No objects detected.' : 'Nta kintu cyabonetse.';
  const names = objects.map(o => o.label).slice(0, 3);
  if (language === 'en') {
    if (names.length === 1) return `I can see a ${names[0]} in front of you.`;
    return `I can see ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} in your environment.`;
  } else {
    if (names.length === 1) return `Ndeba ${names[0]} imbere yawe.`;
    return `Ndeba ${names.slice(0, -1).join(', ')} na ${names[names.length - 1]} mu mwanya wawe.`;
  }
}

export function SeeMode() {
  const { language } = useApp();
  const t = translations[language];
  const { speak, stop } = useTTS(language);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [status, setStatus] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoAnnounce, setAutoAnnounce] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setStatus(t.detectingObjects);
    } catch {
      setStatus(language === 'en' ? 'Camera access denied.' : 'Ntabwo havugwa kamera.');
    }
  }, [language, t.detectingObjects]);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setDetectedObjects([]);
    setStatus('');
    stop();
  }, [stop]);

  // Simulated detection loop (replace with actual TF.js COCO-SSD in production)
  useEffect(() => {
    if (!cameraActive) return;
    intervalRef.current = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      const objs: DetectedObject[] = Array.from({ length: count }, () => {
        const idx = Math.floor(Math.random() * DEMO_OBJECTS_EN.length);
        return {
          label: language === 'rw' ? DEMO_OBJECTS_RW[idx] : DEMO_OBJECTS_EN[idx],
          confidence: 0.7 + Math.random() * 0.29,
          bbox: [
            Math.random() * 200,
            Math.random() * 200,
            100 + Math.random() * 150,
            80 + Math.random() * 120,
          ],
        };
      });
      setDetectedObjects(objs);

      if (autoAnnounce) {
        const desc = buildSceneDescription(objs, language);
        setStatus(desc);
        setIsSpeaking(true);
        speak(desc);
        setTimeout(() => setIsSpeaking(false), 3000);
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cameraActive, language, autoAnnounce, speak]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleManualDescribe = () => {
    const desc = buildSceneDescription(detectedObjects, language);
    setStatus(desc);
    setIsSpeaking(true);
    speak(desc);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header title={t.seeMode} showBack showEmergency />

      <div className="flex-1 flex flex-col">
        {/* Camera View */}
        <div className="relative bg-black aspect-video w-full max-h-64 overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
              <Camera size={48} className="text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">{language === 'en' ? 'Camera inactive' : 'Kamera ntikora'}</p>
            </div>
          )}

          {/* Overlay badges */}
          {cameraActive && detectedObjects.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {detectedObjects.map((obj, i) => (
                <span key={i} className="bg-sky-600/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {obj.label} {Math.round(obj.confidence * 100)}%
                </span>
              ))}
            </div>
          )}

          {isSpeaking && (
            <div className="absolute bottom-2 right-2 bg-sky-600 rounded-full p-2 animate-pulse">
              <Volume2 size={16} className="text-white" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-4 py-4 flex gap-3">
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              cameraActive
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {cameraActive ? <CameraOff size={18} /> : <Camera size={18} />}
            {cameraActive ? t.stopCamera : t.startCamera}
          </button>

          {cameraActive && (
            <button
              onClick={handleManualDescribe}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all active:scale-95"
            >
              <RefreshCw size={18} />
            </button>
          )}

          <button
            onClick={() => setAutoAnnounce(a => !a)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              autoAnnounce ? 'bg-sky-800 text-sky-200' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {autoAnnounce ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        {/* Status / Description */}
        {status && (
          <div className="mx-4 mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-sky-300 text-xs font-semibold uppercase tracking-wide mb-1">
              {language === 'en' ? 'Scene Description' : 'Ibisobanuro by\'aho ari'}
            </p>
            <p className="text-white text-sm leading-relaxed">{status}</p>
          </div>
        )}

        {/* Detected Objects List */}
        {detectedObjects.length > 0 && (
          <div className="mx-4 mb-4">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2 px-1">
              {language === 'en' ? 'Detected Objects' : 'Ibintu Byabonetse'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {detectedObjects.map((obj, i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-3 border border-slate-700 flex items-center justify-between">
                  <span className="text-white text-sm font-medium capitalize">{obj.label}</span>
                  <span className="text-sky-400 text-xs font-bold">{Math.round(obj.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="mx-4 mb-4 p-3 bg-sky-950 rounded-xl border border-sky-900">
          <p className="text-sky-400 text-xs leading-relaxed">
            {language === 'en'
              ? 'Point your camera at any object or text. SENSA will identify and describe what it sees aloud.'
              : 'Erekeza kamera yawe ku kintu icyo aricyo cyose cyangwa inyandiko. SENSA izavuga ibyo ibona.'}
          </p>
        </div>
      </div>
    </div>
  );
}
