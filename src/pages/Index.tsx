import { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";
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
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  
  const { messages, isLoading, sendMessage, clearMessages } = useFootballChat(
    currentConversationId
  );

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem("footballpedia_conversations");
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed.map((c: any) => ({
        ...c,
        timestamp: new Date(c.timestamp)
      })));
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("footballpedia_conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

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

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      handleNewConversation();
    }
  };

  const showResults = messages.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FootballPedia
            </h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewConversation}
            className="hidden sm:flex"
          >
            New Search
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!showResults ? (
            /* Homepage - Centered Search */
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
