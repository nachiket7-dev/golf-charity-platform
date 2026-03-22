import express from 'express';
import {
  createCheckout,
  mockCompletePayment,
  cancelSubscription,
  getSubscriptionStatus,
  createPortalSession,
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.post('/create-checkout', createCheckout);
router.post('/mock-complete', mockCompletePayment);
router.post('/cancel', cancelSubscription);
router.get('/status', getSubscriptionStatus);
router.post('/portal', createPortalSession);

export default router;
