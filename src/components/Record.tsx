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

type songType = {
  name: string;
  artist: string;
}
//テスト用データ
// const mock: songType[] = [{
//   name: "ただ君に晴れ",
//   artist: "ヨルシカ"
// }, {
//   name: "最高到達点",
//   artist: "SEKAI NO OWARI"
// }, {
//   name: "相思相愛",
//   artist: "aiko"
// }]
export const Record = () => {
  const [recorder, setRecorder] = useState<RecordRTC | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [result, setResult] = useState<undefined | songType[]>(undefined);
  const [loading, setLoading] = useState<boolean>(false)

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
    setLoading(true)
    console.log("submit")
    const path = 'http://127.0.0.1:8000'
    const data = new FormData();
    data.append('high', recordings[0].blob, 'high.wav'); //'photo'というkeyで保存
    data.append('low', recordings[1].blob, 'low.wav'); //'photo'というkeyで保存
    data.append('norm', recordings[2].blob, 'norm.wav'); //'photo'というkeyで保存

    axios.post(path, data, { headers: { 'content-type': 'multipart/form-data' } }).then((res) => {
      console.log(res.data)
      setResult(res.data)
    }).catch((err) => {
      console.log(err)
    })
  }



  return (
    <div className="w-1/2 m-auto">
      {
        result !== undefined && (
          <div className="w-2/3 fixed  left-1/2 -translate-x-1/2 top-1/2 bg-white -translate-y-1/2 ">
            <h1 className=" font-bold text-center text-2xl border-b-2 border-black">I recommend you these songs</h1>
            {result.map((ele, index) => {
              return (
                <div className="p-2 border-b flex justify-between items-center border-gray-500">
                  <p className="py-1 font-semibold text-xl">No.{index + 1}  {ele.name} </p>
                  <p className="py-1 text-center font-medium">{ele.artist}</p>
                </div>
              )
            })}
          </div>
        )
      }
      {loading ? (
        result === undefined && (<div className="flex justify-center mt-24 ">


          <div role="status" className="flex justify-center">
            <svg aria-hidden="true" className="w-1/2 h-1/2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>)
      ) : (<>


        {
          recordings.length < 3 ? <div className="flex flex-col justify-center items-center z-50 py-16">
            <div className="text-3xl text-center py-6 bg-white">
              {recordings.length === 0 && "please record your highest voice"}
              {recordings.length === 1 && "please record your lowest voice"}
              {recordings.length === 2 && "please record your normal voice"}
            </div>
            <RecButton
              isRecording={isRecording}
              stopCallback={stopRecording}
              startCallback={startRecording}
            />
          </div>
            :
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-center items-center z-50 py-16">
              <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleSubmit}>suggest songs suitable for you</button>
            </div>
        }

        <section>
          <div className="flex flex-col gap-2  audio-cover">
            {recordings.map((recording, index) => (
              <div className="flex justify-center items-center gap-4  border p-1" key={recording.id}>
                <p>{index == 0 ? 'highest' : index == 1 ? 'lowest' : 'normal'} voice</p>
                <WaveDisplay audioUrl={recording.audioURL} />
              </div>
            ))}
          </div>
          {error && <p className="text-red text-12">error: {error}</p>}
        </section>
      </>)}
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
