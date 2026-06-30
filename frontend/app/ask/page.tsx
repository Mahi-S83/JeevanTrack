"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Send, Loader2, Sparkles, User, Bot, Clock, 
  Lightbulb, TrendingUp, Activity, AlertCircle, 
  CheckCircle, Pill, Heart, Droplet, Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isDemoUser } from "@/lib/demoMode";
import { loadHealthData } from '@/lib/dataService';

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  isFallback?: boolean;
};

// Demo Q&A pairs for fallback
const demoQA = [
  {
    keywords: ["condition", "have", "diagnosis", "diagnosed"],
    answer: "Based on your health records, you have the following conditions:\n• Iron Deficiency Anemia (Active)\n• Type 2 Diabetes (Recurring)\n• Fatty Liver (Resolved)"
  },
  {
    keywords: ["medication", "medicine", "prescription", "taking", "drug"],
    answer: "You are currently taking:\n• Iron supplements 100mg daily\n• Metformin 500mg twice daily\n• Vitamin D3 60,000 IU weekly"
  },
  {
    keywords: ["lab", "report", "test", "result", "hba1c", "blood", "sugar"],
    answer: "Your recent lab reports show:\n• HbA1c: 6.8% (improving from 7.4%)\n• Fasting Blood Sugar: 120 mg/dL\n• Ferritin: 45 ng/mL (improving)\n• Hemoglobin: 12.5 g/dL"
  },
  {
    keywords: ["doctor", "appointment", "visit", "follow", "follow-up"],
    answer: "Recommended follow-ups:\n• Repeat CBC and iron studies in 3 months\n• Repeat HbA1c in 3 months\n• Repeat Liver Function Test in 6 months"
  },
  {
    keywords: ["symptom", "feeling", "fatigue", "energy", "pain", "headache"],
    answer: "Your symptom history shows:\n• Fatigue (moderate) - improved after starting iron supplements\n• Energy levels improved within 2 weeks of treatment\n• No severe symptoms reported recently"
  }
];

const suggestedQuestions = [
  "What conditions do I have?",
  "What medications am I taking?",
  "Show my latest lab reports",
  "What should I discuss with my doctor?",
  "Summarize my health history",
  "How are my lab values trending?",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your AI health assistant. I can answer questions about your health records, lab results, medications, and more. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    setIsDemo(isDemoUser(email));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fallback: Answer from stored data without Gemini
  const getFallbackAnswer = async (question: string): Promise<string> => {
  const lower = question.toLowerCase();
  
  try {
    // ── Load ALL data ──
    const conditions = await loadHealthData();
    const allDocs = conditions.flatMap(c => c.documents);
    
    // ── Conditions ──
    if (lower.includes('condition') || lower.includes('have') || lower.includes('diagnosis')) {
      if (conditions.length === 0) {
        return "You haven't added any conditions yet. Upload a report to start tracking your health.";
      }
      const conditionList = conditions.map(c => `• ${c.name} (${c.status})`).join('\n');
      const docCount = allDocs.length;
      return `You have ${conditions.length} condition(s):\n\n${conditionList}\n\nTotal documents: ${docCount}`;
    }
    
    // ── Medications ──
    if (lower.includes('medication') || lower.includes('medicine') || lower.includes('prescription')) {
      const prescriptions = allDocs.filter(d => d.type === 'Prescription');
      if (prescriptions.length === 0) {
        return "No medications found in your records. Upload prescriptions to track them.";
      }
      const meds = prescriptions.map(d => `• ${d.name} (${d.reportDate || 'No date'})`).join('\n');
      return `Current medications:\n\n${meds}`;
    }
    
    // ── Lab Results ──
    if (lower.includes('lab') || lower.includes('test') || lower.includes('result') || lower.includes('report')) {
      const labs = allDocs.filter(d => d.type === 'Lab Report');
      if (labs.length === 0) {
        return "No lab reports found in your records. Upload lab reports to see results.";
      }
      const labSummary = labs.map(d => `• ${d.name} (${d.reportDate || 'No date'})`).join('\n');
      return `Recent lab reports:\n\n${labSummary}`;
    }
    
    // ── Summary ──
    if (lower.includes('summary') || lower.includes('overview')) {
      const totalDocs = allDocs.length;
      const conditionNames = conditions.map(c => c.name).join(', ');
      const activeCount = conditions.filter(c => c.status === 'active').length;
      const recentDate = allDocs.length > 0 ? allDocs.reduce((latest, d) => 
        d.reportDate > latest.reportDate ? d : latest
      ).reportDate : 'None';
      
      return `Your health summary:\n\n• ${conditions.length} conditions: ${conditionNames || 'None'}\n• ${activeCount} active condition(s)\n• ${totalDocs} total documents\n• Most recent: ${recentDate}`;
    }
    
    // ── Default ──
    return `I can help you with information about your health data. Try asking:\n\n• "What conditions do I have?"\n• "What medications am I taking?"\n• "Show my lab results"\n• "Give me a summary"\n• "What's my most recent report?"`;
    
  } catch (err) {
    console.error('Fallback answer generation failed:', err);
    return "I'm having trouble accessing your data. Please try again or check your connection.";
  }
};
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Not authenticated. Please log in again.");
      }

      // Try the real API first with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch('https://jeevantrack-backend.onrender.com/chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input.trim() }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const rawResponse = data.answer || data.response || "I couldn't find an answer to that question.";
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: rawResponse,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        // If API fails, use fallback
        const fallbackAnswer = await getFallbackAnswer(input.trim());
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fallbackAnswer + "\n\n(This answer was generated from your stored health data. AI service is temporarily unavailable.)",
          sender: "ai",
          timestamp: new Date(),
          isFallback: true,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
      
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || "Failed to get response. Please try again.");
      
      // Show fallback even on error
      const fallbackAnswer = await getFallbackAnswer(input.trim()); // ✅ With await
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackAnswer + "\n\n(Using offline mode. AI service is currently unavailable.)",
        sender: "ai",
        timestamp: new Date(),
        isFallback: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => {
    const text = message.text;
    const isAI = message.sender === "ai";
    const isFallback = message.isFallback || false;
    
    // Simple formatting: convert markdown bullets to HTML
    const formatted = text.split('\n').map((line, index) => {
      if (line.trim().startsWith('•')) {
        return <li key={index} className="ml-4 list-disc">{line.trim().substring(1).trim()}</li>;
      }
      if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
        return <li key={index} className="ml-4 list-disc">{line.trim().substring(2).trim()}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-1">{line}</p>;
    });

    return (
      <div>
        {formatted}
        {isFallback && isAI && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#5a7a80] bg-yellow-50 px-2 py-1 rounded-lg">
            <Shield className="w-3 h-3" />
            <span>Offline mode</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-orange-500 to-amber-400 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#1a2e32]">Ask AI</h1>
          <p className="text-xs text-[#5a7a80]">
            Ask questions about your health records
            {isDemo && <span className="ml-2 text-[#81CAD6]">· Demo</span>}
          </p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-xl text-sm mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-gray-100 p-4 space-y-4 shadow-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                message.sender === "user"
                  ? "bg-[#F97316]"
                  : "bg-linear-to-br from-orange-500 to-amber-400"
              }`}
            >
              {message.sender === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                message.sender === "user"
                  ? "bg-[#F97316] text-white rounded-tr-sm"
                  : message.isFallback
                    ? "bg-yellow-50 text-[#1a2e32] rounded-tl-sm border border-yellow-200"
                    : "bg-gray-50 text-[#1a2e32] rounded-tl-sm border border-gray-100"
              }`}
            >
              {renderMessage(message)}
              <div
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-white/70" : "text-[#5a7a80]"
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 to-amber-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      <div className="flex gap-2 overflow-x-auto py-3 pb-2 flex-wrap">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleSuggestion(question)}
            className="px-3 py-1.5 rounded-full text-xs bg-gray-50 border border-gray-200 text-[#5a7a80] hover:bg-orange-50 hover:border-orange-200 hover:text-[#1a2e32] transition-all whitespace-nowrap"
          >
            {question}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pb-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !isLoading) handleSend(); }}
          placeholder="Ask about your health..."
          className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-sm"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="w-11 h-11 rounded-full bg-[#F97316] text-white flex items-center justify-center hover:bg-[#EA580C] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}