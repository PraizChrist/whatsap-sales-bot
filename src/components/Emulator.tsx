import React, { useState, useEffect, useRef } from 'react';
import { Send, Smartphone, Terminal, Trash2, RefreshCw, Layers, Check, CheckCheck, Play, ArrowRight, Bot, Compass, ShieldCheck } from 'lucide-react';
import { Message, WebhookLogEntry, SimulatorProfile, BotProvider } from '../types';
import { SIMULATOR_PROFILES } from '../data';

interface EmulatorProps {
  appConfig: {
    appUrl: string;
    geminiConfigured: boolean;
    whatsappVerifyToken: string;
    twilioConfigured: boolean;
    metaConfigured: boolean;
  };
  refreshConfig: () => void;
}

export default function Emulator({ appConfig, refreshConfig }: EmulatorProps) {
  const [vendor, setVendor] = useState<BotProvider>('meta');
  const [selectedProfile, setSelectedProfile] = useState<SimulatorProfile>(SIMULATOR_PROFILES[0]);
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: 'init_welcome',
      sender: 'system',
      senderName: 'System',
      text: '🤖 Simulated WhatsApp handset connected. Click a preset message below or type your own.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [logs, setLogs] = useState<WebhookLogEntry[]>([]);
  const [activeTabConsole, setActiveTabConsole] = useState<'human' | 'raw_payload'>('human');
  const [consoleSelectedLog, setConsoleSelectedLog] = useState<WebhookLogEntry | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Poll for logs every 2 seconds
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/simulator/logs');
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        // Automatically set selected console log if none selected
        if (data.logs.length > 0 && !consoleSelectedLog) {
          setConsoleSelectedLog(data.logs[data.logs.length - 1]);
        }
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const clearLogs = async () => {
    try {
      await fetch('/api/simulator/clear-logs', { method: 'POST' });
      setLogs([]);
      setConsoleSelectedLog(null);
    } catch (err) {
      console.error('Error clearing logs:', err);
    }
  };

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      senderName: selectedProfile.name,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Update state to sent
    setTimeout(() => {
      setChatHistory(prev =>
        prev.map(m => m.id === userMessage.id ? { ...m, status: 'sent' } : m)
      );
    }, 300);

    try {
      const response = await fetch('/api/simulator/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderPhone: selectedProfile.phone,
          senderName: selectedProfile.name,
          text: textToSend,
          vendorConfig: vendor
        })
      });

      const result = await response.json();
      setIsTyping(false);

      if (response.ok && result.success) {
        // Mark user msg read
        setChatHistory(prev =>
          prev.map(m => m.id === userMessage.id ? { ...m, status: 'read' } : m)
        );

        // Add Bot Reply
        const botMessage: Message = {
          id: 'bot_' + Math.random().toString(36).substring(2, 9),
          sender: 'bot',
          senderName: 'WhatsApp Chabot',
          text: result.data.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent'
        };
        setChatHistory(prev => [...prev, botMessage]);

        // Refetch logs to display them
        await fetchLogs();
      } else {
        throw new Error(result.error || 'Server processing error');
      }
    } catch (err: any) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: 'err_' + Math.random().toString(36).substring(2, 9),
        sender: 'system',
        senderName: 'System',
        text: `⚠️ Webhook Error: ${err.message || 'The server process encountered a problem.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(inputText);
    }
  };

  const presets = [
    { label: 'Say hello', text: 'Hello bot' },
    { label: 'Check system status', text: '/status' },
    { label: 'Display commands', text: '/help' },
    { label: 'Ask general question', text: 'Why is the sky blue?' }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch h-full">
      
      {/* LEFT COLUMN: SIMULATOR PANEL (React Whatsapp Screen) */}
      <div className="xl:col-span-6 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[580px]">
        {/* Header config */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-55 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              WhatsApp Client Sandbox
            </h3>
            <p className="text-xs text-slate-500">Test webhook triggers locally</p>
          </div>
          
          {/* Provider Toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white p-0.5 shadow-xs">
            <button
              id="btn-meta-toggle"
              onClick={() => setVendor('meta')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                vendor === 'meta'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 bg-transparent'
              }`}
            >
              Meta Cloud API
            </button>
            <button
              id="btn-twilio-toggle"
              onClick={() => setVendor('twilio')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                vendor === 'twilio'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 bg-transparent'
              }`}
            >
              Twilio API
            </button>
          </div>
        </div>

        {/* Profile Details & Status Bar */}
        <div className="px-5 py-3 border-b border-slate-105 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src={selectedProfile.avatar}
              alt={selectedProfile.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">{selectedProfile.name}</span>
                {selectedProfile.verified && (
                  <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    WA Business Verified
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-550">{selectedProfile.phone}</span>
            </div>
          </div>

          {/* Quick Profile Switcher */}
          <select
            id="profile-switcher"
            value={selectedProfile.id}
            onChange={(e) => {
              const prof = SIMULATOR_PROFILES.find(p => p.id === e.target.value);
              if (prof) setSelectedProfile(prof);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-slate-850"
          >
            {SIMULATOR_PROFILES.map(p => (
              <option key={p.id} value={p.id}>Profile: {p.name}</option>
            ))}
          </select>
        </div>

        {/* Dynamic chat container */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 min-h-[300px] max-h-[450px] bg-[#efeae2] relative shadow-inner">
          {/* Subtle background tile mask pattern */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-repeat bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/WhatsApp_logo-color-vertical.svg/1024px-WhatsApp_logo-color-vertical.svg.png')]" />

          {/* Render chat bubbles */}
          {chatHistory.map((msg, index) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id || index} className="flex justify-center text-center">
                  <span className="bg-gray-200/85 text-gray-700 text-[11px] px-3 py-1 rounded-md max-w-sm border border-gray-300/40 relative z-10">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} relative z-10`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-xs ${
                    isUser
                      ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                      : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] text-gray-500 font-mono">{msg.timestamp}</span>
                    {isUser && (
                      <span>
                        {msg.status === 'pending' && <Check className="w-3 h-3 text-gray-400" />}
                        {msg.status === 'sent' && <Check className="w-3 h-3 text-gray-600" />}
                        {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-600" />}
                        {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start relative z-10">
              <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-xs border border-gray-100 flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick helper message shortcuts */}
        <div className="px-5 py-3 border-t border-slate-100 bg-[#fbfbfa] flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              id={`preset-btn-${idx}`}
              onClick={() => sendMessage(p.text)}
              className="px-3 py-1 text-xs bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-full transition-colors font-medium flex items-center gap-1"
            >
              <ArrowRight className="w-3 h-3 text-slate-500" />
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat input keyboard */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
          <input
            id="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type WhatsApp message..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-800 text-sm text-slate-800 transition-colors"
          />
          <button
            id="btn-chat-send"
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl transition-all font-semibold flex items-center justify-center ${
              inputText.trim()
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: DEVELOPER LOGS WORKSPACE */}
      <div className="xl:col-span-6 flex flex-col bg-gray-950 text-gray-200 border border-gray-900 rounded-2xl overflow-hidden min-h-[580px] font-mono shadow-md">
        
        {/* Header Admin section */}
        <div className="px-5 py-4 border-b border-gray-900 bg-gray-900 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider">
              Webhook Developer Console
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-logs"
              onClick={fetchLogs}
              className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors border border-gray-800"
              title="Refresh logs manual"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-clear-logs"
              onClick={clearLogs}
              className="p-1.5 hover:bg-red-950 hover:text-red-400 text-gray-400 rounded-lg transition-colors border border-gray-800 hover:border-red-900 flex items-center gap-1.5 text-xs"
              title="Clear Console Memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear logs
            </button>
          </div>
        </div>

        {/* Logs Split Viewer */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden h-full min-h-[450px]">
          
          {/* Internal Logger Event List Pane */}
          <div className="md:col-span-4 border-r border-gray-900 overflow-y-auto block max-h-[450px]">
            <div className="p-3 bg-gray-900/60 border-b border-gray-900 text-[10px] font-bold tracking-widest text-gray-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              PIPELINE WORKFLOWS
            </div>
            {logs.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-600 block italic">
                Logs will render immediately once simulated input flows...
              </div>
            ) : (
              <div className="divide-y divide-gray-900/60">
                {logs.map((log) => {
                  const isSelected = consoleSelectedLog?.id === log.id;
                  let badgeColor = 'bg-gray-800 text-gray-400';
                  if (log.type === 'incoming') badgeColor = 'bg-emerald-950 text-emerald-400 border border-emerald-900';
                  if (log.type === 'outgoing') badgeColor = 'bg-blue-950 text-blue-400 border border-blue-900';
                  if (log.type === 'error') badgeColor = 'bg-red-950 text-red-400 border border-red-900';

                  return (
                    <button
                      key={log.id}
                      id={`log-item-${log.id}`}
                      onClick={() => setConsoleSelectedLog(log)}
                      className={`w-full text-left p-3 text-xs transition-colors flex flex-col gap-1.5 ${
                        isSelected ? 'bg-gray-900 text-white border-l-2 border-emerald-500' : 'hover:bg-gray-900/40 text-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badgeColor}`}>
                          {log.type.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-gray-600">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <span className="font-semibold truncate text-[11px] block text-gray-200">
                        {log.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed JSON / Human Readable Payload Inspector */}
          <div className="md:col-span-8 flex flex-col overflow-y-auto max-h-[450px] bg-black/40">
            {consoleSelectedLog ? (
              <div className="p-5 flex flex-col h-full flex-1">
                {/* Meta header details */}
                <div className="flex justify-between items-start gap-3 border-b border-gray-900 pb-4 mb-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">
                      {consoleSelectedLog.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {consoleSelectedLog.description}
                    </p>
                  </div>
                </div>

                {/* Sub Tab selection */}
                <div className="flex bg-gray-950 border border-gray-900 rounded-lg p-0.5 max-w-xs mb-3">
                  <button
                    id="console-tab-human"
                    onClick={() => setActiveTabConsole('human')}
                    className={`flex-1 text-center py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${
                      activeTabConsole === 'human' ? 'bg-gray-900 text-emerald-400 font-semibold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Human Review
                  </button>
                  <button
                    id="console-tab-payload"
                    onClick={() => setActiveTabConsole('raw_payload')}
                    className={`flex-1 text-center py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${
                      activeTabConsole === 'raw_payload' ? 'bg-gray-900 text-emerald-400 font-semibold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Raw Json API
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-auto bg-[#0a0a0a] border border-gray-900 rounded-xl p-4 text-[11px] min-h-[220px]">
                  {activeTabConsole === 'human' ? (
                    <div className="space-y-3.5 font-sans leading-relaxed text-gray-300">
                      <div>
                        <span className="text-gray-500 font-mono text-[10px] block uppercase font-bold">Event Category</span>
                        <p className="text-xs mt-0.5 text-gray-100 font-semibold capitalize">{consoleSelectedLog.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-mono text-[10px] block uppercase font-bold">API Gateway Provider</span>
                        <p className="text-xs mt-0.5 text-gray-100 font-semibold capitalize">{consoleSelectedLog.vendor} WhatsApp API</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-mono text-[10px] block uppercase font-bold">Timestamp UTC</span>
                        <p className="text-xs mt-0.5 text-gray-100 font-semibold font-mono">{consoleSelectedLog.timestamp}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-mono text-[10px] block uppercase font-bold">Step Analysis</span>
                        <p className="text-xs mt-1 text-emerald-400 bg-emerald-950/25 border border-emerald-900/40 px-3 py-2 rounded-lg font-mono leading-relaxed">
                          {consoleSelectedLog.type === 'incoming' && '📥 Server webhook parsed incoming payload JSON, mapped parameters, extracted sender cellphone and body text, and routed it to core engine controllers.'}
                          {consoleSelectedLog.type === 'log' && '⚙️ Internal log message generated during chatbot decision tree, Gemini request/response handling, or routing updates.'}
                          {consoleSelectedLog.type === 'outgoing' && '📤 Chatbot generated reply message. Formulated standard outbound HTTP JSON query body schema to post back to WhatsApp Meta API servers.'}
                          {consoleSelectedLog.type === 'error' && '❌ Runtime error intercepted during code execution pipeline. Check schema mappings, validation signatures, or API config limits.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-emerald-400 leading-normal scrollbar-thin">
                      {JSON.stringify(consoleSelectedLog.payload, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full flex-1">
                <Compass className="w-10 h-10 text-gray-700 animate-pulse mb-3" />
                <span className="text-xs text-gray-500 font-sans">
                  Select a workflow log in the left list to inspect JSON payload properties.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Server status indicator bar footer */}
        <div className="p-3 bg-gray-950 border-t border-gray-900 flex flex-wrap justify-between items-center text-[10px] text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span>EXPRESS PIPELINE PORT: 3000</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              Gemini AI: {appConfig.geminiConfigured ? (
                <span className="text-emerald-500 text-[9px] font-bold">● ONLINE</span>
              ) : (
                <span className="text-yellow-600 text-[9px] font-bold">● LOCAL FALLBACK ONLY</span>
              )}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
