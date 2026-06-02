import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/api';

export default function KorvexCopilot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { text: "Hello! I am your Korvex AI Supervisor. How can I help you today?", sender: "ai" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 STABLE SESSION INITIALIZATION: Stays locked in memory on re-renders
  const [sessionId] = useState(() => {
    let saved = localStorage.getItem("korvex_chat_session_id");
    if (!saved) {
      saved = `kvx-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem("korvex_chat_session_id", saved);
    }
    return saved;
  });

  const messagesEndRef = useRef(null);

  // 🔄 HYDRATE HISTORY: Pulls matching human and AI arrays from MongoDB
  useEffect(() => {
    if (!sessionId || !isOpen) return;

    setIsLoading(true);
    api.get(`/copilot/history/${sessionId}`)
      .then((response) => {
            console.log(response.data)

        if (response.data && response.data.history && response.data.history.length > 0) {
          const loadedMessages = response.data.history.map(msg => ({
            text: msg.content || msg.text || "", 
            // 🚀 FIXED: Accurately maps backend types to frontend visual alignment states
            sender: msg.type === "ai" ? "ai" : "user"
          }));
          
          // Prepend default greetings banner above historical logs
          setMessages([
            { text: "Hello! I am your Korvex AI Supervisor. How can I help you today?", sender: "ai" },
            ...loadedMessages
          ]);
        }
      })
      .catch((error) => {
        console.error("Failed to load chat history:", error);
      })
      .finally(() => setIsLoading(false));
  }, [sessionId, isOpen]);

  // 📜 AUTO SCROLL: Pin window viewport down to the latest text nodes
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // ✉️ TRANSMIT MESSAGE LOOP
  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    
    setMessages((prev) => [...prev, { text: userText, sender: "user" }]);
    setIsLoading(true);

    api.post(`/copilot/chat/${sessionId}`, { user_input: userText })
      .then((response) => {
        setMessages((prev) => [...prev, { text: response.data.reply, sender: "ai" }]);
      })
      .catch((error) => {
        let errorMessage = "Sorry, I lost connection to the server.";
        if (error.response) {
          if (error.response.status === 408) errorMessage = "I'm taking too long to think. Please try again.";
          else if (error.response.status === 401) errorMessage = "Your session expired. Please log in again.";
          else if (error.response.data?.detail) errorMessage = error.response.data.detail;
        }
        setMessages((prev) => [...prev, { text: errorMessage, sender: "error" }]);
      })
      .finally(() => setIsLoading(false));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-24 right-6 z-[9999] w-[380px] h-[550px] flex flex-col rounded-2xl shadow-2xl overflow-hidden font-sans transition-all duration-300"
      style={{ 
        background: "#0b0f1a", 
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 25px 50px -12px rgba(0,200,140,0.15)"
      }}
    >
      {/* Header Context Frame */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#00c88c] to-[#00a06e]">
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wide">Korvex Copilot</h3>
          </div>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Main Messages Dynamic Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
            <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${msg.sender === "user" ? "bg-[#00c88c] text-white rounded-br-sm" : msg.sender === "error" ? "bg-red-500/10 text-red-400 rounded-bl-sm" : "bg-white/10 text-gray-200 rounded-bl-sm"}`}>
              {msg.sender === "error" && <AlertCircle size={14} className="inline mr-1.5" />}
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex max-w-[85%] mr-auto items-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/5 text-gray-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[#00c88c]" />
              <span className="text-[12px]">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Input Form Block */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-[#0b0f1a] border border-white/10 rounded-xl p-1.5">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask a question..." 
            disabled={isLoading} 
            className="flex-1 bg-transparent px-3 py-2 text-[13px] text-white outline-none" 
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="p-2 rounded-lg bg-[#00c88c] text-white">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}