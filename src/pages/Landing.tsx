import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, MessageSquare, History, Sparkles } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-full bg-primary/10">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight">
            Football Knowledge AI
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent companion for all things football. Get instant answers, insights, and analysis powered by AI.
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign Up
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="space-y-3">
              <div className="flex justify-center">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Conversations</h3>
              <p className="text-muted-foreground">
                Chat naturally about matches, players, tactics, and stats
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-center">
                <History className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Conversation History</h3>
              <p className="text-muted-foreground">
                Keep track of all your football discussions and insights
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered</h3>
              <p className="text-muted-foreground">
                Get accurate, up-to-date information instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
