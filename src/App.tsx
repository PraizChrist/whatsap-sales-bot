import React, { useState, useEffect } from 'react';
import { Smartphone, FileCode, Settings, Cloud, Globe, Bot, Layers, Compass, ExternalLink } from 'lucide-react';
import Emulator from './components/Emulator';
import CodeGenerator from './components/CodeGenerator';
import SetupInstructions from './components/SetupInstructions';
import DeploymentGuide from './components/DeploymentGuide';
import WebhookAdmin from './components/WebhookAdmin';

export default function App() {
  const [activeTab, setActiveTab] = useState<'emulator' | 'codegen' | 'setup' | 'deploy' | 'webhook'>('emulator');
  const [appConfig, setAppConfig] = useState({
    appUrl: 'http://localhost:3000',
    geminiConfigured: false,
    whatsappVerifyToken: 'my_verification_token',
    twilioConfigured: false,
    metaConfigured: false
  });

  const fetchAppConfig = async () => {
    try {
      const res = await fetch('/api/app-config');
      if (res.ok) {
        const data = await res.json();
        setAppConfig(data);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  useEffect(() => {
    fetchAppConfig();
  }, []);

  const navItems = [
    {
      id: 'emulator' as const,
      num: '01',
      label: 'WhatsApp Sandbox',
      desc: 'Simulate bot triggers',
      icon: Smartphone,
    },
    {
      id: 'codegen' as const,
      num: '02',
      label: 'Bot Code Architect',
      desc: 'Export workspace files',
      icon: FileCode,
    },
    {
      id: 'setup' as const,
      num: '03',
      label: 'Developer API Setup',
      desc: 'Meta & Twilio setup guidelines',
      icon: Settings,
    },
    {
      id: 'deploy' as const,
      num: '04',
      label: 'Cloud Deployment',
      desc: 'Deploy 24/7 to the web',
      icon: Cloud,
    },
    {
      id: 'webhook' as const,
      num: '05',
      label: 'Live Webhook Manager',
      desc: 'Secure callback diagnostics',
      icon: Globe,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Dynamic Header Workspace Title */}
      <header className="bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-sm flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">WhatsApp Bot DevOps Portal</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Express v4
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Production Deployment Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">ACTIVE LOCALWEBPORTAL</span>
              <span className="text-xs font-mono font-medium text-slate-600 truncate max-w-xs">{appConfig.appUrl}</span>
            </div>
            <a
              href={`${appConfig.appUrl}/api/webhook`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
            >
              Verify Endpoint
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container Grid Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Column (Sidebar layout) */}
        <aside className="lg:w-72 shrink-0 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-mono">WORKSPACE SECTIONS</span>
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center space-x-3 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white rounded-xl shadow-xs'
                        : 'text-slate-600 hover:bg-slate-150 hover:text-slate-900 transition-colors'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {item.num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Prompt / Secrets Instruction Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">CONVERSATIONAL INTELLIGENCE</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${appConfig.geminiConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <h5 className="text-xs font-bold text-slate-800">Google Gemini AI</h5>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              {appConfig.geminiConfigured 
                ? 'Your webhook is currently active with a Gemini AI API secret trigger. Automated conversations are running.' 
                : 'Configure your GEMINI_API_KEY in the Settings > Secrets menu to automatically handle natural language queries.'}
            </p>
          </div>
        </aside>

        {/* Content Column Frame */}
        <section className="flex-1 min-w-0">
          {activeTab === 'emulator' && <Emulator appConfig={appConfig} refreshConfig={fetchAppConfig} />}
          {activeTab === 'codegen' && <CodeGenerator appConfig={appConfig} />}
          {activeTab === 'setup' && <SetupInstructions />}
          {activeTab === 'deploy' && <DeploymentGuide />}
          {activeTab === 'webhook' && <WebhookAdmin appConfig={appConfig} refreshConfig={fetchAppConfig} />}
        </section>

      </main>

      {/* Footer Details */}
      <footer className="bg-white border-t border-slate-200 py-5 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
          <div className="flex flex-wrap gap-6">
            <span>Project ID: WA-BOT-0912</span>
            <span>Region: us-east-1</span>
            <span>Stable Express Router</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              API Standard Verified
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
