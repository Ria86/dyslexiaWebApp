import { NextResponse } from "next/server";
import { tmpdir } from "os";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import speech from "@google-cloud/speech";

const client = new speech.SpeechClient();

export async function POST(req) {
  try {
    console.log("Received audio POST request");

    // Parse multipart form
    const formData = await req.formData();
    const file = formData.get("audio");

    if (!file) {
      console.log("No audio file found in request");
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    // Save WebM file temporarily
    const bytes = Buffer.from(await file.arrayBuffer());
    const webmPath = path.join(tmpdir(), "recording.webm");
    const wavPath = path.join(tmpdir(), "recording.wav");
    await writeFile(webmPath, bytes);
    console.log("Saved WebM:", webmPath);

    // Convert WebM to WAV using FFmpeg
    console.log("Starting FFmpeg conversion...");
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-i",
        webmPath,
        "-ar",
        "16000",
        "-ac",
        "1",
        "-f",
        "wav",
        wavPath,
      ]);

      ffmpeg.on("close", (code) => {
        console.log("FFmpeg finished with code:", code);
        if (code === 0) resolve();
        else reject(new Error("FFmpeg failed"));
      });
    });

    console.log("Reading WAV file for Google STT...");
    const audioBytes = await readFile(wavPath);

    // Send to Google Speech-to-Text
    const [response] = await client.recognize({
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en",
      },
      audio: { content: audioBytes.toString("base64") },
    });

    const transcription = response.results
      .map((r) => r.alternatives[0].transcript)
      .join("\n");

    console.log("Transcription:", transcription);

    return NextResponse.json({ transcription });
  } catch (err) {
    console.error("Error in /api/audio:", err);
    return NextResponse.json(
      { error: "Transcription failed", details: err.message },
      { status: 500 }
    );
  }
}
