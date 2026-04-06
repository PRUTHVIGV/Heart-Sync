const express = require("express");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Lazy-load stripe only if key is set
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "<your_stripe_secret_key>") {
    return null;
  }
  return require("stripe")(process.env.STRIPE_SECRET_KEY);
};

// POST /api/payments/create-checkout
router.post("/create-checkout", authenticate, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ message: "Payments not configured yet" });

  try {
    const { priceId } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: req.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
      metadata: { userId: req.user._id.toString() },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments/portal - manage subscription
router.get("/portal", authenticate, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ message: "Payments not configured yet" });

  try {
    if (!req.user.stripeCustomerId) {
      return res.status(400).json({ message: "No active subscription" });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/settings`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments/status
router.get("/status", authenticate, (req, res) => {
  res.json({
    isPremium: req.user.isPremium || false,
    premiumSince: req.user.premiumSince || null,
    stripeConfigured: !!getStripe(),
  });
});

// POST /api/payments/webhook
const handleWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.json({ received: true });

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        isPremium: true,
        premiumSince: new Date(),
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    await User.findOneAndUpdate({ stripeSubscriptionId: sub.id }, { isPremium: false });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    await User.findOneAndUpdate({ stripeCustomerId: invoice.customer }, { isPremium: false });
  }

  res.json({ received: true });
};

module.exports = { router, handleWebhook };
