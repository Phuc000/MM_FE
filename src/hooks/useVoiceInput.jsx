import { useState, useRef } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

export const useVoiceInput = (onVoiceResult) => {
  const [listening, setListening] = useState(false);

  // Refs for audio processing
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const rafIdRef = useRef(null);
  const barsRef = useRef([]);

  const visualizeAudio = () => {
    rafIdRef.current = requestAnimationFrame(visualizeAudio);

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

    if (barsRef.current.length > 0) {
      const step = Math.floor(dataArrayRef.current.length / barsRef.current.length);
      for (let i = 0; i < barsRef.current.length; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          const value = dataArrayRef.current[i * step + j] - 128;
          sum += Math.abs(value);
        }
        const average = sum / step;
        let barHeight = (average / 128) * 160 + 2;
        if (barHeight > 24) {
          barHeight = 24;
        }
        if (barsRef.current[i]) {
          barsRef.current[i].style.height = `${barHeight}px`;
        }
      }
    }
  };

  const handleVoiceInput = async () => {
    if (listening) {
      recognition.stop();
      setListening(false);

      cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    } else {
      recognition.start();
      setListening(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.fftSize;
        dataArrayRef.current = new Uint8Array(bufferLength);

        visualizeAudio();
      } catch (err) {
        console.error("Microphone access error:", err);
      }
    }
  };

  recognition.onresult = (event) => {
    const voiceInput = event.results[0][0].transcript;
    onVoiceResult(voiceInput);
  };

  recognition.onerror = (event) => {
    console.error("Voice recognition error:", event.error);
    setListening(false);
  };

  recognition.onend = () => {
    setListening(false);
    cancelAnimationFrame(rafIdRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return {
    listening,
    handleVoiceInput,
    barsRef,
  };
};
