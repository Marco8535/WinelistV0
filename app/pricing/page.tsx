"use client"; // Required for useState and event handlers

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loadStripe } from '@stripe/stripe-js';

// IMPORTANT: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be set in your .env.local file
// Example: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
// The other keys (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) are for backend use.

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null); // To track loading state per plan

  // Replace these with your actual Stripe Price IDs from your Stripe dashboard (Test mode IDs are fine for development)
  const plans = [
    {
      name: "Basic",
      price: "$10/month",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      priceId: "price_1PObX9RxuBNV3DD8zYn27tH1", // Replace with your actual Basic plan Price ID
    },
    {
      name: "Premium",
      price: "$25/month",
      features: ["All Basic Features", "Feature X", "Feature Y", "Priority Support"],
      priceId: "price_1PObXWRxuBNV3DD8A2ZmvLhk", // Replace with your actual Premium plan Price ID
    },
    // Example of a yearly plan
    // {
    //   name: "Premium Yearly",
    //   price: "$250/year",
    //   features: ["All Basic Features", "Feature X", "Feature Y", "Priority Support", "2 Months Free"],
    //   priceId: "price_YEARLY_PLAN_ID", // Replace with your actual Yearly plan Price ID
    // },
  ];

  const handleSubscribe = async (priceId: string) => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      alert("Stripe publishable key is not set. Please configure environment variables.");
      console.error("Stripe publishable key is missing from environment variables.");
      return;
    }

    setLoadingPlan(priceId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error('Checkout API error:', errorBody);
        alert(`Error: ${errorBody.error || 'Could not initiate checkout. Check server logs.'}`);
        setLoadingPlan(null);
        return;
      }

      const { sessionId } = await response.json();
      if (!sessionId) {
        alert('Error: Could not retrieve session ID from the server.');
        setLoadingPlan(null);
        return;
      }

      const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      const stripe = await stripePromise;

      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
        if (stripeError) {
          console.error("Stripe redirectToCheckout error:", stripeError);
          alert(`Stripe Error: ${stripeError.message}`);
          setLoadingPlan(null); // Stop loading if redirect fails or is cancelled by user staying on page
        }
        // If redirectToCheckout is successful, the user is redirected and this part might not be reached.
        // If they are not redirected (e.g. popup blocker, or some other issue), stop loading.
      } else {
        console.error('Stripe.js failed to load.');
        alert('Stripe.js failed to load. Please check your internet connection or ad blockers.');
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error('Subscription initiation error:', error);
      alert('An unexpected error occurred while trying to subscribe. Please try again.');
      setLoadingPlan(null);
    }
    // setLoadingPlan(null); // Usually, you want to keep loading true until redirection or explicit failure.
    // If redirectToCheckout fails and the user stays on the page, the loading state is reset above.
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">
        Choose Your Plan
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col shadow-lg">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-2xl font-semibold">{plan.name} Plan</CardTitle>
              <CardDescription className="text-xl font-medium">{plan.price}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow py-6">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full py-3 text-lg"
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loadingPlan === plan.priceId || !plan.priceId.startsWith('price_')}
                aria-busy={loadingPlan === plan.priceId}
              >
                {loadingPlan === plan.priceId ? 'Processing...' : 'Suscribirse'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <p className="text-center text-sm text-gray-500 mt-8">
        Note: Ensure Stripe Price IDs are correctly configured for actual subscription. <br/>
        Remember to set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your environment variables.
      </p>
    </div>
  );
}
