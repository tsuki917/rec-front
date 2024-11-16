import React, { useRef, useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformProps {
  audioUrl: string;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl }) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (waveformRef.current) {
      // WaveSurfer インスタンスの作成
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ddd",
        progressColor: "#ff6200",
        cursorColor: "#333",
        barWidth: 2,
        height: 150,
      });

      // 音声ファイルのロード
      waveSurferRef.current.load(audioUrl);

      // イベントリスナーを追加
      waveSurferRef.current.on("finish", () => {
        setIsPlaying(false);
      });
    }

    // クリーンアップ
    return () => {
      waveSurferRef.current?.destroy();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause(); // 再生・一時停止をトグル
      setIsPlaying(waveSurferRef.current.isPlaying());
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div ref={waveformRef} className="w-full min-w-64"></div>
      <div>
        <button onClick={togglePlayPause} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
};

export default Waveform;
