import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, MapPin, Camera, MessageCircle, AlertTriangle, CheckCircle } from "lucide-react";

const SafetyTips = () => {
  const tips = [
    {
      icon: MapPin,
      title: "Meet in Public Places",
      description: "Always arrange to meet in well-lit, public locations like shopping centers, cafes, or police station parking lots. Avoid private residences for first-time exchanges."
    },
    {
      icon: Camera,
      title: "Document Everything",
      description: "Take photos of items before and during the exchange. Keep records of all communications. This helps resolve any disputes that may arise."
    },
    {
      icon: MessageCircle,
      title: "Use In-App Messaging",
      description: "Keep all communication within BarterHub's messaging system. This creates a record and helps our team assist if issues occur."
    },
    {
      icon: AlertTriangle,
      title: "Trust Your Instincts",
      description: "If something feels off about an exchange or person, don't proceed. It's better to miss an opportunity than to put yourself at risk."
    },
    {
      icon: CheckCircle,
      title: "Verify Items Before Exchanging",
      description: "Inspect items thoroughly before completing an exchange. Test electronics, check for damage, and ensure the item matches the description."
    },
    {
      icon: Shield,
      title: "Protect Personal Information",
      description: "Never share sensitive information like your home address, financial details, or personal identification until you trust the other party."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4 gradient-text">Safety Tips</h1>
            <p className="text-muted-foreground text-lg">
              Your safety is our priority. Follow these guidelines for secure exchanges.
            </p>
          </div>

          <div className="grid gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="glass-card p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 glass-card p-8 bg-destructive/5 border-destructive/20">
            <h2 className="text-xl font-bold mb-4 text-destructive">Report Suspicious Activity</h2>
            <p className="text-muted-foreground mb-4">
              If you encounter suspicious behavior, scam attempts, or feel unsafe, please report it immediately. 
              Our team reviews all reports within 24 hours.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact us at: <span className="text-primary font-medium">safety@barterhub.com</span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SafetyTips;
