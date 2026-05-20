import { CodeTemplate, SimulatorProfile } from './types';

export const SIMULATOR_PROFILES: SimulatorProfile[] = [
  {
    id: 'jane',
    name: 'Jane Cooper',
    phone: '+14155552671',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    verified: true
  },
  {
    id: 'alex',
    name: 'Alex Rivera',
    phone: '+447911123456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    verified: true
  },
  {
    id: 'business_tester',
    name: 'Liam Neeson',
    phone: '+15551234567',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    verified: false
  }
];

export function getCodeTemplates(options: { provider: 'meta' | 'twilio'; useAI: boolean; verifyToken: string }): CodeTemplate[] {
  const { provider, useAI, verifyToken } = options;

  const serverCode = `/**
 * 🤖 PRODUCTION-READY WHATSAPP BOT
 * Framework: Node.js + Express
 * Provider: ${provider === 'meta' ? 'Meta WhatsApp Cloud API' : 'Twilio WhatsApp API'}
 * AI Engine: ${useAI ? 'Google Gemini AI Enabled' : 'Disabled (Basic Auto-Reply Mode)'}
 */

import express from 'express';
${useAI ? "import { GoogleGenAI } from '@google/genai';\n" : ""}import dotenv from 'dotenv';

// Load environment configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Essential Webhook Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

${useAI ? `// Initialize Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});\n` : ''}
/**
 * 1. Webhook Handshake Verification (GET)
 * Meta checks this GET endpoint upon registering your webhook.
 */
app.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '${verifyToken}';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('🟢 Webhook successfully handshake-verified with Meta!');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Handshake verify token did not match expected value.');
    res.sendStatus(403);
  }
});

/**
 * 2. Incoming Event Listener (POST)
 * Receives incoming messages from WhatsApp users.
 */
app.post('/webhook', async (req, res) => {
  try {
    let incomingMessage = '';
    let senderPhone = '';
    let senderName = '';
    let messageId = '';

    ${provider === 'meta' ? `// ----- Handle Meta Cloud API JSON Webhook Layout -----
    if (req.body.object === 'whatsapp_business_account') {
      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (message && message.type === 'text') {
        incomingMessage = message.text.body;
        senderPhone = message.from;
        senderName = change.contacts?.[0]?.profile?.name || senderPhone;
        messageId = message.id;
      }
    }` : `// ----- Handle Twilio Form-URL-Encoded Webhook Layout -----
    if (req.body.MessageSid && req.body.From) {
      incomingMessage = req.body.Body || '';
      senderPhone = req.body.From.replace('whatsapp:', '');
      senderName = req.body.ProfileName || senderPhone;
      messageId = req.body.MessageSid;
    }`}

    if (!incomingMessage) {
      // Return 200 quickly to acknowledge receipt of statuses or media
      return res.sendStatus(200);
    }

    console.log(\`📬 Msg Recv: [from: \${senderPhone}] => "\${incomingMessage}"\`);

    // 3. Command Router & Reply Generation
    let replyText = '';
    const textLower = incomingMessage.trim().toLowerCase();

    if (textLower === '/start') {
      replyText = \`👋 Hello \${senderName}! Welcome to our autonomous WhatsApp Assistant.\n\nType */help* to review commands!\`;
    } else if (textLower === '/help') {
      replyText = \`🛠️ *Available WhatsApp Commands:*\\n\\n• */start* - Trigger welcome note\\n• */help* - Display this usage list\\n• */status* - Check chatbot health indicators\`;
    } else if (textLower === '/status') {
      replyText = \`🟢 *Chatbot Diagnostics Status:*\\n\\n• *Core Server:* Online\\n• *Engine:* Express.js\\n• *AI Mode:* \${process.env.GEMINI_API_KEY ? 'Active (Gemini)' : 'Offline (Local Demo)'}\`;
    } else {
      // Smart Conversational Processor
      ${useAI ? `try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: incomingMessage,
          config: {
            systemInstruction: 'You are a professional WhatsApp Chatbot assistant. Keep your responses highly relevant, empathetic, structured, and short (3 sentences maximum). Support emojis and clean formatting.'
          }
        });
        replyText = response.text || "Sorry, I am facing trouble forming thoughts.";
      } catch (err: any) {
        console.error('Gemini connection error:', err);
        replyText = "⚠️ Our AI service is temporarily offline. Please try again soon!";
      }` : `replyText = \`👋 Echo Bot: I received "\${incomingMessage}". Configure GEMINI_API_KEY to switch this chatbot into a smart AI agent!\`;`}
    }

    // 4. Outbound Delivery POST trigger
    await sendWhatsAppReply(senderPhone, replyText);

    // Express expects a 200 HTTP code so Meta/Twilio knows we processed successfully
    res.sendStatus(200);
  } catch (err: any) {
    console.error('❌ General Webhook Failure:', err);
    res.status(500).send({ error: err.message });
  }
});

/**
 * 3. Outbound WhatsApp Message Dispatcher
 */
async function sendWhatsAppReply(toPhone: string, text: string) {
  ${provider === 'meta' ? `const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn('⚠️ Missing Meta API credentials. Running in local simulation log only.');
    return;
  }

  const response = await fetch(\`https://graph.facebook.com/v18.0/\${phoneNumberId}/messages\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone,
      type: 'text',
      text: { body: text }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(\`Meta API failed [\${response.status}]: \${JSON.stringify(errData)}\`);
  }` : `const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNum = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNum) {
    console.warn('⚠️ Missing Twilio credentials. Skipping real outbound network dispatch.');
    return;
  }

  const endpoint = \`https://api.twilio.com/2010-04-01/Accounts/\${accountSid}/Messages.json\`;
  const formBody = new URLSearchParams();
  formBody.append('To', toPhone.startsWith('whatsapp:') ? toPhone : \`whatsapp:\${toPhone}\`);
  formBody.append('From', fromNum.startsWith('whatsapp:') ? fromNum : \`whatsapp:\${fromNum}\`);
  formBody.append('Body', text);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(\`\${accountSid}:\${authToken}\`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formBody.toString()
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(\`Twilio API failed [\${response.status}]: \${JSON.stringify(errData)}\`);
  }`}
  
  console.log(\`✅ Message delivered back to User: \${toPhone}\`);
}

// Bind to Port and begin listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 WhatsApp webhook bot running smoothly in production on port \${PORT}!\`);
});
`;

  const packageJson = `{
  "name": "whatsapp-chatbot",
  "version": "1.0.0",
  "description": "Production chatbot for WhatsApp using Node.js & Express",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "dotenv": "^17.2.3"${useAI ? `,\n    "@google/genai": "^1.29.0"` : ''}
  },
  "devDependencies": {
    "nodemon": "^3.0.3"
  }
}`;

  const envFile = `# 🟢 WEBHOOK CONFIGURATION HANDSHAKE CHECK
WHATSAPP_VERIFY_TOKEN="${verifyToken}"
PORT=3000

${useAI ? `# 🤖 GEMINI ARTIFICIAL INTELLIGENCE KEYS
GEMINI_API_KEY="AI_STUDIO_INJECTED_OR_GOOGLE_AI_KEY"
` : ''}
${provider === 'meta' ? `# 🏢 META CLOUD API (RETRIEVED FROM FACEBOOK DEVELOPER CONSOLE)
WHATSAPP_PHONE_NUMBER_ID="your_phone_id_from_meta"
WHATSAPP_ACCESS_TOKEN="your_permanent_system_access_token"` : `# ☎️ TWILIO API SETUP CONSTANTS
TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXX"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+14155554321"`}
`;

  return [
    {
      name: 'Server Endpoint Code',
      filename: 'index.js',
      language: 'javascript',
      content: serverCode
    },
    {
      name: 'Package Manifest',
      filename: 'package.json',
      language: 'json',
      content: packageJson
    },
    {
      name: 'Environment Configuration',
      filename: '.env',
      language: 'properties',
      content: envFile
    }
  ];
}
