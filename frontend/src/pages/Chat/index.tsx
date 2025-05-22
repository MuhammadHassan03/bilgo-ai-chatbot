import { useState, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Send, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Chat() {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi! Ask me anything about available properties." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSend = async (text: string) => {
    const userMsg = { type: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/chat", { message: text });
      const botReply = data.response;
      setMessages((prev) => [...prev, { type: "bot", text: botReply }]);

      // TTS
      const utterance = new SpeechSynthesisUtterance(botReply);
      utterance.lang = "en-US"; // Or 'ar-SA' if needed
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const file = new File([audioBlob], "user_audio.webm");

      const formData = new FormData();
      formData.append("audio", file);

      setLoading(true);

      try {
        const transcribeRes = await axios.post("/api/transcribe", formData);
        const userText = transcribeRes.data.text;
        setMessages((prev) => [...prev, { type: "user", text: userText }]);
        await handleSend(userText);
      } catch (err) {
        console.error("Voice transcription error:", err);
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Failed to transcribe voice input." },
        ]);
      } finally {
        setLoading(false);
      }
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 flex flex-col">
      <Card className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
        <CardContent className="flex flex-col space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre-line px-4 py-2 rounded-xl text-sm max-w-[80%]",
                msg.type === "user"
                  ? "bg-primary text-primary-foreground self-end"
                  : "bg-muted text-muted-foreground self-start"
              )}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="text-sm italic text-muted-foreground">
              Bot is typing...
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 mt-4 max-w-3xl mx-auto w-full">
        <Input
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          disabled={loading}
        />
        <Button onClick={() => handleSend(input)} disabled={loading || !input}>
          <Send className="w-4 h-4" />
        </Button>
        <Button
          variant={recording ? "destructive" : "outline"}
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
        >
          {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
