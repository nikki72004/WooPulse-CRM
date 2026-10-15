import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'woopulse_crm_default_super_secret_jwt_key_2026',
  
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@woopulse.local').toLowerCase().trim(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',

  // WooCommerce Store Integration
  WOO_STORE_URL: process.env.WOO_STORE_URL || 'https://demo-fashion-boutique.test',
  WOO_CONSUMER_KEY: process.env.WOO_CONSUMER_KEY || 'ck_demo_982347293847293847293847',
  WOO_CONSUMER_SECRET: process.env.WOO_CONSUMER_SECRET || 'cs_demo_192837192837192837192837',
  WOO_WEBHOOK_SECRET: process.env.WOO_WEBHOOK_SECRET || 'whsec_woopulse_demo_signature_secret_key_99',
  CONNECTED_STORE_NAME: process.env.CONNECTED_STORE_NAME || 'Demo Boutique (WooCommerce v3 REST)',

  // Email Config
  RESEND_API_KEY: process.env.RESEND_API_KEY || 're_demo_mock_key',
  EMAIL_FROM: process.env.EMAIL_FROM || 'concierge@woopulse.local',
  EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@woopulse.local',
};
