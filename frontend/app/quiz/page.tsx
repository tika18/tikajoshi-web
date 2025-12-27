"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/client";
import { CheckCircle2, XCircle, Trophy, RefreshCw, BrainCircuit, Loader2 } from "lucide-react";

export default function QuizPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  // Fetch Questions from Sanity
  useEffect(() => {
    // Query: Get 5 latest quiz questions
    const query = `*[_type == "quiz"] | order(_createdAt desc)[0..4] {
      question,
      options,
      correctOption
    }`;

    client.fetch(query)
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAnswer = (index: number) => {
    setSelected(index);
    if (index === questions[current].correctOption) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar />
      <div className="max-w-2xl mx-auto py-24 px-6">
        
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <BrainCircuit className="text-emerald-500"/> Daily Challenge
            </h1>
            <p className="text-slate-400">Question {current + 1} of {questions.length}</p>
        </div>

        {questions.length > 0 ? (
          <div className="bg-[#1e293b]/60 border border-slate-700 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
             {!showResult ? (
               <>
                 <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-6 tracking-widest">
                    <span>Topic: General Knowledge</span>
                    <span className="text-emerald-400">Score: {score}</span>
                 </div>

                 <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                   {questions[current].question}
                 </h2>

                 <div className="space-y-3">
                   {questions[current].options.map((opt: string, i: number) => (
                     <button
                       key={i}
                       onClick={() => selected === null && handleAnswer(i)}
                       disabled={selected !== null}
                       className={`w-full text-left p-4 rounded-xl border font-medium transition-all duration-300 flex justify-between items-center ${
                         selected === i 
                           ? i === questions[current].correctOption
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                              : "bg-red-500/20 border-red-500 text-red-400"
                           : selected !== null && i === questions[current].correctOption
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" // Show correct if wrong selected
                              : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                       }`}
                     >
                       {opt}
                       {selected === i && (
                          i === questions[current].correctOption ? <CheckCircle2 size={20}/> : <XCircle size={20}/>
                       )}
                     </button>
                   ))}
                 </div>
                 
                 {/* Progress Bar */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{width: `${((current + 1) / questions.length) * 100}%`}}
                    ></div>
                 </div>
               </>
             ) : (
               <div className="text-center py-10 animate-in zoom-in">
                  <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trophy size={48} className="text-yellow-400"/>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
                  <p className="text-slate-400 mb-8">You scored <span className="text-emerald-400 font-bold text-xl">{score}</span> out of {questions.length}</p>
                  
                  <div className="flex gap-4 justify-center">
                      <button onClick={restart} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
                          <RefreshCw size={18}/> Play Again
                      </button>
                  </div>
               </div>
             )}
          </div>
        ) : (
            <div className="text-center text-slate-500">
                <p>No questions added for today yet.</p>
            </div>
        )}

      </div>
    </div>
  );
}