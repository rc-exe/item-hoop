import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Facebook, Twitter, Instagram, Mail, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-border backdrop-blur-sm">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold text-foreground">BarterHub</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The sustainable way to get what you need by giving what you don't. 
              Join our community of conscious exchangers.
            </p>
            <div className="flex space-x-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <Button 
                  key={i}
                  variant="ghost" 
                  size="icon"
                  className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground text-lg">Quick Links</h4>
            <ul className="space-y-3 text-muted-foreground">
              {[
                { label: "Browse Items", href: "/browse" },
                { label: "List an Item", href: "/list-item" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Categories", href: "/browse" }
              ].map((link, i) => (
                <li key={i}>
                  <a 
                    href={link.href} 
                    className="hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground text-lg">Support</h4>
            <ul className="space-y-3 text-muted-foreground">
              {[
                { label: "Help Center", href: "/help-center" },
                { label: "Safety Tips", href: "/safety-tips" },
                { label: "Community Guidelines", href: "/community-guidelines" },
                { label: "Contact Us", href: "/contact-us" }
              ].map((link, i) => (
                <li key={i}>
                  <a 
                    href={link.href} 
                    className="hover:text-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground text-lg">Stay Updated</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Get notified about new items and exchange opportunities.
            </p>
            <div className="flex space-x-2">
              <Input 
                placeholder="Enter your email" 
                className="flex-1 rounded-xl border-border/50 bg-background/50 focus:border-primary"
              />
              <Button 
                size="icon"
                className="rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-border/50" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2024 BarterHub. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
