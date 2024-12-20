import { useState, useEffect } from "react";
import RecordRTC from "recordrtc";
import { Microphone } from "./icon/microphone";
import WaveDisplay from "./WaveDisplay";
import axios from "axios";

type Recording = {
  audioURL: string;
  blob: Blob;
  id: string;
  recDate: string;
};

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const seconds = now.getSeconds();
  return `${year}/${month}/${date} ${hour}:${minute}:${seconds}`;
};

export const Record = () => {
  const [recorder, setRecorder] = useState<RecordRTC | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [recordings, setRecordings] = useState<Recording[]>([]);

  // 録音の開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const newRecorder = new RecordRTC(stream, { type: "audio" });
      newRecorder.startRecording();
      setRecorder(newRecorder);
      setIsRecording(true);
    } catch (err) {
      if (err instanceof Error) {
        setError("録音の開始に失敗しました: " + err.message);
      }
    }
  };

  // 録音の停止
  const stopRecording = () => {
    if (recorder) {
      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        setIsRecording(false);

        const id =
          Math.random().toString(32).substring(2) +
          new Date().getTime().toString(32);

        const newRecording: Recording = {
          audioURL: URL.createObjectURL(blob),
          blob,
          id,
          recDate: getCurrentDate(),
        };

        setRecordings([...recordings, newRecording]);
      });
      console.log(recordings)
    }
  };

  // コンポーネントのアンマウント時にリソースを解放
  useEffect(() => {
    return () => {
      if (recorder) {
        recorder.destroy();
      }
    };
  }, [recorder]);

  const handleSubmit = () => {
    console.log("submit")
    const path = 'http://127.0.0.1:8000'
    const data = new FormData();
    data.append('high', recordings[0].blob, 'high.wav'); //'photo'というkeyで保存
    data.append('low', recordings[1].blob, 'low.wav'); //'photo'というkeyで保存
    data.append('norm', recordings[2].blob, 'norm.wav'); //'photo'というkeyで保存

    axios.post(path, data, { headers: { 'content-type': 'multipart/form-data' } }).then((res) => {
      console.log(res.data)
    }).catch((err) => {
      console.log(err)
    })
  }

  return (
    <div className="w-1/2 m-auto">
      {
        recordings.length < 3 ? <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-center items-center z-50 py-16">
          <div className="text-3xl text-center py-6">
            {recordings.length === 0 && "あなたが出せる最も高い声を出してください"}
            {recordings.length === 1 && "あなたが出せる最も低い声を出してください"}
          </div>
          <RecButton
            isRecording={isRecording}
            stopCallback={stopRecording}
            startCallback={startRecording}
          />
        </div>
          :
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-center items-center z-50 py-16">
            <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleSubmit}>おすすめの曲を見る</button>
          </div>
      }

      <section>
        <div className="flex flex-col gap-2  audio-cover">
          {recordings.map((recording, index) => (
            <div className="flex justify-center items-center gap-4  border p-1" key={recording.id}>
              <p>最も{index == 0 ? '高い' : '低い'}声</p>
              <WaveDisplay audioUrl={recording.audioURL} />
            </div>
          ))}
        </div>
        {error && <p className="text-red text-12">エラー: {error}</p>}
      </section>
    </div>
  );
};

// const RecordAudioBox = ({ recording }: { recording: Recording }) => {
//   return (
//     <article className="py-2  border border-black">
//       <div className="p-5 flex justify-center items-center gap-4">
//         <WaveDisplay audioUrl={recording.audioURL} />
//         <div className="text-12">{recording.recDate}</div>
//       </div>

//     </article>
//   );
// };


const RecButton = ({
  isRecording,
  stopCallback,
  startCallback,
}: {
  isRecording: boolean;
  stopCallback: () => void;
  startCallback: () => void;
}) => (
  <button
    className="rounded-full w-20 h-20 text-3xl text-white shadow-lg bg-[#1da1f2] hover:bg-[#91ccf1] duration-300 transition drop-shadow-md active:translate-y-3 "
    onClick={isRecording ? stopCallback : startCallback}
  >
    {isRecording ? "■" : <MicrophoneIcon />}
  </button>
);

const MicrophoneIcon = () => {
  return (
    <div className="text-white w-20 h-20 [&>svg]:w-30 [&>svg]:h-30 flex items-center justify-center">
      <Microphone />
    </div>
  );
};
