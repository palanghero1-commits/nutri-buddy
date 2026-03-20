import { useState } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "What foods are best for an underweight 3-year-old?",
  "Create a weekly meal plan for a 5-year-old",
  "What are signs of malnutrition in children?",
  "Recommend snacks high in protein for toddlers",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Nutri-Track AI Assistant. I can help with nutrition advice, meal planning, growth assessment, and health recommendations for children. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulated AI response (replace with real AI integration later)
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: "That's a great question! Based on nutritional guidelines for Filipino children, I'd recommend focusing on locally available nutrient-dense foods like malunggay, sweet potatoes, eggs, and fish. Would you like me to create a specific meal plan?",
      };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responses.default },
      ]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div>
      <div className="section-enter">
        <h1 className="text-2xl font-bold">AI Nutrition Assistant</h1>
        <p className="text-muted-foreground mt-1">Get personalized nutrition advice and meal recommendations</p>
      </div>

      <div className="mt-6 stat-card section-enter stagger-1 flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-sage flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-sage-deep" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" style={{ animation: "pulse-gentle 1.2s infinite" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" style={{ animation: "pulse-gentle 1.2s infinite 0.2s" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" style={{ animation: "pulse-gentle 1.2s infinite 0.4s" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pb-4">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-sage text-sage-deep hover:bg-sage/70 transition-colors active:scale-[0.97]"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask about nutrition, meals, or child health..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
