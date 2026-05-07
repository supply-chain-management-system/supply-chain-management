import { useState, useRef, useEffect } from 'react';
import apiClient from '../../../api/api'; // Adjust path if your api.jsx is located differently

const CopilotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I am your Korvex Copilot. How can I assist you with the supply chain today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to the newest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    // Add user message to UI immediately
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputValue('');
    setIsLoading(true);

    try {
      // REAL API CALL TO YOUR LANGGRAPH BACKEND
      const response = await apiClient.post('/business-manager/copilot/command', {
        prompt: userText,
        user_id: 1 // We will replace this with real Auth context later
      });

      // Add AI response to UI
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error("Copilot Error:", error);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "⚠️ System Error: Unable to connect to the Korvex Agent backend." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden transition-all">
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-sm tracking-wide">Korvex Copilot</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 border border-slate-200 p-3 rounded-xl rounded-bl-none shadow-sm text-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Copilot to do something..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-4 shadow-xl border-4 border-white transition-transform hover:scale-105 flex items-center justify-center"
        >
          {/* Simple AI Sparkle Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default CopilotWidget;