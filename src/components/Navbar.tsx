import { Button } from "@/components/ui/button";
import { Search, User, Plus, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-foreground">BarterHub</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search items to exchange..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2">
            
            <Link to="/notifications">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Bell className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link to="/list-item">
              <Button variant="accent" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                List Item
              </Button>
            </Link>

            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>

          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;