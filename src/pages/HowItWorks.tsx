import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UserPlus, Camera, Search, MessageCircle, Handshake, Star } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      step: 1,
      title: "Create Your Account",
      description: "Sign up for free and set up your profile. Add a photo and bio to help others get to know you."
    },
    {
      icon: Camera,
      step: 2,
      title: "List Your Items",
      description: "Take clear photos and write detailed descriptions of items you want to exchange. Set your preferences for what you're looking for."
    },
    {
      icon: Search,
      step: 3,
      title: "Browse & Discover",
      description: "Explore items from other members. Filter by category, location, and condition to find exactly what you need."
    },
    {
      icon: MessageCircle,
      step: 4,
      title: "Connect & Negotiate",
      description: "Send exchange requests and chat with other members. Discuss details and agree on a fair exchange."
    },
    {
      icon: Handshake,
      step: 5,
      title: "Meet & Exchange",
      description: "Arrange a safe meeting place to complete your exchange. Inspect items to ensure satisfaction."
    },
    {
      icon: Star,
      step: 6,
      title: "Rate & Review",
      description: "Share your experience by rating your exchange partner. Build trust and help the community grow."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4 gradient-text">How BarterHub Works</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Exchange items with your community in just a few simple steps. No money needed—just items you no longer need for ones you want.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary md:-translate-x-1/2 hidden md:block" />
            
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col md:flex-row gap-6 ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                    <div className={`glass-card p-6 ${index % 2 === 1 ? 'md:ml-auto' : ''} max-w-md`}>
                      <div className={`flex items-center gap-3 mb-3 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-primary">Step {step.step}</span>
                          <h3 className="font-bold text-lg text-foreground">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Center dot */}
                  <div className="hidden md:flex items-center justify-center w-14">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-background z-10" />
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center glass-card p-8 bg-primary/5">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Exchanging?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of members who are already exchanging items sustainably.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="btn-primary inline-flex items-center justify-center">
                Create Free Account
              </a>
              <a href="/browse" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors">
                Browse Items
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
