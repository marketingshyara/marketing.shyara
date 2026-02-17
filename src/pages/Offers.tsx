import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, TrendingUp, Smartphone, Search } from "lucide-react";
import restaurantOfferImage from "@/assets/restaurant-offer.png";

const offers = [
  {
    id: "restaurant-website",
    title: "Restaurant Website",
    price: "₹2,999",
    originalPrice: "₹9,999",
    tagline: "Still sharing menu photos on WhatsApp?",
    description: "Get a professional restaurant website that improves your Google ranking and helps convert visitors into customers.",
    image: restaurantOfferImage,
    features: [
      "Improves Google Ranking",
      "Mobile Friendly Design",
      "Easy to Use & Manage",
      "SEO Optimized for AI Discovery",
      "Helps ChatGPT/Gemini recommend you",
      "Menu Display with Categories",
    ],
    highlight: "AI-Ready SEO",
    ctaMessage: "Hi Shyara Marketing, I saw the Restaurant Website offer at ₹2,999 on your website. I'm interested - could you share more details and next steps?",
  },
];

export default function Offers() {
  const openWhatsApp = (message: string) => {
    window.open(
      `https://wa.me/919584661610?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <Layout>
      <SEO 
        title="Special Offers"
        description="Exclusive offers on digital marketing services. Get professional websites, social media management, and more at discounted prices. Restaurant website starting at ₹2999."
        canonical="/offers"
        keywords="restaurant website offer, cheap website India, SEO optimized website, affordable web design, website development discount, digital marketing offers"
      />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Limited Time Offers</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Special Offers
            </h1>
            <p className="text-lg text-muted-foreground">
              Take advantage of our exclusive deals and grow your business with professional digital solutions at unbeatable prices.
            </p>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="pb-20">
        <div className="container">
          <div className="grid gap-8 max-w-5xl mx-auto">
            {offers.map((offer) => (
              <Card key={offer.id} className="overflow-hidden border-accent/30 bg-gradient-to-br from-card to-accent/5">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Side */}
                  <div className="relative overflow-hidden bg-accent/5">
                    <img 
                      src={offer.image} 
                      alt={offer.title}
                      className="w-full h-full object-cover min-h-[300px] md:min-h-[400px]"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-accent text-accent-foreground text-sm font-bold px-4 py-2 rounded-full">
                        {offer.highlight}
                      </span>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <CardHeader className="p-0 mb-4">
                      <p className="text-lg text-muted-foreground mb-2">{offer.tagline}</p>
                      <CardTitle className="text-2xl md:text-3xl mb-2">{offer.title}</CardTitle>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-accent">{offer.price}</span>
                        <span className="text-lg text-muted-foreground line-through">{offer.originalPrice}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <CardDescription className="text-base mb-6">
                        {offer.description}
                      </CardDescription>

                      <ul className="space-y-3 mb-8">
                        {offer.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 text-accent" />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        size="lg"
                        onClick={() => openWhatsApp(offer.ctaMessage)}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Get This Offer on WhatsApp
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Website Solutions?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Better Rankings</h3>
                <p className="text-sm text-muted-foreground">SEO-optimized websites that rank higher on Google search results.</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Mobile First</h3>
                <p className="text-sm text-muted-foreground">Fully responsive designs that look great on all devices.</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">AI Discovery</h3>
                <p className="text-sm text-muted-foreground">SEO helps ChatGPT & Gemini recommend your business to users.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
