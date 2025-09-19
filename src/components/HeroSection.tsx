import { Button } from "@/components/ui/button";
import { ArrowRight, Repeat, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-exchange.jpg";
import { FadeInUp, FadeInLeft, FadeInRight } from "./ScrollAnimations";
import LottieAnimation from "./LottieAnimation";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-background via-muted/30 to-primary/5 py-20 lg:py-32 overflow-hidden">
      {/* Floating Animation Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 opacity-20">
        <LottieAnimation className="w-full h-full" />
      </div>
      <div className="absolute bottom-20 right-10 w-16 h-16 opacity-20">
        <LottieAnimation className="w-full h-full" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <FadeInLeft className="space-y-8">
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl lg:text-6xl font-display font-bold text-foreground leading-tight"
              >
                Exchange Items,
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-primary block bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"
                >
                  Build Community
                </motion.span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg text-muted-foreground max-w-lg font-sans"
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="hero" size="lg" className="shadow-hero font-medium" asChild>
                  <a href="/register">
                    Start Exchanging
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="lg" className="font-medium" asChild>
                  <a href="/browse">Browse Items</a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center space-x-8 pt-8"
            >
              {[
                { icon: Users, text: "10,000+ Members", delay: 0.7 },
                { icon: Repeat, text: "50,000+ Exchanges", delay: 0.8 },
                { icon: Shield, text: "100% Secure", delay: 0.9 }
              ].map(({ icon: Icon, text, delay }, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay }}
                  className="flex items-center space-x-2 text-muted-foreground"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{text}</span>
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
              <img
                src={heroImage}
                alt="People exchanging items in a community setting"
                className="rounded-2xl shadow-2xl w-full transform hover:scale-105 transition-transform duration-300"
              />
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