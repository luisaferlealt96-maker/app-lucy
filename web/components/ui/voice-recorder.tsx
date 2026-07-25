"use client";

import { useRef, useState } from "react";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VoiceRecorderProps {
  onAudio: (blob: Blob | null) => void;
}

type Estado = "idle" | "recording" | "recorded";

export function VoiceRecorder({ onAudio }: VoiceRecorderProps) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [playing, setPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTiempo = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAudio(blob);
        setEstado("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start(100);
      setEstado("recording");
      setSegundos(0);
      timerRef.current = setInterval(() => setSegundos((s) => s + 1), 1000);
    } catch {
      // Micrófono denegado o no disponible
    }
  };

  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const eliminar = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setPlaying(false);
    setSegundos(0);
    onAudio(null);
    setEstado("idle");
  };

  const togglePlay = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="wait">
        {estado === "idle" && (
          <motion.button
            key="idle"
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={iniciarGrabacion}
            className="flex items-center gap-2.5 w-full h-12 rounded-xl border-2 border-dashed px-4 text-sm font-semibold transition-all active:scale-[0.97]"
            style={{ borderColor: "#C0546A", color: "#C0546A", background: "#FDF0F2" }}
          >
            <Mic size={17} strokeWidth={2.5} />
            Grabar nota de voz
          </motion.button>
        )}

        {estado === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 h-12 rounded-xl px-4"
            style={{ background: "#FDF0F2", border: "2px solid #C0546A" }}
          >
            {/* Punto rojo parpadeante */}
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: "#C0546A" }}
            />
            <span className="text-sm font-bold flex-1" style={{ color: "#C0546A" }}>
              Grabando… {formatTiempo(segundos)}
            </span>
            <button
              type="button"
              onClick={detenerGrabacion}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: "#C0546A", color: "#fff" }}
            >
              <Square size={12} fill="#fff" /> Detener
            </button>
          </motion.div>
        )}

        {estado === "recorded" && audioUrl && (
          <motion.div
            key="recorded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 h-12 rounded-xl px-4"
            style={{ background: "#F0FAF4", border: "2px solid #22c55e" }}
          >
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#22c55e" }}
            >
              {playing
                ? <Pause size={14} fill="#fff" color="#fff" />
                : <Play size={14} fill="#fff" color="#fff" />}
            </button>
            <span className="text-sm font-semibold text-green-700 flex-1">
              Nota grabada ✓
            </span>
            <button
              type="button"
              onClick={eliminar}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
