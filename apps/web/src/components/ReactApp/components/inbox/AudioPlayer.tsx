import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Volume2 } from 'lucide-react';

export function AudioPlayer({ url, dark = false }: { url: string; dark?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: dark ? '#5F46CC' : '#BBC5CB',
      progressColor: dark ? '#FFFFFF' : '#53BDEB',
      height: 24,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      url: url,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setDuration(formatTime(ws.getDuration()));
    });

    ws.on('audioprocess', () => {
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on('finish', () => {
      setIsPlaying(false);
      ws.seekTo(0);
    });

    return () => {
      ws.destroy();
    };
  }, [url, dark]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`flex items-center gap-3 min-w-[180px] p-2 rounded-xl border ${
      dark ? 'bg-[#2D2355] border-[#5F46CC]/20' : 'bg-[#FAFAFA] border-[#EEEEEE]'
    }`}>
      <button
        onClick={togglePlay}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
          dark ? 'bg-white text-[#221A40]' : 'bg-[#221A40] text-white shadow-sm'
        } hover:scale-110 active:scale-95`}
      >
        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div ref={containerRef} className="w-full" />
        <div className="flex justify-between items-center">
            <span className={`text-[9px] font-bold ${dark ? 'text-indigo-200' : 'text-[#AAAAAA]'}`}>{currentTime}</span>
            <span className={`text-[9px] font-bold ${dark ? 'text-indigo-200' : 'text-[#AAAAAA]'}`}>{duration}</span>
        </div>
      </div>

      <div className={dark ? 'text-indigo-200' : 'text-[#AAAAAA]'}>
        <Volume2 size={12} />
      </div>
    </div>
  );
}
