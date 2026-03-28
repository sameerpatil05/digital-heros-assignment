import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionInfo {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  subscription: SubscriptionInfo;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  subscription: { subscribed: false, productId: null, priceId: null, subscriptionEnd: null },
  signOut: async () => {},
  refreshSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    subscribed: false,
    productId: null,
    priceId: null,
    subscriptionEnd: null,
  });

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const refreshSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("Subscription check error:", error);
        return;
      }
      setSubscription({
        subscribed: data?.subscribed || false,
        productId: data?.product_id || null,
        priceId: data?.price_id || null,
        subscriptionEnd: data?.subscription_end || null,
      });
    } catch (err) {
      console.error("Subscription check failed:", err);
    }
  };

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkAdmin(session.user.id);
          // Defer subscription check to avoid blocking
          setTimeout(() => refreshSubscription(), 0);
        } else {
          setIsAdmin(false);
          setSubscription({ subscribed: false, productId: null, priceId: null, subscriptionEnd: null });
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
        setTimeout(() => refreshSubscription(), 0);
      }
      setLoading(false);
    });

    // Auto-refresh subscription every 60s
    const interval = setInterval(() => {
      if (user) refreshSubscription();
    }, 60000);

    return () => {
      authSub.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setSubscription({ subscribed: false, productId: null, priceId: null, subscriptionEnd: null });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, subscription, signOut, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};
