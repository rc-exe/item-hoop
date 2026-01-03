import { Button } from "@/components/ui/button";
import { ArrowRight, Repeat, Shield, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-community-exchange.jpg";
import { FadeInUp, FadeInLeft, FadeInRight } from "./ScrollAnimations";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();
  const [memberCount, setMemberCount] = useState(0);
  const [exchangeCount, setExchangeCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: members } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const { data: exchangeData } = await supabase
        .rpc('get_total_exchange_count');

      setMemberCount(members || 0);
      setExchangeCount(exchangeData || 0);
    };

    fetchCounts();

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
    <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
      {/* Modern mesh gradient background */}
      <div className="absolute inset-0 bg-mesh-gradient" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
      
      {/* Decorative elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-20 w-16 h-16 bg-primary/10 rounded-2xl backdrop-blur-sm border border-primary/20 hidden lg:flex items-center justify-center"
      >
        <Sparkles className="w-8 h-8 text-primary" />
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <FadeInLeft className="space-y-8">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Sustainable Trading Platform</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl lg:text-7xl font-display font-extrabold text-foreground leading-[1.1] tracking-tight"
              >
                Trade Items,
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="block gradient-text"
                >
                  Build Community
                </motion.span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-lg leading-relaxed"
              >
                Join thousands exchanging items without money. From books to bikes, 
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-primary text-primary-foreground font-semibold text-base px-8 py-6 rounded-2xl shadow-glow hover:shadow-accent transition-all duration-300" 
                    asChild
                  >
                    <a href="/register">
                      Start Exchanging
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </a>
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="font-semibold text-base px-8 py-6 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" 
                  asChild
                >
                  <a href="/browse">Browse Items</a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center gap-4 pt-8"
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
                  className="trust-badge"
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold">{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </FadeInLeft>

          {/* Hero Image */}
          <FadeInRight className="relative lg:order-last">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-10"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-hero group">
                <img
                  src={heroImage}
                  alt="People exchanging items in a community setting"
                  className="w-full aspect-[16/10] object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>
              
              {/* Floating stats card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Repeat className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{exchangeCount}+</p>
                    <p className="text-sm text-muted-foreground">Successful Trades</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Animated decorative elements */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl"
            />
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 right-12 w-24 h-24 bg-accent/10 rounded-full blur-2xl"
            />
          </FadeInRight>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
