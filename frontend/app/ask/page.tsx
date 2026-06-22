"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User, Bot, Clock, Lightbulb, TrendingUp, Activity, AlertCircle, CheckCircle, Pill, Heart, Droplet } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  isFormatted?: boolean;
};

const suggestedQuestions = [
  "What are my most concerning health issues?",
  "Summarize my recent lab results",
  "What medications am I currently taking?",
  "Are there any recurring patterns in my health?",
  "What should I discuss with my doctor?",
  "How are my vitamin levels trending?",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your AI health assistant. I can answer questions about your health records, lab results, medications, and more. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
      isFormatted: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatAIResponse = (text: string) => {
    // If text already has markdown-like formatting, clean it
    let formatted = text;
    
    // Remove markdown bold/italic
    formatted = formatted.replace(/\*\*/g, "");
    formatted = formatted.replace(/\*/g, "");
    
    // Convert numbered lists to proper bullets
    formatted = formatted.replace(/\d+\.\s*/g, "• ");
    
    // Add line breaks after each bullet
    formatted = formatted.replace(/•\s/g, "\n• ");
    
    // Clean up multiple newlines
    formatted = formatted.replace(/\n{3,}/g, "\n\n");
    
    return formatted.trim();
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

      const response = await fetch('https://jeevantrack-backend.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const rawResponse = data.answer || data.response || "I couldn't find an answer to that question.";
      
      // Format the response nicely
      const formattedResponse = formatAIResponse(rawResponse);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: formattedResponse,
        sender: "ai",
        timestamp: new Date(),
        isFormatted: true,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || "Failed to get response. Please try again.");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process your question. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date(),
        isFormatted: false,
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

  const renderMessage = (message: Message) => {
    const text = message.text;
    const isAI = message.sender === "ai";
    
    // If it's a user message or not formatted, just render as plain text
    if (!isAI || !message.isFormatted) {
      return <div className="whitespace-pre-wrap">{text}</div>;
    }

    // Parse bullet points
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Check if the response has bullet points
    const hasBullets = lines.some(line => line.trim().startsWith('•'));
    
    if (hasBullets) {
      // Extract title (first line that doesn't start with bullet)
      let title = "";
      let bullets = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('•')) {
          bullets.push(line.substring(1).trim());
        } else if (bullets.length === 0) {
          title = line;
        } else {
          // If we already have bullets and this line doesn't start with bullet, add it as a bullet
          if (line.length > 0) {
            bullets.push(line);
          }
        }
      }
      
      // If no title found, use the first bullet as title
      if (!title && bullets.length > 0) {
        title = bullets[0];
        bullets = bullets.slice(1);
      }
      
      return (
        <div>
          {title && <div className="font-semibold text-[#1a2e32] mb-2">{title}</div>}
          <ul className="space-y-2">
            {bullets.map((bullet, index) => {
              // Check if bullet contains a colon for key-value display
              const parts = bullet.split(':');
              const hasKey = parts.length > 1;
              const key = hasKey ? parts[0].trim() : "";
              const value = hasKey ? parts.slice(1).join(':').trim() : bullet;
              
              // Determine icon based on content
              let icon = <Lightbulb className="w-4 h-4 text-orange-500 shrink-0" />;
              const lowerValue = value.toLowerCase();
              if (lowerValue.includes('deficiency') || lowerValue.includes('low')) {
                icon = <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
              } else if (lowerValue.includes('normal') || lowerValue.includes('healthy')) {
                icon = <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
              } else if (lowerValue.includes('medication') || lowerValue.includes('prescription') || lowerValue.includes('drug')) {
                icon = <Pill className="w-4 h-4 text-orange-500 shrink-0" />;
              } else if (lowerValue.includes('heart') || lowerValue.includes('cardiac')) {
                icon = <Heart className="w-4 h-4 text-red-500 shrink-0" />;
              } else if (lowerValue.includes('blood') || lowerValue.includes('iron') || lowerValue.includes('hemoglobin')) {
                icon = <Droplet className="w-4 h-4 text-blue-500 shrink-0" />;
              }
              
              return (
                <li key={index} className="flex items-start gap-2 text-[#1a2e32] text-sm leading-relaxed">
                  <span className="mt-0.5">{icon}</span>
                  <span>
                    {hasKey ? (
                      <>
                        <span className="font-medium">{key}:</span> {value}
                      </>
                    ) : (
                      bullet
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    
    // If no bullets, just render as plain text with line breaks
    return <div className="whitespace-pre-wrap leading-relaxed">{text}</div>;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
          <p className="text-xs text-[#5a7a80]">Ask questions about your health records</p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm mb-3 flex items-center gap-2">
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
                  : "bg-gray-50 text-[#1a2e32] rounded-tl-sm border border-gray-100"
              }`}
            >
              {renderMessage(message)}
              <div
                className={`text-xs mt-2 ${
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
            onClick={function() { handleSuggestion(question); }}
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
          onChange={function(e) { setInput(e.target.value); }}
          onKeyDown={function(e) { if (e.key === "Enter" && !isLoading) handleSend(); }}
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