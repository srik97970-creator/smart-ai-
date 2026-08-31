import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { t } from '../utils/translations';

export default function AiAgent({ lang, navigateTo, params }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: t(lang, 'askAssistantPrompt'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle parameter triggers (auto-sending prompts from Dashboard/Mini widgets)
  useEffect(() => {
    if (params && params.autoSendPrompt) {
      handleSendPrompt(params.autoSendPrompt);
    }
  }, [params]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendPrompt = async (promptText) => {
    if (!promptText.trim()) return;

    // 1. Add user message
    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // 2. Fetch AI response
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, language: lang })
      });
      const data = await res.json();

      // 3. Add AI message
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.response,
        action: data.action || null, // structural response actions
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error in AI Chat Agent:', err);
      const errMsg = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an error checking your shop data. Please check connection and try again.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleSendPrompt(inputValue);
  };

  const suggestionChips = [
    "What is my profit today?",
    "Which product sold the most this month?",
    "Which products need restocking?",
    "Create an offer for my slow-moving products.",
    "Which products give me the highest profit?"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Title */}
      <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
        <div>
          <h1 className="text-xl lg:text-2xl font-black tracking-tight flex items-center gap-1.5">
            <span className="p-1 bg-primary-500 text-white rounded-lg"><Bot size={20} /></span>
            SmartShop AI Agent
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Your personal business growth consultant, backed by real-time store analytics.</p>
        </div>
      </div>

      {/* Main chat window container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
        
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start' : 'self-end flex-row-reverse'}`}
              >
                {/* Avatar bubble */}
                <span className={`p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 text-white ${isAi ? 'bg-indigo-600' : 'bg-primary-600'}`}>
                  {isAi ? <Bot size={14} /> : <User size={14} />}
                </span>

                {/* Content bubble */}
                <div className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  isAi 
                    ? 'bg-gray-50 dark:bg-gray-750 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200' 
                    : 'bg-primary-500 border-primary-600 text-white shadow-md'
                }`}>
                  <p className="whitespace-pre-wrap font-medium">{msg.text}</p>

                  {/* Rendering Structural responses actions inside chat */}
                  {isAi && msg.action && (
                    <div className="border-t border-gray-200 dark:border-gray-650 pt-2.5 mt-2 flex flex-col gap-2">
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} className="text-primary-500" /> Action Available:
                      </p>
                      {msg.action.type === 'create_offer' ? (
                        <button
                          onClick={() => navigateTo('offers', { autoCreateOfferProdId: msg.action.product_id })}
                          className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 shadow-sm self-start"
                        >
                          <Percent size={12} /> {msg.action.label || 'Create Discount Offer'} <ArrowRight size={10} />
                        </button>
                      ) : msg.action.type === 'navigate' ? (
                        <button
                          onClick={() => navigateTo(msg.action.target.replace('/', ''))}
                          className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 shadow-sm self-start"
                        >
                          {msg.action.label || 'Execute Command'} <ArrowRight size={10} />
                        </button>
                      ) : null}
                    </div>
                  )}

                  <span className={`text-[9px] block text-right font-medium mt-1 ${isAi ? 'text-gray-400' : 'text-primary-200'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex gap-3 self-start items-center">
              <span className="p-2 bg-indigo-600 rounded-full text-white h-8 w-8 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </span>
              <div className="bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl flex items-center gap-1.5 shadow-sm text-xs">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="text-gray-400 font-bold ml-1">AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips Box */}
        <div className="p-3 border-t border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850/50 flex gap-2 overflow-x-auto shrink-0 select-none">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(chip)}
              className="text-[10px] bg-white dark:bg-gray-700 hover:bg-primary-50 border border-gray-200 dark:border-gray-650 hover:border-primary-200 text-gray-600 dark:text-gray-200 px-3 py-1.5 rounded-full font-bold whitespace-nowrap shadow-sm transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleFormSubmit} className="p-4 border-t dark:border-gray-700 flex gap-2 shrink-0">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI e.g. How much did I earn this month?"
            className="flex-1 bg-gray-50 dark:bg-gray-700/50 border border-gray-250 dark:border-gray-600 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-primary-600 hover:bg-primary-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white p-3.5 rounded-xl shadow-lg transition"
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
