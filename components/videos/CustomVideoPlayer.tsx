"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Expand,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cn } from "@/lib/utils";

type PlaybackRate = 0.75 | 1 | 1.25 | 1.5 | 2;

type CustomVideoPlayerProps = {
  src: string;
  posterSrc?: string;
  title?: string;
  className?: string;
};

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const seconds = Math.floor(totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function CustomVideoPlayer({
  src,
  posterSrc,
  title,
  className,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);
  const [isSeeking, setIsSeeking] = useState(false);

  const rates: PlaybackRate[] = useMemo(() => [0.75, 1, 1.25, 1.5, 2], []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsReady(true);
    };

    const onTimeUpdate = () => {
      if (isSeeking) return;
      setCurrentTime(video.currentTime || 0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    const onRateChange = () => setPlaybackRate(video.playbackRate as PlaybackRate);

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("ratechange", onRateChange);

    video.muted = isMuted;
    video.volume = volume;
    video.playbackRate = playbackRate;

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("ratechange", onRateChange);
    };
  }, [isMuted, isSeeking, playbackRate, volume]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        // Ignore autoplay/click restrictions.
      }
      return;
    }

    video.pause();
  };

  const seekBy = (deltaSeconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.min(Math.max(0, video.currentTime + deltaSeconds), video.duration || 0);
    video.currentTime = next;
    setCurrentTime(next);
  };

  const onChangeProgress = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.min(Math.max(0, value), duration || 0);
    video.currentTime = next;
    setCurrentTime(next);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const onChangeVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.min(Math.max(0, value), 1);
    video.volume = next;
    setVolume(next);
    if (next === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const onChangeRate = (value: PlaybackRate) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = value;
    setPlaybackRate(value);
  };

  const requestFullscreen = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const element = wrapper as unknown as {
      requestFullscreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => void;
      msRequestFullscreen?: () => void;
    };

    try {
      if (typeof element.requestFullscreen === "function") {
        await element.requestFullscreen();
        return;
      }
      if (typeof element.webkitRequestFullscreen === "function") {
        element.webkitRequestFullscreen();
        return;
      }
      if (typeof element.msRequestFullscreen === "function") {
        element.msRequestFullscreen();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div ref={wrapperRef} className={cn("w-full", className)}>
      <div className="relative overflow-hidden rounded-[10px] bg-[#07182c]">
        <button
          type="button"
          aria-label={isPlaying ? "Пауза" : "Ойнату"}
          onClick={togglePlay}
          className="group relative block w-full"
        >
          <video
            ref={videoRef}
            src={src}
            poster={posterSrc}
            controls={false}
            playsInline
            preload="metadata"
            className="aspect-video w-full bg-black object-contain"
            aria-label={title ? `Видео: ${title}` : "Видео"}
          />

          {!isReady ? (
            <div className="absolute inset-0 grid place-items-center bg-black/30">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/90">
                Жүктелуде...
              </div>
            </div>
          ) : null}

          {isReady && !isPlaying ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur transition group-hover:bg-white/20">
                <Play className="h-7 w-7 text-white" />
              </div>
            </div>
          ) : null}
        </button>

        <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] px-2 py-2 sm:px-3">
          <div className="flex flex-col gap-2 sm:gap-2.5">
            <input
              type="range"
              min={0}
              max={Math.max(0, duration)}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              aria-label="Ойнату прогресі"
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={() => setIsSeeking(false)}
              onTouchStart={() => setIsSeeking(true)}
              onTouchEnd={() => setIsSeeking(false)}
              onChange={(e) => onChangeProgress(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#5b3ee4]"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/80">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={isPlaying ? "Пауза" : "Ойнату"}
                  onClick={togglePlay}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 font-bold text-white hover:bg-white/15"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{isPlaying ? "Пауза" : "Ойнату"}</span>
                </button>

                <button
                  type="button"
                  aria-label="10 секунд артқа"
                  onClick={() => seekBy(-10)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 font-bold text-white hover:bg-white/15"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">-10с</span>
                </button>

                <button
                  type="button"
                  aria-label="10 секунд алға"
                  onClick={() => seekBy(10)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 font-bold text-white hover:bg-white/15"
                >
                  <RotateCw className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">+10с</span>
                </button>

                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-bold text-white/90">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex flex-1 items-center justify-end gap-2">
                <button
                  type="button"
                  aria-label={isMuted ? "Дыбысты қосу" : "Дыбысты өшіру"}
                  onClick={toggleMute}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 font-bold text-white hover:bg-white/15"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  aria-label="Дыбыс деңгейі"
                  onChange={(e) => onChangeVolume(Number(e.target.value))}
                  className="hidden h-2 w-24 cursor-pointer accent-[#5b3ee4] sm:block"
                />

                <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-bold text-white">
                  <span className="hidden sm:inline">Жылдамдық</span>
                  <select
                    aria-label="Ойнату жылдамдығы"
                    value={playbackRate}
                    onChange={(e) => onChangeRate(Number(e.target.value) as PlaybackRate)}
                    className="bg-transparent text-white outline-none"
                  >
                    {rates.map((rate) => (
                      <option key={rate} value={rate} className="text-slate-900">
                        {rate}x
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  aria-label="Толық экран"
                  onClick={requestFullscreen}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 font-bold text-white hover:bg-white/15"
                >
                  <Expand className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

