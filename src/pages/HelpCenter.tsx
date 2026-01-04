import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, Shield, Package } from "lucide-react";

const HelpCenter = () => {
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the navigation bar. Fill in your details including email, password, and basic profile information. Verify your email address to activate your account."
    },
    {
      question: "How do I list an item for exchange?",
      answer: "Navigate to 'List an Item' from your dashboard. Upload clear photos of your item, add a detailed description, select the appropriate category, and specify what you're looking for in exchange."
    },
    {
      question: "How does the exchange process work?",
      answer: "Browse available items, find something you like, and send an exchange request. The item owner will review your offer and can accept, decline, or counter-propose. Once both parties agree, coordinate the exchange details through our messaging system."
    },
    {
      question: "Is my personal information safe?",
      answer: "We take privacy seriously. Your personal contact information is only shared with exchange partners after both parties have agreed to an exchange. All data is encrypted and stored securely."
    },
    {
      question: "What if there's a problem with my exchange?",
      answer: "Contact our support team immediately. We have a dispute resolution process to help mediate issues. Document everything with photos and save all communication for reference."
    },
    {
      question: "Can I cancel an exchange request?",
      answer: "Yes, you can cancel pending exchange requests from your dashboard. However, once an exchange is marked as accepted, please communicate with the other party before canceling."
    }
  ];

  const categories = [
    { icon: Package, title: "Getting Started", description: "Learn the basics of using BarterHub" },
    { icon: MessageCircle, title: "Messaging", description: "How to communicate with other users" },
    { icon: Shield, title: "Safety & Privacy", description: "Keep your exchanges secure" },
    { icon: HelpCircle, title: "Troubleshooting", description: "Common issues and solutions" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 gradient-text">Help Center</h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions and learn how to make the most of BarterHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {categories.map((category, index) => (
              <div key={index} className="glass-card p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
                  <AccordionTrigger className="text-left font-medium hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
