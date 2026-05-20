import React, { useState } from 'react';
import { ToggleLeft, ShieldCheck, CheckCircle2, Bookmark, Settings, CheckSquare, Layers, Key, Smartphone, HelpCircle } from 'lucide-react';

export default function SetupInstructions() {
  const [activeTab, setActiveTab] = useState<'meta' | 'twilio'>('meta');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
      {/* Header Panel */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-800" />
            WhatsApp Official API Setup Guide
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Learn how to activate Meta developer configurations and configure secure webhook tokens.</p>
        </div>

        {/* Setup Provider Toggle */}
        <div className="flex border border-slate-200 rounded-lg p-0.5 bg-white shadow-xs">
          <button
            id="setup-tab-meta"
            onClick={() => setActiveTab('meta')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'meta' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Meta Cloud API (Recommended)
          </button>
          <button
            id="setup-tab-twilio"
            onClick={() => setActiveTab('twilio')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'twilio' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Twilio Sandbox (Simple Test)
          </button>
        </div>
      </div>

      {/* Main instructions content */}
      <div className="p-6 md:p-8 space-y-8 max-h-[600px] overflow-y-auto">
        
        {activeTab === 'meta' ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed font-semibold">
                <p className="font-bold text-slate-800">What is WhatsApp Cloud API (Meta)?</p>
                <p className="mt-1 font-medium leading-relaxed">
                  It is Meta's official WhatsApp Hosting solution launched in 2022. It is free for up to 1,000 developer conversation threads/monthly, has ultra-low reply latency, and is the absolute standard for production apps.
                </p>
              </div>
            </div>

            {/* Step-by-Step Meta Instructions */}
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">1</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Register Meta Developer Portal</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Navigate to the <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-bold">Meta Developers Console</a>. Log in, click on <strong>Create App</strong>, select <strong>Other</strong>, and choose <strong>Business</strong>. Set your name.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">2</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Add WhatsApp Product Integration</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Inside your new Developer App dashboard, scroll down, find <strong>WhatsApp</strong> and click on <strong>Set Up</strong>. Match your business account metrics or create a temporary mock company sandbox template.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">3</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Map Temporary Credentials</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed font-sans font-medium">
                    Once inside files, you will see a screen highlighting your **Test Phone Number**, **Phone Number ID**, and a temporary **Access Token**. Copy these values! Paste them inside your project `.env` properties:
                  </p>
                  <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl mt-2.5 font-mono text-xs text-emerald-400">
                    WHATSAPP_PHONE_NUMBER_ID="your_phone_id"<br />
                    WHATSAPP_ACCESS_TOKEN="your_meta_access_token"
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">4</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Configure Meta Webhook Target</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Under the left <strong>WhatsApp</strong> folder menu, click <strong>Configuration</strong>. Locate **Webhook Settings** and select **Edit**:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-xs text-slate-500 space-y-1">
                    <li><strong>Callback URL:</strong> Your Cloud deployment URL or local tunnel address pointing to <code className="bg-slate-100 font-mono px-1.5 py-0.5 rounded text-slate-800">/api/webhook</code></li>
                    <li><strong>Verification Token:</strong> Use the token assigned to your <code className="bg-slate-100 font-mono px-1.5 py-0.5 rounded text-slate-800">WHATSAPP_VERIFY_TOKEN</code> in your environment parameters.</li>
                  </ul>
                  <p className="text-xs text-slate-500 mt-2.5 bg-slate-50 px-3.5 py-2.5 border border-slate-200 rounded-lg leading-relaxed font-medium">
                    💡 Click <strong>Verify and Save</strong>. Meta will perform a GET request validating the signature handshake. Once verified, click <strong>Manage Webhook Subscriptions</strong> and check the box for <strong>messages</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-[#fbfbfa] border border-slate-200 p-4 rounded-xl">
              <Smartphone className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-650 leading-relaxed font-semibold">
                <p className="font-bold text-slate-800">What is Twilio WhatsApp Sandbox?</p>
                <p className="mt-1 font-medium leading-relaxed">
                  Twilio offers a zero-config, highly accessible developer sandbox with pre-registered central Twilio handsets. Ideal for testing backend routers immediately without awaiting developer application approvals from Meta.
                </p>
              </div>
            </div>

            {/* Step-by-Step Twilio Instructions */}
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">1</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Access Twilio Console</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Navigate to the <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline font-bold">Twilio admin center</a>, create of sign-in, and review your dashboard credentials.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">2</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Activate WhatsApp Sandbox</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Go to <strong>Messaging</strong> &gt; <strong>Try It Out</strong> &gt; <strong>Send a WhatsApp Message</strong>. Send the specified activation code (e.g. "join code-word") from your handphone to the Twilio number provided to join.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">3</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono font-mono">Map .env API Variables</h4>
                  <p className="text-sm text-slate-650 mt-1 leading-relaxed">
                    Copy your Twilio <strong>Account SID</strong>, <strong>Auth Token</strong>, and Twilio trial phone number and assign them to your server parameters:
                  </p>
                  <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl mt-2.5 font-mono text-xs text-blue-400">
                    TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXX"<br />
                    TWILIO_AUTH_TOKEN="your_auth_token"<br />
                    TWILIO_PHONE_NUMBER="+14155554321"
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">4</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Connect Webhook Callback</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    On the Twilio Sandbox page, locate <strong>Sandbox Settings</strong>. Inside **"When a message comes in"** choose HTTP POST and point the input address to your server URL:
                  </p>
                  <div className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg mt-2.5 text-xs font-mono text-slate-700 font-semibold shadow-xs">
                    https://your-server-deploy-url.com/api/webhook
                  </div>
                  <p className="text-xs text-slate-500 mt-2.5 bg-slate-55 p-3.5 border border-slate-150 rounded-lg leading-relaxed">
                    🔒 Click <strong>Save</strong>. Twilio will now serialize and transition incoming texts directly to your Express endpoint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
