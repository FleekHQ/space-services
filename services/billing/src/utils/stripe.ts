import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default (): Stripe =>
  new Stripe(stripeSecret, {
    apiVersion: '2020-08-27',
  });
