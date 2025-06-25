import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// TODO: Import your Supabase admin client when ready for database operations
// import { createClient } from '@supabase/supabase-js';

// const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Initialize Stripe with the secret key. Ensure STRIPE_SECRET_KEY is set in your environment variables.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_yourkey_webhook');

// Ensure STRIPE_WEBHOOK_SECRET is set in your environment variables.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_yourwebhooksecret';

// Placeholder for a helper function to map Stripe Price IDs to your application's plan names (e.g., 'basic', 'premium').
// You will need to implement this based on your actual Stripe Price IDs.
// Example:
// function determinePlanLevel(priceId: string): string {
//   if (priceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID) return 'basic';
//   if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) return 'premium';
//   console.warn(`Unknown priceId: ${priceId}`);
//   return 'unknown_plan'; // Or throw an error
// }

export async function POST(req: Request) {
  let event: Stripe.Event;
  let rawBody: string;

  try {
    rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Webhook Error: Missing stripe-signature header.');
      return new NextResponse(JSON.stringify({ error: 'Missing stripe-signature header.' }), { status: 400 });
    }
    if (!webhookSecret) {
      console.error('Webhook Error: STRIPE_WEBHOOK_SECRET is not set.');
      return new NextResponse(JSON.stringify({ error: 'Webhook secret not configured.' }), { status: 500 });
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
  }

  console.log(`Stripe Webhook Received: ${event.type}`);

  // Common data extraction (ensure metadata is set in Checkout Session and Subscription objects)
  const objectWithMetadata = event.data.object as any; // Cast to any to access metadata if present
  const restaurantId = objectWithMetadata.metadata?.restaurant_id;

  if (!restaurantId && event.type !== 'ping' && event.type !== 'payment_intent.succeeded' && event.type !== 'charge.succeeded' && !event.type.startsWith('invoice.')) { // Some events might not have metadata or restaurantId directly
     console.warn(`Warning: restaurant_id not found in metadata for event type ${event.type}. Object:`, objectWithMetadata);
     // Depending on the event, this might be an error or expected.
     // For subscription lifecycle events, restaurant_id in metadata is crucial.
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const currentRestaurantId = session.metadata?.restaurant_id; // Prefer specific metadata access

      console.log(`Checkout session completed for customer: ${session.customer}, restaurant_id: ${currentRestaurantId}`);
      if (currentRestaurantId && session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const planId = subscription.items.data[0]?.price.id;
          // const planLevel = determinePlanLevel(planId); // TODO: Implement determinePlanLevel
          const planLevel = `plan_for_${planId}`; // Placeholder
          const customerId = session.customer as string;
          const subscriptionEndsAt = new Date(subscription.current_period_end * 1000);

          console.log(`TODO DB Update (checkout.session.completed): Restaurant ID ${currentRestaurantId}, Plan: ${planLevel}, Status: 'active', Stripe Customer: ${customerId}, Ends At: ${subscriptionEndsAt.toISOString()}`);
          // Example Supabase update:
          // const { error } = await supabaseAdmin
          //   .from('restaurants')
          //   .update({
          //     plan_level: planLevel,
          //     subscription_status: 'active',
          //     stripe_customer_id: customerId,
          //     subscription_ends_at: subscriptionEndsAt.toISOString(),
          //   })
          //   .eq('id', currentRestaurantId);
          // if (error) console.error('Supabase update error (checkout.session.completed):', error);

        } catch (stripeError: any) {
            console.error(`Stripe API error retrieving subscription ${session.subscription}: ${stripeError.message}`);
        }
      } else {
        console.error('Error: restaurant_id or subscription ID not found in checkout.session.completed metadata.');
      }
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      const updatedRestaurantId = updatedSubscription.metadata?.restaurant_id;

      console.log(`Subscription updated: ${updatedSubscription.id}, Status: ${updatedSubscription.status}, restaurant_id: ${updatedRestaurantId}`);
      if (updatedRestaurantId) {
        const planId = updatedSubscription.items.data[0]?.price.id;
        // const planLevel = determinePlanLevel(planId); // TODO: Implement determinePlanLevel
        const planLevel = `plan_for_${planId}`; // Placeholder
        const subscriptionStatus = updatedSubscription.status;
        let subscriptionEndsAt: Date | null = null;

        if (updatedSubscription.cancel_at_period_end) {
          subscriptionEndsAt = new Date(updatedSubscription.cancel_at! * 1000);
        } else if (updatedSubscription.ended_at) {
          subscriptionEndsAt = new Date(updatedSubscription.ended_at * 1000);
        } else {
          subscriptionEndsAt = new Date(updatedSubscription.current_period_end * 1000);
        }

        console.log(`TODO DB Update (customer.subscription.updated): Restaurant ID ${updatedRestaurantId}, Plan: ${planLevel}, Status: ${subscriptionStatus}, Ends At: ${subscriptionEndsAt?.toISOString()}`);
        // Example Supabase update:
        // const { error } = await supabaseAdmin
        //   .from('restaurants')
        //   .update({
        //     plan_level: planLevel,
        //     subscription_status: subscriptionStatus,
        //     subscription_ends_at: subscriptionEndsAt?.toISOString(),
        //   })
        //   .eq('id', updatedRestaurantId);
        // if (error) console.error('Supabase update error (customer.subscription.updated):', error);
      } else {
         console.error('Error: restaurant_id not found in customer.subscription.updated metadata.');
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      const deletedRestaurantId = deletedSubscription.metadata?.restaurant_id;

      console.log(`Subscription deleted: ${deletedSubscription.id}, restaurant_id: ${deletedRestaurantId}`);
      if (deletedRestaurantId) {
        const subscriptionStatus = 'canceled'; // Or 'inactive' based on your logic
        const subscriptionEndsAt = deletedSubscription.ended_at ? new Date(deletedSubscription.ended_at * 1000) : new Date(); // Default to now if ended_at is not set

        console.log(`TODO DB Update (customer.subscription.deleted): Restaurant ID ${deletedRestaurantId}, Status: ${subscriptionStatus}, Ends At: ${subscriptionEndsAt.toISOString()}`);
        // Example Supabase update:
        // const { error } = await supabaseAdmin
        //   .from('restaurants')
        //   .update({
        //     subscription_status: subscriptionStatus,
        //     plan_level: 'free', // Consider reverting to a free plan
        //     subscription_ends_at: subscriptionEndsAt.toISOString(),
        //   })
        //   .eq('id', deletedRestaurantId);
        // if (error) console.error('Supabase update error (customer.subscription.deleted):', error);
      } else {
        console.error('Error: restaurant_id not found in customer.subscription.deleted metadata.');
      }
      break;

    // Add other event types you want to handle, e.g.:
    // case 'invoice.payment_succeeded':
    //   const invoice = event.data.object as Stripe.Invoice;
    //   console.log(`Invoice payment succeeded for: ${invoice.customer_email}`);
    //   // Potentially update billing cycle information or log payment
    //   break;
    // case 'invoice.payment_failed':
    //   const failedInvoice = event.data.object as Stripe.Invoice;
    //   console.log(`Invoice payment failed for: ${failedInvoice.customer_email}`);
    //   // Notify customer, update subscription status if needed (e.g., to 'past_due')
    //   break;

    default:
      console.warn(`Unhandled event type: ${event.type}.`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
