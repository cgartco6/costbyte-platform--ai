const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const crypto = require('crypto');
const { openDb } = require('../db/database');
const authenticate = require('../middleware/auth');
const router = express.Router();

// PayPal setup
let paypalClient = null;
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
    paypalClient = new paypal.core.PayPalHttpClient(environment);
}

// Stripe Payment Intent
router.post('/create-stripe-payment', authenticate, async (req, res) => {
    const { amount, projectId } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), currency: 'zar',
            metadata: { projectId, userId: req.userId }
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PayPal Order
router.post('/create-paypal-order', authenticate, async (req, res) => {
    const { amount, projectId } = req.body;
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({ intent: 'CAPTURE', purchase_units: [{ amount: { currency_code: 'ZAR', value: amount.toString() }, reference_id: projectId }] });
    const order = await paypalClient.execute(request);
    res.json({ orderId: order.result.id });
});

router.get('/execute-paypal', async (req, res) => {
    const { orderId, projectId } = req.query;
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    await paypalClient.execute(request);
    const db = await openDb();
    await db.run('UPDATE projects SET payment_status = "paid" WHERE id = ?', projectId);
    res.redirect('/payment-success.html');
});

// PayFast (redirect)
router.post('/create-payfast', authenticate, async (req, res) => {
    const { amount, projectId, description } = req.body;
    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const passPhrase = process.env.PAYFAST_PASSPHRASE;
    const data = {
        merchant_id: merchantId, merchant_key: process.env.PAYFAST_MERCHANT_KEY,
        return_url: `${process.env.BASE_URL}/payment-success.html`, cancel_url: `${process.env.BASE_URL}/payment-cancel.html`,
        notify_url: `${process.env.BASE_URL}/api/payment/payfast-itn`,
        amount: amount.toFixed(2), item_name: description, m_payment_id: projectId
    };
    const signature = crypto.createHash('md5').update(querystring.stringify(data) + passPhrase).digest('hex');
    data.signature = signature;
    const form = `<form action="https://sandbox.payfast.co.za/eng/process" method="post" id="payfast_form">${Object.entries(data).map(([k,v]) => `<input type="hidden" name="${k}" value="${v}">`).join('')}</form><script>document.getElementById("payfast_form").submit();</script>`;
    res.json({ payfastForm: form });
});

router.post('/payfast-itn', async (req, res) => {
    const { m_payment_id, payment_status } = req.body;
    if (payment_status === 'COMPLETE') {
        const db = await openDb();
        await db.run('UPDATE projects SET payment_status = "paid" WHERE id = ?', m_payment_id);
    }
    res.send('OK');
});

// Direct EFT (just record)
router.post('/eft-notify', authenticate, async (req, res) => {
    const { projectId } = req.body;
    const db = await openDb();
    await db.run('UPDATE projects SET payment_status = "pending_eft" WHERE id = ?', projectId);
    res.json({ success: true });
});

module.exports = router;
