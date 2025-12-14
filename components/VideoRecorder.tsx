import React, { useRef, useState, useEffect } from 'react';
import { Camera, Mic, Square, Video as VideoIcon } from 'lucide-react';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  isProcessing: boolean;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setPermissionError(null);
    } catch (err) {
      setPermissionError("Access denied. The ledger requires evidence.");
      console.error("Error accessing media devices:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      onRecordingComplete(blob, elapsedTime);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setElapsedTime(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionError) {
    return (
      <div className="bg-primary border border-red-900 p-8 flex flex-col items-center justify-center text-center h-64">
        <VideoIcon className="w-12 h-12 text-red-900 mb-4" />
        <h3 className="text-lg font-serif text-red-500 uppercase tracking-widest">Permission Denied</h3>
        <p className="text-slate-500 mt-2">{permissionError}</p>
        <button 
          onClick={startCamera}
          className="mt-6 px-6 py-2 bg-red-900 text-white uppercase text-xs tracking-widest hover:bg-red-800 transition"
        >
          Retry Access
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8 w-full">
      <div className="relative w-full aspect-video bg-black shadow-2xl overflow-hidden border border-slate-800 group">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-black/20 z-10 pointer-events-none"></div>
        {/* Corner Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-gold z-20"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-gold z-20"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-gold z-20"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-gold z-20"></div>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1] opacity-90" 
        />
        
        {/* Overlays */}
        <div className="absolute top-6 left-6 flex space-x-3 z-20">
           <div className="flex items-center space-x-1 bg-black/80 text-gold border border-gold/30 px-2 py-1 text-[10px] uppercase tracking-widest">
              <Camera className="w-3 h-3" />
              <span>VISUAL</span>
           </div>
           <div className="flex items-center space-x-1 bg-black/80 text-gold border border-gold/30 px-2 py-1 text-[10px] uppercase tracking-widest">
              <Mic className="w-3 h-3" />
              <span>AUDIO</span>
           </div>
        </div>

        {isRecording && (
          <div className="absolute top-6 right-6 flex items-center space-x-2 z-20">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-white font-mono font-bold bg-black/80 border border-red-900/50 px-3 py-1 text-xs">
              {formatTime(elapsedTime)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-8">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className="group relative flex items-center justify-center w-20 h-20 bg-primary border border-gold hover:bg-gold/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
          >
             <div className="absolute inset-0 rounded-full border border-gold opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
            <div className="w-8 h-8 bg-red-700 rounded-full group-hover:bg-red-600 transition-colors shadow-lg shadow-red-900/50" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center w-20 h-20 bg-primary border-2 border-slate-600 hover:border-white transition-all rounded-full"
          >
            <Square className="w-6 h-6 text-white fill-current" />
          </button>
        )}
      </div>
      
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
        {isProcessing ? "Analyzing Evidence..." : isRecording ? "Recording in progress" : "Initiate Recording"}
      </p>
    </div>
  );
};

export default VideoRecorder;