"use client";

import { useState } from "react";
import TowerGame from "./lessons/tower/page";
import DiagnosticTest from "./components/diagnostic";

type LessonType = "overview" | "tower" | "diagnostic";

export default function Home() {
  const [currentView, setCurrentView] = useState<LessonType>("overview");
  const [mainSection, setMainSection] = useState<
    "home" | "lessons" | "progress" | "resources"
  >("home");

  const renderMainContent = () => {
    if (mainSection === "home") {
      return <div className="max-w-4xl mx-auto text-center"></div>;
    }

    if (mainSection === "lessons") {
      if (currentView === "overview") {
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Lessons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tower Builder Thumbnail */}
              <div
                onClick={() => setCurrentView("tower")}
                className="bg-purple-600 rounded-2xl p-16 text-white text-center cursor-pointer hover:bg-purple-700 transition"
              >
                <h3 className="text-2xl font-bold">Tower Builder</h3>
              </div>
              {/* Diagnostic Test Thumbnail */}
              <div
                onClick={() => setCurrentView("diagnostic")}
                className="bg-purple-600 rounded-2xl p-16 text-white text-center cursor-pointer hover:bg-purple-700 transition"
              >
                <h3 className="text-2xl font-bold">Diagnostic Test</h3>
              </div>
            </div>
          </div>
        );
      }

      // Inside a lesson
      return (
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setCurrentView("overview")}
            className="flex items-center text-gray-700 font-semibold mb-4 hover:text-gray-900 transition"
          >
            ← Back to Lessons
          </button>

          {currentView === "tower" && <TowerGame />}
          {currentView === "diagnostic" && <DiagnosticTest />}
        </div>
      );
    }

    if (mainSection === "progress") {
      return (
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Progress</h2>
          <p className="text-gray-700">Your progress will appear here.</p>
        </div>
      );
    }

    if (mainSection === "resources") {
      return (
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Resources</h2>
          <p className="text-gray-700">Helpful resources will appear here.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-indigo-400">
      {/* Sidebar */}
      <div className="w-60 text-white p-6">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold">Dyslexia App</h1>
        </div>
        <nav className="space-y-2">
          <button
            onClick={() => {
              setMainSection("home");
              setCurrentView("overview");
            }}
            className={`px-4 py-3 rounded-full font-semibold w-full text-left transition-colors ${
              mainSection === "home"
                ? "bg-green-400 text-green-900"
                : "text-indigo-200 hover:text-white hover:bg-indigo-500"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setMainSection("lessons");
              setCurrentView("overview");
            }}
            className={`px-4 py-3 rounded-full font-semibold w-full text-left transition-colors ${
              mainSection === "lessons"
                ? "bg-green-400 text-green-900"
                : "text-indigo-200 hover:text-white hover:bg-indigo-500"
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setMainSection("progress")}
            className={`px-4 py-3 rounded-full font-semibold w-full text-left transition-colors ${
              mainSection === "progress"
                ? "bg-green-400 text-green-900"
                : "text-indigo-200 hover:text-white hover:bg-indigo-500"
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setMainSection("resources")}
            className={`px-4 py-3 rounded-full font-semibold w-full text-left transition-colors ${
              mainSection === "resources"
                ? "bg-green-400 text-green-900"
                : "text-indigo-200 hover:text-white hover:bg-indigo-500"
            }`}
          >
            Resources
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-l-3xl p-8">
        {renderMainContent()}
      </div>
    </div>
  );
}
