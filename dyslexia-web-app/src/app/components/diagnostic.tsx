import React, { useMemo, useState } from "react";
import rawData from "../data/diagnostic";
import RecordAudio from "./recordAudio";

interface DiagnosticTestProps {
  currentPage?: string;
}

type QuestionItem = {
  type: string; // subtest type
  question: string;
  answer: string;
  options?: string[];
  syllables?: string[];
  word?: string; // for elision
  remove?: string; // for elision
};

type QuestionGroup = {
  type: string; // subtest type
  questions: Omit<QuestionItem, "type">[];
};

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

const DiagnosticTest = ({ currentPage = "training" }: DiagnosticTestProps) => {
  // Flatten grouped JSON into single question list
  const questionData: QuestionGroup[] = rawData as unknown as QuestionGroup[];
  const flatQuestions: QuestionItem[] = useMemo(() => {
    return questionData.flatMap((group) =>
      group.questions.map((q) => ({ type: group.type, ...q }))
    );
  }, []);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAudioAnswer, setHasAudioAnswer] = useState(false);

  const totalQuestions = flatQuestions.length;
  const currentQ = flatQuestions[currentQuestion];

  const handleSubmit = () => {
    const answerGiven = userAnswer || selectedAnswer;
    const transcriptionBox = document.getElementById("transcriptionBox");
    const hasTranscription =
      transcriptionBox &&
      transcriptionBox.innerText &&
      transcriptionBox.innerText !== "Transcription will appear here...";

    if (!answerGiven && !hasTranscription) return;

    if (hasTranscription) {
      setIsCorrect(true); // Assumes all answers are correct
      setHasAudioAnswer(true);
    } else {
      setIsCorrect(normalize(answerGiven) === normalize(currentQ.answer));
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1);
      setUserAnswer("");
      setSelectedAnswer("");
      setShowResult(false);
      setIsCorrect(false);
      setHasAudioAnswer(false);
    }
  };

  const renderAnswerInput = () => {
    if (currentQ.type === "sound_matching" && currentQ.options) {
      return (
        <div className="space-y-3 my-8">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAnswer(option)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                selectedAnswer === option
                  ? showResult
                    ? option === currentQ.answer
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-red-500 bg-red-50 text-red-800"
                    : "border-white bg-purple-50 text-purple-800"
                  : showResult && option === currentQ.answer
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    // Audio recording interface for non-multiple-choice questions
    return (
      <div className="flex flex-col items-center justify-center my-6 space-y-4">
        <RecordAudio />
        <p id="transcriptionBox" className="text-sm text-gray-600">
          Transcription will appear here...
        </p>
      </div>
    );
  };

  const renderQuestionText = () => {
    switch (currentQ.type) {
      case "elision":
        return `Say "${currentQ.word}" without "${currentQ.remove}"`;
      case "blending_words":
        return `Blend the sounds: ${currentQ.syllables?.join(" - ")}`;
      case "phoneme_isolation":
        return `What is the first sound in "${currentQ.word}"?`;
      case "sound_matching":
        return `Which of these sounds matches the target?`;
      case "memory_for_digits":
        return `Repeat the following digits: ${currentQ.question}`;
      case "nonword_repetition":
        return `Repeat the nonword: ${currentQ.question}`;
      case "rapid_naming":
        return `Name the following as quickly as possible: ${currentQ.question}`;
      default:
        return currentQ.question;
    }
  };

  return (
    <div className="flex flex-col min-h-screen ">
      {/* Main Content */}
      <div className="flex-1 bg-white rounded-l-3xl">
        <div className="flex justify-between items-center p-8 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Diagnostic Test
            </h2>
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {totalQuestions}
            </p>
            <p className="text-xs text-gray-500">Type: {currentQ.type}</p>
          </div>
        </div>

        <div className="px-8 py-4 flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 mb-6 text-center">
              <p className="text-lg font-semibold text-gray-800">
                {renderQuestionText()}
              </p>
              {renderAnswerInput()}
              {showResult && (
                <div
                  className={`mt-6 p-4 rounded-lg ${
                    isCorrect
                      ? "bg-green-100 border border-green-300"
                      : "bg-red-100 border border-red-300"
                  }`}
                >
                  <span
                    className={`text-lg font-semibold ${
                      isCorrect ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                  </span>
                  {!isCorrect && !hasAudioAnswer && (
                    <p className="mt-2 text-sm text-gray-700">
                      Correct answer:{" "}
                      <span className="font-mono">{currentQ.answer}</span>
                    </p>
                  )}
                  {hasAudioAnswer && (
                    <p className="mt-2 text-sm text-gray-700">
                      Audio answer submitted for review
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 pt-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={!userAnswer && !selectedAnswer && !hasAudioAnswer}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  userAnswer || selectedAnswer || hasAudioAnswer
                    ? "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Check
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 hover:shadow-lg transition-all duration-300"
              >
                {currentQuestion < totalQuestions - 1 ? "Next" : "Finish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTest;
