import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, FileText, Check, Copy, HelpCircle, FileCode, AlertCircle } from 'lucide-react';
import { CodeTemplate, BotProvider } from '../types';
import { getCodeTemplates } from '../data';

interface CodeGeneratorProps {
  appConfig: {
    appUrl: string;
    geminiConfigured: boolean;
    whatsappVerifyToken: string;
    twilioConfigured: boolean;
    metaConfigured: boolean;
  };
}

export default function CodeGenerator({ appConfig }: CodeGeneratorProps) {
  const [vendor, setVendor] = useState<'meta' | 'twilio'>('meta');
  const [useAI, setUseAI] = useState<boolean>(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const verifyToken = appConfig.whatsappVerifyToken || 'my_verification_token';
  const templates = getCodeTemplates({ provider: vendor, useAI, verifyToken });
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const activeTemplate = templates[selectedFileIdx];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
      {/* Configuration Header Panel */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-slate-800" />
            Interactive WhatsApp Bot Code Architect
          </h3>
          <p className="text-xs text-slate-550 mt-0.5">Customize your bot stack and copy clean production-ready code blocks instantly.</p>
        </div>

        {/* Dynamic Controls Toggles */}
        <div className="flex flex-wrap items-center gap-5">
          {/* Provider Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">API Provider Gateway</span>
            <div className="flex border border-slate-200 rounded-lg p-0.5 bg-white shadow-xs">
              <button
                id="codegen-meta"
                onClick={() => setVendor('meta')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  vendor === 'meta' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Meta Cloud API
              </button>
              <button
                id="codegen-twilio"
                onClick={() => setVendor('twilio')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  vendor === 'twilio' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Twilio WhatsApp Sandbox
              </button>
            </div>
          </div>

          {/* AI Toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Gemini AI Engine</span>
            <button
              id="codegen-toggle-ai"
              onClick={() => setUseAI(!useAI)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-slate-350 transition-all text-xs text-slate-700 font-semibold shadow-xs cursor-pointer"
            >
              {useAI ? (
                <>
                  <ToggleRight className="w-5 h-5 text-emerald-600 animate-pulse" />
                  Gemini API v1.29 Enabled
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                  Local Fallback Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 h-full items-stretch min-h-[480px]">
        {/* Left Side File Explorer Sidebar */}
        <div className="lg:col-span-3 border-r border-slate-100 bg-[#fbfbfa] p-4 space-y-3.5 font-sans">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 font-mono">
            PROJECT BLUEPRINT FILES
          </div>
          <div className="space-y-1">
            {templates.map((file, idx) => {
              const isActive = selectedFileIdx === idx;
              return (
                <button
                  key={idx}
                  id={`btn-file-select-${idx}`}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${isActive ? 'text-slate-100' : 'text-slate-400'}`} />
                    <span>{file.filename}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${isActive ? 'text-slate-405' : 'text-slate-400'}`}>{file.language.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Technical Review Box */}
          <div className="p-3.5 bg-slate-100/60 rounded-xl border border-slate-200 text-[11px] leading-relaxed text-slate-600 space-y-1.5 font-sans">
            <h5 className="font-bold font-sans text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-900" />
              Developer Prerequisite
            </h5>
            <p className="font-medium text-slate-550">
              This code architecture implements <strong>Webhook authorization, request parsers, dynamic routers, and lazy loading API triggers</strong>. Safe for high-scale continuous operations.
            </p>
          </div>
        </div>

        {/* Right Code Display Screen with Syntax Highlight Box */}
        <div className="lg:col-span-9 flex flex-col bg-slate-950 text-slate-200 font-mono text-xs overflow-hidden h-full">
          {/* File Header Tab bar controller */}
          <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-850 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
              <span className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
              <span className="w-2.5 h-2.5 bg-slate-600 rounded-full" />
              <span className="text-[11px] text-slate-400 ml-2 font-mono">
                {activeTemplate?.name} — {activeTemplate?.filename}
              </span>
            </div>
            
            {/* Copy Button */}
            <button
              id="btn-copy-code"
              onClick={() => copyToClipboard(activeTemplate?.content || '', selectedFileIdx)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-755 text-white rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer"
            >
              {copiedIndex === selectedFileIdx ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </>
              )}
            </button>
          </div>

          {/* Interactive Code Frame */}
          <div className="flex-1 overflow-auto p-5 leading-normal max-h-[500px] bg-slate-950/80">
            <pre className="text-emerald-400 select-all font-mono whitespace-pre text-left">
              <code>{activeTemplate?.content}</code>
            </pre>
          </div>

          {/* Tip Info line */}
          <div className="px-5 py-2.5 border-t border-slate-900 bg-slate-950 text-[10px] font-mono font-medium text-slate-500 flex justify-between flex-wrap gap-2">
            <span>READY TO EXPORT</span>
            <span>PRESS CTRL+A TO SELECT ALL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
