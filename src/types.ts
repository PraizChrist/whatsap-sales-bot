/**
 * Types and Interfaces for WhatsApp Bot Builder
 */

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'pending';
}

export interface WebhookLogEntry {
  id: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'log' | 'error';
  vendor: 'meta' | 'twilio';
  title: string;
  description: string;
  payload: any; // Raw JSON payload
}

export interface SimulatorProfile {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  verified: boolean;
}

export type BotProvider = 'meta' | 'twilio';

export interface CodeTemplate {
  name: string;
  filename: string;
  language: string;
  content: string;
}
