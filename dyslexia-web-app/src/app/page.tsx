"use client";

import { useEffect, useState } from "react";
import RecordAudio from "./components/recordAudio";

export default function Home() {
  const [message, setMessage] = useState("");

  return (
    <div>
      <RecordAudio />
    </div>
  );
}
