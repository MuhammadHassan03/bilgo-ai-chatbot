import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mic, Languages, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden text-secondary bg-background dark:bg-background-dark">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-foreground">
          Bilgo Voice Chatbot
        </h1>
        <p className="text-lg md:text-xl mb-8 text-muted-foreground">
          Ask about properties using your voice. Supports English & Arabic.
          Real-time voice chat powered by AI.
        </p>
        <Button
          onClick={() => navigate("/chat")}
          size="lg"
          className="hover:scale-105 transition-transform"
        >
          🎤 Start Chatting
        </Button>
      </motion.div>

      {/* Features */}
      <div className="mt-16 grid gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-5xl z-10 ">
        <FeatureCard
          icon={<Mic className="w-8 h-8 text-primary" />}
          title="Voice Input"
          desc="Speak to the chatbot directly with high-quality transcription."
        />
        <FeatureCard
          icon={<Languages className="w-8 h-8 text-primary" />}
          title="Multi-Language"
          desc="Supports English and Arabic speech understanding."
        />
        <FeatureCard
          icon={<Sparkles className="w-8 h-8 text-primary" />}
          title="AI Powered"
          desc="Uses GPT + RAG to answer queries about properties."
        />
        <FeatureCard
          icon={<MessageCircle className="w-8 h-8 text-primary" />}
          title="Text-to-Speech"
          desc="The bot replies using a clear, natural voice."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="hover:shadow-lg hover:shadow-primary/40 hover:scale-105 transition-transform rounded-2xl"
    >
      <Card className="cursor-pointer">
        <CardHeader className="flex items-center space-x-4">
          <div className="text-primary">{icon}</div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {desc}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
