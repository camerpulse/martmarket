import Header from "../components/Header";
import Hero from "../components/Hero";
import FeaturedVendors from "../components/FeaturedVendors";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturedVendors />
      <ProductGrid />
      <Footer />
    </div>
  );
};

export default Index;
