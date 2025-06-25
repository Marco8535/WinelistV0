import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'; // Or your auth method
// import { cookies } from 'next/headers';

// This is a placeholder for your actual Stripe secret key
// Ensure STRIPE_SECRET_KEY is set in your environment variables for production
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_yourkey');

export async function POST(req: Request) {
  // TODO: Replace with actual Supabase client and user authentication
  // const supabase = createRouteHandlerClient({ cookies });
  // const { data: { user } } = await supabase.auth.getUser();

  // if (!user) {
  //   return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
  //     status: 401,
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  // }

  // TODO: Replace with actual restaurant data fetching based on the authenticated user
  // const { data: restaurant, error: dbError } = await supabase
  //   .from('restaurants')
  //   .select('id, stripe_customer_id, name, owner_email') // owner_email or user.email for customer creation
  //   .eq('user_id', user.id) // Assuming a 'user_id' column links restaurants to users
  //   .single();

  // if (dbError || !restaurant) {
  //   console.error('Database error or restaurant not found:', dbError);
  //   return new NextResponse(JSON.stringify({ error: 'Restaurant not found or database error' }), {
  //     status: 500,
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  // }

  // **** SIMULATED USER AND RESTAURANT DATA FOR THIS SUBTASK ****
  // Replace these with actual data from your authentication and database
  const user = { email: 'testuser@example.com', id: 'user_sim_123' };
  const restaurant = {
    id: 'res_sim_123',
    name: 'Simulated Test Restaurant',
    stripe_customer_id: null // Simulate a new customer first
    // stripe_customer_id: 'cus_existingcustomerid' // Use this to test existing customer path
  };
  // **** END SIMULATED DATA ****

  try {
    const { priceId } = await req.json();

    if (!priceId) {
      return new NextResponse(JSON.stringify({ error: 'Price ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let stripeCustomerId = restaurant.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: restaurant.name,
        metadata: {
          // supabase_user_id: user.id, // Optional: link Stripe customer to your user ID
          restaurantId: restaurant.id // Ensuring consistent key name
        },
      });
      stripeCustomerId = customer.id;

      // TODO: Save stripeCustomerId to your database for this restaurant.
      // This is a critical step for associating the Stripe customer with your application's data.
      // Example:
      // const { error: updateError } = await supabase
      //   .from('restaurants')
      //   .update({ stripe_customer_id: stripeCustomerId })
      //   .eq('id', restaurant.id);
      // if (updateError) {
      //   console.error('Failed to update restaurant with Stripe customer ID:', updateError);
      //   // Consider how to handle this error; maybe don't proceed with checkout or log for manual intervention
      // }
      console.log(`New Stripe customer created: ${stripeCustomerId} for restaurant ${restaurant.id}. Database update required.`);
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'; // Fallback for local dev if origin is null
    const success_url = `${origin}/admin-panel/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${origin}/pricing?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer: stripeCustomerId,
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        // supabase_user_id: user.id, // Optional
        restaurantId: restaurant.id // Important for webhooks to identify the restaurant & consistency
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Stripe Checkout API Error:', error);
    // It's good practice to hide specific Stripe errors from the client in production
    const errorMessage = error instanceof Stripe.errors.StripeError ? 'An error occurred with our payment provider.' : 'An internal server error occurred.';
    return new NextResponse(JSON.stringify({ error: errorMessage, detail: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
