
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Search, Users, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthUser } from "@/types";

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  
  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Redirect to chats if already logged in
        if (parsedUser.isLoggedIn) {
          navigate("/chats");
        }
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem("user");
      }
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">syncterest</div>
          <div>
            <Button asChild variant="outline" className="mr-2">
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?tab=signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent -z-10"></div>
        
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6 max-w-2xl animate-in fade-in-up">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Connect with people who share your <span className="text-primary">interests</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Find like-minded individuals for meaningful conversations, activities, and collaborations.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="animate-in fade-in-up stagger-1">
                <Link to="/auth?tab=signup">Join Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="animate-in fade-in-up stagger-2">
                <Link to="/auth">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How syncterest works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background rounded-lg p-6 shadow-sm border animate-in fade-in-up stagger-1">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Discover People</h3>
              <p className="text-muted-foreground mb-4">
                Find people who share your interests, from sports enthusiasts to philosophy lovers.
              </p>
              <Link to="/auth" className="text-primary inline-flex items-center">
                Browse people <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-background rounded-lg p-6 shadow-sm border animate-in fade-in-up stagger-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Start Conversations</h3>
              <p className="text-muted-foreground mb-4">
                Engage in meaningful discussions about topics you're passionate about.
              </p>
              <Link to="/auth" className="text-primary inline-flex items-center">
                Messages <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-background rounded-lg p-6 shadow-sm border animate-in fade-in-up stagger-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Join Channels</h3>
              <p className="text-muted-foreground mb-4">
                Participate in group discussions and activities with like-minded communities.
              </p>
              <Link to="/auth" className="text-primary inline-flex items-center">
                Explore channels <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to connect?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join a community of people who value meaningful connections and conversations.
          </p>
          <Button asChild size="lg">
            <Link to="/auth?tab=signup">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
