import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Minus,
  Send, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Check, 
  AlertTriangle, 
  HelpCircle,
  FileSearch,
  RefreshCw,
  Info,
  GripHorizontal
} from 'lucide-react';
import { sendAssistantMessage } from '../../services/api';

export default function AIAssistantDrawer({ isOpen, onClose, currentRecord }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [chatPos, setChatPos] = useState(null);
  
  const messagesEndRef = useRef(null);
  const windowRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Set initial welcome prompt when drawer opens or currentRecord changes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting = currentRecord 
        ? `Hello! I am **Trust Vision AI Investigator**. I am ready to inspect forensic evidence for **${currentRecord.filename}** (Status: **${currentRecord.status}**).\n\nSelect a quick action below or ask any question about the model prediction, SHA-256 hash, metadata, or detected issues.`
        : `Hello! I am **Trust Vision AI Investigator**. I help explain computer vision integrity analysis, SHA-256 hash verification, model predictions, and metadata findings.\n\nUpload or select an analysis record to begin investigating.`;

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, currentRecord]);

  // Dragging logic for floating chat window header
  const handleHeaderMouseDown = (e) => {
    if (e.target.closest('button')) return;
    if (e.button !== 0) return;

    const elem = windowRef.current;
    if (!elem) return;

    const rect = elem.getBoundingClientRect();
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { x: rect.left, y: rect.top };

    const onMouseMove = (ev) => {
      if (!isDraggingRef.current) return;
      const dx = ev.clientX - dragStartRef.current.x;
      const dy = ev.clientY - dragStartRef.current.y;

      let newX = initialPosRef.current.x + dx;
      let newY = initialPosRef.current.y + dy;

      const width = rect.width || 400;
      const height = rect.height || 560;
      const maxX = window.innerWidth - width - 10;
      const maxY = window.innerHeight - height - 10;

      newX = Math.max(10, Math.min(newX, maxX));
      newY = Math.max(10, Math.min(newY, maxY));

      setChatPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleHeaderTouchStart = (e) => {
    if (e.target.closest('button')) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];

    const elem = windowRef.current;
    if (!elem) return;

    const rect = elem.getBoundingClientRect();
    isDraggingRef.current = true;
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialPosRef.current = { x: rect.left, y: rect.top };

    const onTouchMove = (ev) => {
      if (!isDraggingRef.current || ev.touches.length !== 1) return;
      const t = ev.touches[0];
      const dx = t.clientX - dragStartRef.current.x;
      const dy = t.clientY - dragStartRef.current.y;

      let newX = initialPosRef.current.x + dx;
      let newY = initialPosRef.current.y + dy;

      const width = rect.width || 400;
      const height = rect.height || 560;
      const maxX = window.innerWidth - width - 10;
      const maxY = window.innerHeight - height - 10;

      newX = Math.max(10, Math.min(newX, maxX));
      newY = Math.max(10, Math.min(newY, maxY));

      setChatPos({ x: newX, y: newY });
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query || !query.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await sendAssistantMessage(query.trim(), currentRecord, messages);
      setIsLoading(false);

      if (res.success && res.reply) {
        const assistantMsg = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          provider: res.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'AI Investigator is temporarily unavailable. Your original analysis results remain available.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'AI Investigator encountered a network error. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActions = [
    { label: 'Explain this analysis', icon: Sparkles },
    { label: 'Why was this file flagged?', icon: AlertTriangle },
    { label: 'Explain the hash result', icon: ShieldCheck },
    { label: 'Explain detected issues', icon: HelpCircle },
    { label: 'Generate Investigation Summary', icon: FileText }
  ];

  return (
    <div 
      ref={windowRef}
      style={
        chatPos
          ? { left: `${chatPos.x}px`, top: `${chatPos.y}px`, bottom: 'auto', right: 'auto' }
          : {}
      }
      className={`fixed z-50 w-[380px] sm:w-[440px] max-w-[calc(100vw-24px)] h-[560px] max-h-[calc(100vh-100px)] bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-shadow ${
        !chatPos ? 'bottom-20 right-6' : ''
      }`}
    >
      
      {/* Draggable Chat Window Header */}
      <div 
        onMouseDown={handleHeaderMouseDown}
        onTouchStart={handleHeaderTouchStart}
        className="px-4 py-3 border-b border-[#E5E7EB] dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2.5 pointer-events-none">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5 tracking-tight">
              AI Investigator Chat
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Forensic Evidence & Integrity Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={onClose}
            aria-label="Minimize AI Investigator"
            title="Minimize Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            aria-label="Close AI Investigator"
            title="Close Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Target Record Banner */}
      {currentRecord ? (
        <div className="px-4 py-2 bg-blue-50/60 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileSearch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {currentRecord.filename}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
            currentRecord.status === 'TRUSTED'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
              : currentRecord.status === 'SUSPICIOUS'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
          }`}>
            {currentRecord.status}
          </span>
        </div>
      ) : (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 shrink-0">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span className="truncate">No file selected. Ask any general computer vision question!</span>
        </div>
      )}

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
        
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className={`max-w-[88%] rounded-2xl p-3.5 transition-all shadow-xs ${
                isUser 
                  ? 'bg-[#2563EB] text-white rounded-br-none' 
                  : 'bg-slate-50 dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
              }`}>
                
                {/* Assistant Header Icon if Assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Investigator</span>
                    </div>
                    
                    {/* Copy Action */}
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-[10px]"
                      title="Copy explanation"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Formatted Text Content */}
                <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {msg.content.split('\n').map((paragraph, pIdx) => {
                    if (!paragraph.trim()) return <div key={pIdx} className="h-1.5" />;
                    return (
                      <p key={pIdx} className="mb-1 last:mb-0">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

              </div>

              <span className="text-[10px] text-slate-400 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-2xl rounded-bl-none max-w-[80%] text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>AI Investigator is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Pills & Input Bar */}
      <div className="p-3 border-t border-[#E5E7EB] dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur space-y-2.5 shrink-0">
        
        {/* Quick Actions Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(action.label)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about this analysis..."
            disabled={isLoading}
            className="flex-1 h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:text-slate-100 placeholder-slate-400 transition-colors"
          />

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="h-10 w-10 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
            title="Send prompt"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>

      </div>

    </div>
  );
}
