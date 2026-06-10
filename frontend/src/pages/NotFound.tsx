import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist. Return to Shyara Marketing homepage."
      />
      <div className="flex min-h-[60vh] items-center justify-center px-4 pt-24">
        <div className="text-center">
          <h1 className="font-heading mb-4 text-6xl font-black tracking-tighter">404</h1>
          <p className="mb-6 text-base text-[#0A0A0A]/70">
            That page does not exist. Try one of these instead:
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center border-2 border-[#0A0A0A] bg-[#FF3333] px-8 py-3 font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#0a0a0a]"
            >
              Home
            </Link>
            <Link
              to="/work"
              className="inline-flex min-h-11 items-center border-2 border-[#0A0A0A] bg-white px-8 py-3 font-bold uppercase tracking-wide transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#0a0a0a]"
            >
              Work
            </Link>
            <a
              href="https://wa.me/919584661610"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center border-2 border-[#0A0A0A] bg-white px-8 py-3 font-bold uppercase tracking-wide transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#0a0a0a]"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
