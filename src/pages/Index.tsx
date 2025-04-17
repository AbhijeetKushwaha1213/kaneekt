
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Search, Users, ArrowRight, Sparkles, TrendingUp, Heart, MapPin } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Redirect to chats if already logged in
    if (user && !loading) {
      navigate("/chats");
    }
  }, [user, loading, navigate]);
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b py-4 px-6 bg-background">
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
      
      {/* Hero section with dynamic animated tag line */}
      <section className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent -z-10"></div>
        <div className="absolute top-10 right-10 rotate-12 opacity-20 text-primary">
          <Sparkles size={120} />
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6 max-w-2xl animate-in fade-in-up">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in-up stagger-1">
                <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/20 px-3 py-1">
                  <Heart className="h-3 w-3 mr-1" /> Connect
                </Badge>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> Discover
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">
                  <MapPin className="h-3 w-3 mr-1" /> Explore
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Connect with people who share your <span className="text-primary animate-pulse">interests</span>
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
            <div className="bg-background rounded-lg p-6 shadow-sm border animate-in fade-in-up stagger-1 hover:shadow-md transition-all duration-300 hover:border-primary/20">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-3">
                <Badge className="mb-2" variant="secondary">Popular</Badge>
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
            <div className="bg-background rounded-lg p-6 shadow-sm border animate-in fade-in-up stagger-2 hover:shadow-md transition-all duration-300 hover:border-primary/20">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-3">
                <Badge className="mb-2" variant="outline">New</Badge>
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
            <div className="bg-background rounded-lg p-6 shadow-sm border animate-in fade-in-up stagger-3 hover:shadow-md transition-all duration-300 hover:border-primary/20">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-3">
                <Badge className="mb-2" variant="destructive">Trending</Badge>
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
      
      {/* Trending Tags Section */}
      <section className="py-12 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">Trending Topics</h3>
          <div className="flex flex-wrap gap-3">
            {['Technology', 'Travel', 'Art', 'Music', 'Photography', 'Gaming', 'Books', 'Fitness', 
              'Cooking', 'Finance', 'Science', 'Fashion', 'Movies', 'Nature', 'Sports'].map((tag, index) => (
              <Badge 
                key={tag} 
                variant={index < 5 ? "default" : "outline"}
                className="px-3 py-1.5 text-sm hover:bg-primary/20 cursor-pointer transition-colors"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="outline">Limited Time</Badge>
          <h2 className="text-3xl font-bold mb-4">Ready to connect?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join a community of people who value meaningful connections and conversations.
          </p>
          <Button asChild size="lg" className="animate-pulse">
            <Link to="/auth?tab=signup">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
