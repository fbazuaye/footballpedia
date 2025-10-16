import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, X, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ConversationHistory } from "@/components/ConversationHistory";
import { useFootballChat } from "@/hooks/useFootballChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

const Index = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [userEmail, setUserEmail] = useState<string>("");
  
  const { messages, isLoading, sendMessage, clearMessages } = useFootballChat(
    currentConversationId
  );

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserEmail(session.user.email || "");
      } else {
        setUserEmail("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load conversations from database on mount
  useEffect(() => {
    const loadConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        setConversations(
          data.map((c) => ({
            id: c.id,
            title: c.title,
            timestamp: new Date(c.created_at),
            messages: [],
          }))
        );
      }
    };
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentConversationId) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true });

      if (data && !error) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConversationId
              ? {
                  ...c,
                  messages: data.map((msg) => ({
                    role: msg.role as "user" | "assistant",
                    content: msg.content,
                  })),
                }
              : c
          )
        );
      }
    };
    loadMessages();
  }, [currentConversationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input;
    setInput("");

    // Create new conversation if first message
    if (!currentConversationId) {
      const convId = crypto.randomUUID();
      const newConv: Conversation = {
        id: convId,
        title: query.slice(0, 50) + (query.length > 50 ? "..." : ""),
        timestamp: new Date(),
        messages: [],
      };

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("conversations").insert({
        id: convId,
        title: newConv.title,
        user_id: user.id,
      });
      
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversationId(convId);
    }

    await sendMessage(query);
  };

  const handleNewConversation = () => {
    clearMessages();
    setCurrentConversationId(undefined);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    // In a full implementation, messages would be restored here
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (id: string) => {
    // Delete from database
    await supabase.from("chat_messages").delete().eq("conversation_id", id);
    await supabase.from("conversations").delete().eq("id", id);

    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      handleNewConversation();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const showResults = messages.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userEmail && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FootballPedia
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {userEmail ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {userEmail}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewConversation}
                  className="hidden sm:flex"
                >
                  New Search
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth?mode=login")}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - only show when logged in */}
        {userEmail && (
          <div
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out`}
          >
            <ConversationHistory
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onNewConversation={handleNewConversation}
            />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!showResults ? (
            /* Homepage with Search */
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                  <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    FootballPedia
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Your AI-powered football encyclopedia
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about football..."
                    className="pl-12 pr-4 h-14 text-lg rounded-full border-2 border-border focus:border-primary transition-colors shadow-md"
                    autoFocus
                  />
                </form>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    "Who won the 2018 World Cup?",
                    "Tell me about Lionel Messi",
                    "Explain the offside rule",
                    "Top scorers in Premier League",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="p-3 text-left rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Results View */
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-4xl mx-auto space-y-6 pb-6">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                  {isLoading && <TypingIndicator />}
                </div>
              </ScrollArea>

              {/* Follow-up Input */}
              <div className="border-t border-border bg-background/80 backdrop-blur-md p-4">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="pr-12 h-12 rounded-full border-2 border-border focus:border-primary transition-colors"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>
            Designed By <span className="font-semibold text-foreground">Frank Bazuaye</span> | 
            Powered By <span className="font-semibold text-primary">LiveGig Ltd</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
