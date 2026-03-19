import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist. Return to Shyara Marketing homepage."
      />
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-display font-bold text-foreground">404</h1>
          <p className="mb-6 text-body text-muted-foreground">Oops! Page not found</p>
          <Link to="/">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
