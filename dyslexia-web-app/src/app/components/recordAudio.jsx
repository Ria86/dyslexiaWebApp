"use client";

import { useState, useRef } from "react";

export default function RecordAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  //sending audio file to server
  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      await fetch("/api/audio", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  //recording audo
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream); //records audio
      chunksRef.current = []; //stores chunks of audio

      //adds chucks of audio to the list
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      //when the recording is done combine all the chunks of audio and send it to the server by calling uploadAudio
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        uploadAudio(blob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  //ui button
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <button
        onClick={toggleRecording}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
          isRecording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {isRecording && (
        <div className="flex items-center space-y-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 ml-2">Recording...</span>
        </div>
      )}
    </div>
  );
}
