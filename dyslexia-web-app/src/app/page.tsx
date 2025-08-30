"use client";

import { useEffect, useState } from "react";
import RecordAudio from "./components/recordAudio";
import DiagnosticTest from "./components/diagnostic";

export default function Home() {
  const [message, setMessage] = useState("");

  return (
    <div>
      <DiagnosticTest />
    </div>
  );
}
