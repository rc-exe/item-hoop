import { Button } from "@/components/ui/button";
import { ArrowRight, Repeat, Shield, Users } from "lucide-react";
import heroImage from "@/assets/hero-exchange.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-background via-muted/30 to-primary/5 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Exchange Items,
                <span className="text-primary block">Build Community</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Join thousands trading items without money. From books to bikes, 
                find what you need and give what you don't. Sustainable, social, simple.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="shadow-hero">
                Start Exchanging
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
                Browse Items
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm">10,000+ Members</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Repeat className="w-5 h-5 text-primary" />
                <span className="text-sm">50,000+ Exchanges</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">100% Secure</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:order-last">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="People exchanging items in a community setting"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;