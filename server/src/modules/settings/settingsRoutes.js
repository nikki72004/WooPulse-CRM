import { Router } from 'express';
import { wooClient } from '../../lib/wooClient.js';
import { emailService } from '../../lib/resendClient.js';
import { SEGMENT_RULES } from '../../config/segmentRules.js';
import { ENV } from '../../config/env.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/status', async (req, res) => {
  const wooStatus = await wooClient.testConnection();

  res.json({
    woocommerce: {
      status: wooStatus.success ? 'CONNECTED' : 'DISCONNECTED',
      storeName: wooStatus.storeName || ENV.CONNECTED_STORE_NAME,
      storeUrl: ENV.WOO_STORE_URL,
      isLiveConfigured: wooClient.isLiveConfigured,
      mode: wooStatus.mode,
      details: wooStatus,
    },
    webhooks: {
      endpoint: '/api/webhooks/woocommerce',
      secretConfigured: Boolean(ENV.WOO_WEBHOOK_SECRET),
      algorithm: 'HMAC-SHA256',
    },
    email: {
      provider: 'Resend',
      isLive: emailService.isLive,
      fromAddress: ENV.EMAIL_FROM,
      replyToAddress: ENV.EMAIL_REPLY_TO,
    },
    segmentRules: SEGMENT_RULES,
  });
});

router.post('/test-email', async (req, res) => {
  const targetEmail = req.body.email || req.user.email;
  try {
    const result = await emailService.sendEmail({
      to: targetEmail,
      subject: 'WooPulse CRM — Test Email Verification',
      text: 'This is a test communication confirming your email provider configuration is operational in WooPulse CRM.',
    });
    res.json({ success: true, message: `Test email sent to ${targetEmail}`, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
