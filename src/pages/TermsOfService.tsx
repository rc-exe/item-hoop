import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

const TermsOfService = () => {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: `By accessing or using BarterHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to modify these terms at any time, and continued use constitutes acceptance of any changes.`
    },
    {
      title: "Eligibility",
      content: `To use BarterHub, you must:
      • Be at least 18 years of age
      • Have the legal capacity to enter into contracts
      • Not be prohibited from using the service under applicable laws
      • Provide accurate and complete registration information`
    },
    {
      title: "User Accounts",
      content: `You are responsible for:
      • Maintaining the confidentiality of your account credentials
      • All activities that occur under your account
      • Notifying us immediately of any unauthorized access
      • Keeping your profile information accurate and current
      We reserve the right to suspend or terminate accounts that violate these terms.`
    },
    {
      title: "Item Listings",
      content: `When listing items, you agree to:
      • Provide accurate descriptions and genuine photos
      • Only list items you have the legal right to exchange
      • Not list prohibited items (illegal goods, counterfeit products, hazardous materials)
      • Respond to inquiries in a timely manner
      • Honor exchange agreements made through the platform`
    },
    {
      title: "Exchange Process",
      content: `BarterHub facilitates connections between members but is not a party to exchanges. You acknowledge that:
      • All exchanges are conducted at your own risk
      • You are responsible for verifying item condition before exchanging
      • BarterHub does not guarantee the quality or authenticity of items
      • Disputes should be resolved directly between parties
      • We may assist with mediation but are not obligated to do so`
    },
    {
      title: "Prohibited Conduct",
      content: `You agree not to:
      • Violate any applicable laws or regulations
      • Harass, threaten, or abuse other users
      • Post false, misleading, or defamatory content
      • Attempt to manipulate ratings or reviews
      • Use the platform for spam or commercial solicitation
      • Circumvent security measures or access restrictions
      • Scrape or collect user data without authorization`
    },
    {
      title: "Intellectual Property",
      content: `BarterHub owns all rights to the platform, including:
      • Trademarks, logos, and branding
      • Website design and user interface
      • Software and underlying technology
      User-generated content remains owned by users, but you grant us a license to display and distribute it on the platform.`
    },
    {
      title: "Limitation of Liability",
      content: `To the maximum extent permitted by law:
      • BarterHub is provided "as is" without warranties
      • We are not liable for damages arising from platform use
      • We are not responsible for user-to-user interactions
      • Our total liability is limited to the amount you paid us (if any)
      • We are not liable for indirect, incidental, or consequential damages`
    },
    {
      title: "Dispute Resolution",
      content: `Any disputes arising from these terms or platform use shall be:
      • First attempted to be resolved through informal negotiation
      • Subject to binding arbitration if negotiation fails
      • Governed by the laws of India
      • Resolved in courts located in Mumbai, Maharashtra`
    },
    {
      title: "Contact Information",
      content: `For questions about these Terms of Service:
      • Email: legal@barterhub.com
      • Address: Mumbai, Maharashtra, India`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4 gradient-text">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 2026</p>
          </div>

          <div className="glass-card p-8 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to BarterHub. These Terms of Service govern your use of our platform and services. 
              Please read them carefully before using BarterHub.
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

export default TermsOfService;
