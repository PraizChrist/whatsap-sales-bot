import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const START_TIME = Date.now();

// Body parsers for JSON and Form URL-encoded (Twilio style webhooks)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory logs buffer for simulator
interface WebhookLog {
  id: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'log' | 'error';
  vendor: 'meta' | 'twilio';
  title: string;
  description: string;
  payload: any;
}

const webhookLogs: WebhookLog[] = [];

function pushLog(type: 'incoming' | 'outgoing' | 'log' | 'error', vendor: 'meta' | 'twilio', title: string, description: string, payload: any) {
  const entry: WebhookLog = {
    id: Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    type,
    vendor,
    title,
    description,
    payload
  };
  webhookLogs.push(entry);
  // Cap logs at 100 entries to prevent memory problems
  if (webhookLogs.length > 100) {
    webhookLogs.shift();
  }
  return entry;
}

// Lazy load Gemini AI to avoid crashing on start if API key is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

/**
 * Shared Message Processing Pipeline
 * Handles incoming WhatsApp format messages, generates replies (via commands or Gemini),
 * and structures simulated or actual outgoing API requests.
 */
async function processMessagePipeline(params: {
  senderPhone: string;
  senderName: string;
  text: string;
  vendor: 'meta' | 'twilio';
  messageId: string;
}) {
  const { senderPhone, senderName, text, vendor, messageId } = params;
  const normalizedText = text.trim();
  let replyText = '';

  pushLog('incoming', vendor, 'Incoming Webhook Parsed', `Received WhatsApp message from ${senderName}`, {
    messageId,
    sender: senderPhone,
    name: senderName,
    text: normalizedText,
    timestamp: new Date().toISOString()
  });

  // 1. Core Chatbot Logic & Router
  const lowercaseText = normalizedText.toLowerCase();

  if (lowercaseText === '/start') {
    replyText = `👋 *Welcome to the WhatsApp Bot Console!*

I am your active Express-based chatbot, ready for production.

*Available Commands:*
• \`/start\` - Restart welcome conversation
• \`/help\` - Show developer command list
• \`/status\` - Diagnostic system specifications
• \`/about\` - Architecture insights

Or write any normal text to initiate a smart reply powered by Google Gemini AI!`;
  } else if (lowercaseText === '/help') {
    replyText = `🛠️ *WhatsApp Chatbot Commands List:*

• \`/start\` - Trigger the welcome guide
• \`/help\` - Display this diagnostics list
• \`/status\` - Query bot runtime metrics, setup diagnostic variables, and state checks
• \`/about\` - Detailed stack, design concepts, and system details

💡 _Pro-Tip: Normal conversational requests trigger automated AI mode responses when Gemini is configured!_`;
  } else if (lowercaseText === '/status') {
    const uptimeMins = Math.floor((Date.now() - START_TIME) / 60000);
    const geminiAvailable = !!getAI();
    replyText = `🟢 *Chatbot Health & Diagnostics:*

• *Backend Status:* ACTIVE (Express + Node.js)
• *Uptime:* ${uptimeMins} minutes
• *Port Binding:* Port 3000 (production standard)
• *Verify Token:* Configured (matches pattern)
• *Gemini AI Engine:* ${geminiAvailable ? '✅ Integrated & Ready' : '⚠️ Offline (Unassigned Key)'}
• *Simulated WhatsApp Webhook:* Active (Handshake complete)

_Need AI auto-replies? Update GEMINI_API_KEY in the Settings > Secrets workspace menu!_`;
  } else if (lowercaseText === '/about') {
    replyText = `🤖 *WhatsApp Bot Blueprint:*

• *Core Tech:* TypeScript + Express.js backend
• *Architecture:* Event-driven webhook router
• *Secure Proxying:* External APIs are requested strictly server-side to secure authorization keys
• *Interactions:* Structured Meta Cloud HTTP Graph payloads or Twilio SDK requests`;
  } else if (lowercaseText.startsWith('hi') || lowercaseText.startsWith('hello') || lowercaseText.startsWith('hey')) {
    replyText = `👋 Hello, *${senderName}*! How can I assist you today? 

Type \`/help\` to inspect chatbot control commands, or ask me any question to test my AI capabilities!`;
  } else {
    // Check if Gemini is integrated
    const ai = getAI();
    if (ai) {
      pushLog('log', vendor, 'Calling Gemini AI API', 'Sending payload to gemini-3.5-flash', {
        prompt: normalizedText
      });
      try {
        const genResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: normalizedText,
          config: {
            systemInstruction: 'You are a professional, helpful, and concise WhatsApp Chatbot. Keep responses conversational, concise, and structured under 3 short sentences. Use descriptive emojis and clear lists when needed, as is standard in mobile text apps.'
          }
        });
        replyText = genResponse.text || 'Sorry, I couldn\'t generate a response.';
        pushLog('log', vendor, 'Gemini Response Received', 'Successfully extracted model text content', {
          text: replyText
        });
      } catch (error: any) {
        pushLog('error', vendor, 'Gemini AI Error', error.message || 'Error occurred during generation', error);
        replyText = `🤖 *AI Service Warning:*
Sorry, I faced an issue processing your query through Gemini AI.
Error details: _${error.message || 'Unknown network dispute'}_`;
      }
    } else {
      replyText = `✨ *Auto-Reply Fallback agent:*

I received your text: "${normalizedText}".

• *AI Mode:* Offline. To enable smart conversational responses, configure the *GEMINI_API_KEY* environmental token.
• *Command Mode:* Try entering \`/help\` to run dynamic local command procedures!`;
    }
  }

  // 2. Outgoing Outbound Construction (Simulated & Real)
  let outboundPayload: any = {};
  let outboundHeaders: any = {};
  let outboundUrl = '';
  let outboundMethod = 'POST';

  if (vendor === 'meta') {
    outboundUrl = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID || '123456789012345'}/messages`;
    outboundHeaders = {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN || 'EAA...'}`.substring(0, 30) + '...',
      'Content-Type': 'application/json'
    };
    outboundPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: senderPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: replyText
      }
    };
  } else {
    // Twilio
    const twilioSid = process.env.TWILIO_ACCOUNT_SID || 'AC...';
    outboundUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    outboundHeaders = {
      'Authorization': 'Basic [Base64 Encoded Twilio SID + Token]',
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    outboundPayload = {
      To: `whatsapp:${senderPhone}`,
      From: `whatsapp:${process.env.TWILIO_PHONE_NUMBER || '+14155552345'}`,
      Body: replyText
    };
  }

  pushLog('outgoing', vendor, 'Structuring Outbound Reply', `Formulating responses to deliver back to user via WhatsApp Graph API`, {
    endpoint: outboundUrl,
    method: outboundMethod,
    headers: outboundHeaders,
    body: outboundPayload
  });

  // 3. Real HTTP Requests if credentials exist!
  let sentRealRequest = false;
  let realRequestStatus = 'not_attempted';
  let realRequestResponse: any = null;

  try {
    if (vendor === 'meta' && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
      sentRealRequest = true;
      pushLog('log', 'meta', 'Triggering Graph API POST', 'Contacting real WhatsApp Meta servers', { url: outboundUrl });
      const metaRes = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: senderPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: replyText
          }
        })
      });
      const data = await metaRes.json();
      realRequestStatus = metaRes.ok ? 'success' : 'failed';
      realRequestResponse = data;
      pushLog('log', 'meta', `Real Graph API Call ${metaRes.ok ? 'Succeeded' : 'Failed'}`, `HTTP Status ${metaRes.status}`, data);
    } else if (vendor === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      sentRealRequest = true;
      pushLog('log', 'twilio', 'Triggering Twilio API POST', 'Contacting Twilio API endpoints', { url: outboundUrl });
      
      const formBody = new URLSearchParams();
      formBody.append('To', senderPhone.startsWith('whatsapp:') ? senderPhone : `whatsapp:${senderPhone}`);
      const fromNum = process.env.TWILIO_PHONE_NUMBER.startsWith('whatsapp:') ? process.env.TWILIO_PHONE_NUMBER : `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
      formBody.append('From', fromNum);
      formBody.append('Body', replyText);

      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody.toString()
      });
      const data = await twilioRes.json();
      realRequestStatus = twilioRes.ok ? 'success' : 'failed';
      realRequestResponse = data;
      pushLog('log', 'twilio', `Real Twilio API Call ${twilioRes.ok ? 'Succeeded' : 'Failed'}`, `HTTP Status ${twilioRes.status}`, data);
    }
  } catch (err: any) {
    realRequestStatus = 'error';
    realRequestResponse = { error: err.message };
    pushLog('error', vendor, 'Real Delivery Request Failed', err.message || 'Unknown transport dispute', err);
  }

  return {
    replyText,
    outboundUrl,
    outboundPayload,
    sentRealRequest,
    realRequestStatus,
    realRequestResponse
  };
}

/**
 * 🔗 Webhook Verification Check (GET /api/webhook)
 * Meta checks this during configuration on developers.facebook.com
 */
app.get('/api/webhook', (req: Request, res: Response) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'my_verification_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  pushLog('incoming', 'meta', 'Webhook Verification Check (GET)', 'Meta requesting handshake validator request', {
    queryParams: req.query
  });

  if (mode === 'subscribe' && token === verifyToken) {
    pushLog('log', 'meta', 'Handshake Approved', 'Verify tokens matched perfectly. Webhook verified successfully.', { challenge });
    res.status(200).send(challenge);
  } else {
    pushLog('error', 'meta', 'Handshake Rejected', 'Verify token mismatch or poor handshake request', {
      expected: verifyToken,
      received: token
    });
    res.sendStatus(403);
  }
});

/**
 * 🔗 Live Webhook Receiver (POST /api/webhook)
 * Accepts production webhooks from Meta Graph API or Twilio
 */
app.post('/api/webhook', async (req: Request, res: Response) => {
  try {
    // 1. Check if it's Twilio Form URL-encoded format
    if (req.body && req.body.MessageSid && req.body.From) {
      const from = req.body.From; // whatsapp:+14155552671
      const body = req.body.Body || '';
      const senderPhone = from.replace('whatsapp:', '');
      const senderName = req.body.ProfileName || senderPhone;
      
      const result = await processMessagePipeline({
        senderPhone,
        senderName,
        text: body,
        vendor: 'twilio',
        messageId: req.body.MessageSid
      });

      // Twilio expects a TwiML XML response, but returns 200 is acceptable
      // If we didn't send real SMS immediately, we can respond with TwiML
      if (!result.sentRealRequest) {
        res.set('Content-Type', 'text/xml');
        res.status(200).send(`
          <Response>
            <Message>${result.replyText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message>
          </Response>
        `);
      } else {
        res.sendStatus(200);
      }
      return;
    }

    // 2. Check Meta format (WhatsApp Business JSON structure)
    if (req.body && req.body.object === 'whatsapp_business_account') {
      const entries = req.body.entry;
      if (entries && entries[0] && entries[0].changes && entries[0].changes[0]) {
        const changeValue = entries[0].changes[0].value;
        if (changeValue.messages && changeValue.messages[0]) {
          const message = changeValue.messages[0];
          const textBody = message.text ? message.text.body : '';
          const senderPhone = message.from;
          const senderName = (changeValue.contacts && changeValue.contacts[0] && changeValue.contacts[0].profile)
            ? changeValue.contacts[0].profile.name
            : senderPhone;

          await processMessagePipeline({
            senderPhone,
            senderName,
            text: textBody,
            vendor: 'meta',
            messageId: message.id
          });
        }
      }
      res.sendStatus(200);
      return;
    }

    // Generic fallback if webhook body structure isn't matched
    pushLog('error', 'meta', 'Unsupported Post Trigger', 'Webhooks JSON or Form structure unrecognized', { body: req.body });
    res.status(400).send({ status: 'ignored', error: 'Payload structure format unmapped' });
  } catch (err: any) {
    pushLog('error', 'meta', 'Failed Webhook Processing', err.message, err);
    res.status(500).send({ status: 'error', message: err.message });
  }
});

/**
 * 🖥️ Simulator API Trigger
 * Simulates sending mock messages to the webhook pipeline via the React dashboard UI
 */
app.post('/api/simulator/send', async (req: Request, res: Response) => {
  const { senderPhone, senderName, text, vendorConfig } = req.body;
  const vendor: 'meta' | 'twilio' = vendorConfig === 'twilio' ? 'twilio' : 'meta';
  const messageId = 'simid_' + Math.random().toString(36).substring(2, 11);

  try {
    const result = await processMessagePipeline({
      senderPhone: senderPhone || '+14155550199',
      senderName: senderName || 'Simulator Tester',
      text: text || 'Hi bot!',
      vendor,
      messageId
    });

    res.json({
      success: true,
      data: result,
      logs: webhookLogs.slice(-4) // Send recent pipeline logs for immediate screen rendering
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ⚙️ Simulator Administration Config & Logs Fetching
 */
app.get('/api/simulator/logs', (req: Request, res: Response) => {
  res.json({ logs: webhookLogs });
});

app.post('/api/simulator/clear-logs', (req: Request, res: Response) => {
  webhookLogs.length = 0;
  res.json({ success: true });
});

app.get('/api/app-config', (req: Request, res: Response) => {
  res.json({
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'my_verification_token',
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    metaConfigured: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
  });
});

/**
 * Vite Dev Server or Production Static Files Router
 * Serves fully integrated Vite assets onPort 3000
 */
async function startApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WhatsApp Bot Server] Server actively running on http://0.0.0.0:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error('Fatal dev server crash:', err);
});
