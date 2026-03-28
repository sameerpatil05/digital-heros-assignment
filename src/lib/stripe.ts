// Stripe product/price mapping — update these when creating new products
export const STRIPE_PLANS = {
  monthly: {
    priceId: "price_1TG0YyK3I51axDOmUphib6zX",
    productId: "prod_UETW6CzxdbseFm",
    name: "Monthly",
    price: "$10",
    priceAmount: 1000,
    interval: "month" as const,
  },
  yearly: {
    priceId: "", // Add yearly price ID after creating the product
    productId: "",
    name: "Yearly",
    price: "$100",
    priceAmount: 10000,
    interval: "year" as const,
  },
} as const;
