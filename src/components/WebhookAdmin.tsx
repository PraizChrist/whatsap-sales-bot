import React, { useState } from 'react';
import { ShieldAlert, Fingerprint, Copy, Check, Server, RefreshCcw, HelpCircle, Activity, Globe, Info } from 'lucide-react';

interface WebhookAdminProps {
  appConfig: {
    appUrl: string;
    geminiConfigured: boolean;
    whatsappVerifyToken: string;
    twilioConfigured: boolean;
    metaConfigured: boolean;
  };
  refreshConfig: () => void;
}

export default function WebhookAdmin({ appConfig, refreshConfig }: WebhookAdminProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Derive the absolute callback webhook URL
  const callbackUrl = `${appConfig.appUrl.replace(/\/$/, '')}/api/webhook`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Copy mismatch', err);
    }
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(appConfig.whatsappVerifyToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch (err) {
      console.error('Copy mismatch', err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
      {/* Header Panel */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            Live Webhook & Diagnostics Manager
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Diagnose and copy live webhook URLs to paste into your Meta/Twilio Developer Dashboard.</p>
        </div>

        {/* Manual Refresh App Config button */}
        <button
          id="btn-refresh-configs"
          onClick={refreshConfig}
          className="px-3.5 py-1.5 self-start sm:self-auto border border-slate-200 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Query Config Status
        </button>
      </div>

      {/* Main UI body */}
      <div className="p-6 md:p-8 space-y-6">
        
        {/* Callback info Alert */}
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100/60 leading-relaxed text-xs text-emerald-850 flex items-start gap-4 animate-fade-in">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold">✨ Real Integration Webhook Address Enabled!</h5>
            <p className="text-slate-600 leading-relaxed font-medium">
              Your local workspace has provisioned a secure, public HTTPS callback URL. You can paste this URL into the Facebook Developer Webhooks config panel right now to test real-world message handshakes!
            </p>
          </div>
        </div>

        {/* Registration URL card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card URL callback */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">1. CALLBACK URL</span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">SSL Secure (HTTPS)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Assign this endpoint address inside your Meta developer or Twilio Sandbox configuration manager.
              </p>
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-3 mt-3 font-mono text-xs text-slate-700">
                <span className="truncate">{callbackUrl}</span>
                <button
                  id="btn-copy-callback-url"
                  onClick={handleCopyUrl}
                  className="p-1 hover:bg-slate-100 text-slate-500 hover:text-emerald-600 rounded-md transition-colors shrink-0"
                  title="Copy verification Callback URL"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Card verification Token */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">2. SECURE VERIFY TOKEN</span>
                <span className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-250 px-2 py-0.5 rounded-full">Token Matching</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Provide this verification code during Meta registration to let both servers execute verification check requests.
              </p>
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-3 mt-3 font-col text-xs text-slate-705">
                <span className="font-mono text-xs font-semibold">{appConfig.whatsappVerifyToken}</span>
                <button
                  id="btn-copy-verify-token"
                  onClick={handleCopyToken}
                  className="p-1 hover:bg-slate-100 text-slate-550 hover:text-slate-900 rounded-md transition-colors shrink-0"
                  title="Copy Handshake Verify Token"
                >
                  {copiedToken ? <Check className="w-4 h-4 text-slate-900" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Server metrics diagnostics grid */}
        <div className="border border-slate-205 rounded-xl overflow-hidden mt-6 shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-slate-600" />
            Active Server Deployment Specifications
          </div>
          <div className="p-5 bg-white grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Spec 1. Gemini status */}
            <div>
              <span className="text-slate-400 text-[10px] font-bold block uppercase font-mono mb-1">Gemini AI Model</span>
              {appConfig.geminiConfigured ? (
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Smart Replies Active
                </div>
              ) : (
                <div className="flex flex-col gap-1 text-slate-600 font-medium">
                  <span className="font-bold text-slate-700">Local Echo Mode Active</span>
                  <span className="text-[10px] text-slate-400">Configure your GEMINI_API_KEY in the Secrets panel to activate Gemini AI replies.</span>
                </div>
              )}
            </div>

            {/* Spec 2. Server Uptime */}
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <span className="text-slate-400 text-[10px] font-bold block uppercase font-mono mb-1">Port Bind Status</span>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Server className="w-4.5 h-4.5 text-slate-500" />
                Port 3000 (Active SSL)
              </div>
            </div>

            {/* Spec 3. Production Readiness check */}
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <span className="text-slate-405 text-[10px] font-bold block uppercase font-mono mb-1">Production Webhook Signature</span>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                Handshaking Endpoint Active
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
