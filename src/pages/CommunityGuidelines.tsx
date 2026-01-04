import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Heart, Ban, Scale, MessageSquare, Star } from "lucide-react";

const CommunityGuidelines = () => {
  const guidelines = [
    {
      icon: Heart,
      title: "Be Respectful",
      points: [
        "Treat all members with courtesy and respect",
        "Use appropriate language in all communications",
        "Respect cultural differences and personal boundaries",
        "Give constructive feedback when rating exchanges"
      ]
    },
    {
      icon: Scale,
      title: "Be Honest",
      points: [
        "Accurately describe items you list for exchange",
        "Disclose any defects, damage, or issues",
        "Provide clear, recent photos of your items",
        "Honor your exchange commitments"
      ]
    },
    {
      icon: MessageSquare,
      title: "Communicate Clearly",
      points: [
        "Respond to messages in a timely manner",
        "Be clear about your exchange expectations",
        "Notify others promptly if plans change",
        "Use the messaging system for all negotiations"
      ]
    },
    {
      icon: Star,
      title: "Build Trust",
      points: [
        "Complete your profile with accurate information",
        "Leave honest ratings after exchanges",
        "Build a positive reputation through fair dealings",
        "Report any issues through proper channels"
      ]
    }
  ];

  const prohibited = [
    "Illegal items or substances",
    "Counterfeit or stolen goods",
    "Weapons or dangerous materials",
    "Adult content or services",
    "Spam, scams, or fraudulent listings",
    "Harassment or threatening behavior",
    "Discrimination of any kind",
    "Misrepresentation or false claims"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4 gradient-text">Community Guidelines</h1>
            <p className="text-muted-foreground text-lg">
              Our community thrives on trust, respect, and fair exchange. Please follow these guidelines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {guidelines.map((guideline, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <guideline.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{guideline.title}</h3>
                </div>
                <ul className="space-y-2">
                  {guideline.points.map((point, i) => (
                    <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="glass-card p-8 border-destructive/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-destructive">Prohibited Content & Behavior</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {prohibited.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Violations may result in warnings, suspension, or permanent removal from BarterHub.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityGuidelines;
