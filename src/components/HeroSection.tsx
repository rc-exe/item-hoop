import { Button } from "@/components/ui/button";
import { ArrowRight, Repeat, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-exchange-minimal.jpg";
import { FadeInUp, FadeInLeft, FadeInRight } from "./ScrollAnimations";
import LottieAnimation from "./LottieAnimation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();
  const [memberCount, setMemberCount] = useState(0);
  const [exchangeCount, setExchangeCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      // Fetch member count
      const { count: members } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Fetch exchange count using public function (accessible to all users)
      const { data: exchangeData } = await supabase
        .rpc('get_total_exchange_count');

      setMemberCount(members || 0);
      setExchangeCount(exchangeData || 0);
    };

    fetchCounts();

    // Set up realtime subscriptions
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchCounts();
      })
      .subscribe();

    const exchangesChannel = supabase
      .channel('exchanges-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exchanges' }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(exchangesChannel);
    };
  }, []);
  return (
    <section className="relative bg-background py-24 lg:py-36 overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Floating Animation Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 opacity-20">
        <LottieAnimation className="w-full h-full" />
      </div>
      <div className="absolute bottom-20 right-10 w-16 h-16 opacity-20">
        <LottieAnimation className="w-full h-full" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <FadeInLeft className="space-y-10">
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-5xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] tracking-tight"
              >
                Exchange Items,
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="block bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent"
                >
                  Build Community
                </motion.span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-lg font-sans leading-relaxed"
              >
                Join thousands trading items without money. From books to bikes, 
                find what you need and give what you don't. Sustainable, social, simple.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {!user && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="hero" size="lg" className="shadow-hero font-semibold text-base px-8 py-6 rounded-xl" asChild>
                    <a href="/register">
                      Start Exchanging
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </a>
                  </Button>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="lg" className="font-semibold text-base px-8 py-6 rounded-xl border-2" asChild>
                  <a href="/browse">Browse Items</a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center gap-8 pt-10"
            >
              {[
                { icon: Users, text: `${memberCount.toLocaleString()}+ Members`, delay: 0.7 },
                { icon: Repeat, text: `${exchangeCount.toLocaleString()}+ Exchanges`, delay: 0.8 },
                { icon: Shield, text: "100% Secure", delay: 0.9 }
              ].map(({ icon: Icon, text, delay }, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay }}
                  className="flex items-center space-x-3 text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </FadeInLeft>

          {/* Hero Image */}
          <FadeInRight className="relative lg:order-last">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-10"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                <img
                  src={heroImage}
                  alt="People exchanging items in a community setting"
                  className="w-full transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
            
            {/* Animated Decorative Elements */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl"
            />
            
            {/* Floating Lottie Animation */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-1/2 -right-8 w-16 h-16 opacity-60"
            >
              <LottieAnimation />
            </motion.div>
          </FadeInRight>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;