
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <div className="glass-card p-8 md:p-12 max-w-md text-center animate-in">
        <div className="h-16 w-16 bg-construction-50 rounded-full flex items-center justify-center text-construction-600 mx-auto mb-6">
          <span className="text-4xl font-bold">404</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button 
            className="btn-premium flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
