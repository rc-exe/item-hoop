import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Information We Collect",
      content: `We collect information you provide directly, including:
      • Account information (name, email, phone number)
      • Profile details (bio, location, avatar)
      • Item listings (descriptions, photos, categories)
      • Communications (messages, exchange requests)
      • Transaction history and ratings`
    },
    {
      title: "How We Use Your Information",
      content: `We use collected information to:
      • Provide and improve our exchange platform
      • Facilitate communication between members
      • Process and manage exchanges
      • Send service notifications and updates
      • Ensure platform safety and security
      • Analyze usage to improve user experience`
    },
    {
      title: "Information Sharing",
      content: `We share your information only in these circumstances:
      • With exchange partners (limited profile info after agreement)
      • With service providers who assist our operations
      • When required by law or legal process
      • To protect rights, safety, and property
      • With your explicit consent`
    },
    {
      title: "Data Security",
      content: `We implement industry-standard security measures:
      • Encryption of data in transit and at rest
      • Secure authentication protocols
      • Regular security audits and updates
      • Limited employee access to personal data
      • Incident response procedures`
    },
    {
      title: "Your Rights",
      content: `You have the right to:
      • Access and review your personal data
      • Correct inaccurate information
      • Delete your account and associated data
      • Export your data in a portable format
      • Opt-out of marketing communications
      • Lodge complaints with data protection authorities`
    },
    {
      title: "Cookies & Tracking",
      content: `We use cookies and similar technologies to:
      • Keep you signed in
      • Remember your preferences
      • Analyze platform usage
      • Improve performance and security
      You can manage cookie preferences through your browser settings.`
    },
    {
      title: "Contact Us",
      content: `For privacy-related questions or concerns:
      • Email: privacy@barterhub.com
      • Address: Mumbai, Maharashtra, India
      We respond to all inquiries within 30 days.`
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
            <h1 className="text-4xl font-bold mb-4 gradient-text">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
          </div>

          <div className="glass-card p-8 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              At BarterHub, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, share, and protect your data when you use our platform.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="glass-card p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">{section.title}</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
