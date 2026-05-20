import React, { useState } from 'react';
import { Cloud, HelpCircle, HardDrive, Cpu, Terminal, CheckCircle } from 'lucide-react';

export default function DeploymentGuide() {
  const [activeTab, setActiveTab] = useState<'render' | 'railway' | 'gcp'>('render');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-slate-800" />
            24/7 Cloud Deployment Guide
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Step-by-step instructions to deploy your Express bot to the web for free or minimal costs.</p>
        </div>

        {/* Cloud Providers Selection */}
        <div className="flex border border-slate-200 rounded-lg p-0.5 bg-white shadow-xs">
          <button
            id="deploy-tab-render"
            onClick={() => setActiveTab('render')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'render' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Render
          </button>
          <button
            id="deploy-tab-railway"
            onClick={() => setActiveTab('railway')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'railway' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Railway
          </button>
          <button
            id="deploy-tab-gcp"
            onClick={() => setActiveTab('gcp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'gcp' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Google Cloud Run
          </button>
        </div>
      </div>

      {/* Guide Content frame */}
      <div className="p-6 md:p-8 space-y-8 max-h-[600px] overflow-y-auto font-sans">
        {activeTab === 'render' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 text-xs text-slate-600 font-semibold shadow-xs">
              <HardDrive className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-850">Why choose Render?</p>
                <p className="mt-1 font-medium leading-relaxed">
                  Render simplifies web deployments directly from GitHub, supports node out-of-the-box, and offers a highly responsive free tier. Excellent for early staging.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">1</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono block">Prepare Code Repository</span>
                  <p className="mt-1 text-slate-600 leading-relaxed font-sans">
                    Commit your codebase securely to an online private or public <strong>GitHub</strong> or **GitLab** repository. Ensure your `package.json` contains a proper standard start command:
                  </p>
                  <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg font-mono text-xs mt-2.5 border border-slate-900 shadow-sm text-left select-all">
                    "scripts": &#123;<br />
                    &nbsp;&nbsp;"start": "node index.js"<br />
                    &#125;
                  </pre>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">2</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono block">Create New Web Service</span>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Login to the <a href="https://dashboard.render.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-bold">Render Dashboard</a>. Click <strong>New +</strong> and select <strong>Web Service</strong>. Connect your GitHub repository.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">3</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono block">Configure Deployment Parameters</span>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Set up your runtime configurations accurately to prevent container startup boot failures:
                  </p>
                  <table className="w-full mt-3.5 border border-slate-200 text-xs rounded-xl overflow-hidden leading-relaxed shadow-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-705 font-bold text-left border-b border-slate-200 font-mono">
                        <th className="p-3">Configuration Option</th>
                        <th className="p-3">Value Setup</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650 bg-white">
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Runtime</td>
                        <td className="p-3">Node</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Build Command</td>
                        <td className="p-3"><code className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-800 font-semibold">npm install</code></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Start Command</td>
                        <td className="p-3"><code className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-800 font-semibold">npm start</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">4</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono block">Assign Environment Variables</span>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Click <strong>Environment</strong> tab. Add your credentials (such as <code className="bg-slate-100 font-mono px-1">GEMINI_API_KEY</code>, <code className="bg-slate-100 font-mono px-1">WHATSAPP_VERIFY_TOKEN</code>). Click <strong>Deploy</strong>. Correctly retrieve your live HTTPS URL from Render and map it inside Meta Webhook settings!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'railway' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 text-xs text-slate-600 font-semibold shadow-xs">
              <Cpu className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-850">Why choose Railway?</p>
                <p className="mt-1 font-medium leading-relaxed">
                  Railway supports ultra-fast builds, does not place applications to sleep during idle states, and handles automatic scale parameters seamlessly.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">1</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono block">Login with GitHub</span>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Access <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-bold">Railway.app</a>. Authorize using GitHub and set up a new project workspace.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">2</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono block">Deploy Representative Project</span>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Choose <strong>Deploy From GitHub Repository</strong> and select your bot project. Railway automatically reads your files and activates Node containers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">3</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono block">Configure Environmental Variables</span>
                  <p className="mt-1 text-slate-600 leading-relaxed font-sans">
                    Inside variables dashboard, add your API keys. Make sure your Express config specifies the port dynamically parameter:
                  </p>
                  <pre className="bg-slate-950 text-indigo-405 p-3.5 text-xs font-mono rounded-xl mt-2.5 border border-slate-900 text-left select-all">
                    const PORT = process.env.PORT || 3000;
                  </pre>
                  <p className="text-xs text-slate-450 mt-1.5 font-sans leading-relaxed">
                    Railway uses dynamic environments, automatically setting the port variable on runtime start.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gcp' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 text-xs text-slate-600 font-semibold shadow-xs">
              <Terminal className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-850">Why Google Cloud Run?</p>
                <p className="mt-1 font-medium leading-relaxed">
                  Cloud Run offers hyper-scaling serverless containers. Free tier includes 2 million requests/monthly, has incredible speed metrics, and integrates natively with other cloud platforms.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">1</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono block">Add Dockerfile Configuration</span>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Create a file named <code className="bg-slate-100 font-mono px-1.5">Dockerfile</code> in your root directory to guide Cloud Run's container packager:
                  </p>
                  <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl mt-2.5 font-mono text-xs border border-slate-900 text-left select-all">
                    FROM node:20-slim<br />
                    WORKDIR /app<br />
                    COPY package*.json ./<br />
                    RUN npm install --omit=dev<br />
                    COPY . .<br />
                    EXPOSE 3000<br />
                    CMD ["npm", "start"]
                  </pre>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">2</div>
                  <div className="w-[1px] h-full bg-slate-200 mt-1" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-mono block">Trigger GCP Deploy Shell Command</span>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Make sure you have Google Cloud SDK installed. Authorize GCP CLI and deploy using this single terminal command:
                  </p>
                  <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-lg mt-2.5 text-xs font-mono text-slate-350 select-all text-left">
                    gcloud run deploy whatsapp-chatbot --source . --port 3000 --allow-unauthenticated
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
