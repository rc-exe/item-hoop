import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedItems from "@/components/FeaturedItems";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategorySection />
      <FeaturedItems />
      <Footer />
    </div>
  );
};

export default Index;
