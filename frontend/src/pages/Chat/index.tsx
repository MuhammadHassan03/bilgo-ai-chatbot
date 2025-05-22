import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Send, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import styles from "@/styles/Spinner.module.css";

export default function Chat() {
  const [messages, setMessages] = useState([
    { type: "bot", text: "مرحبًا! اسألني عن أي عقار متوفر." },
  ]);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState<"en" | "ar">("ar");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text: string) => {
    if (!text || !availableVoices.length) return;

    const voice =
      language === "ar"
        ? availableVoices.find(
            (v) => v.lang === "ar-SA" && v.name.includes("Google")
          ) || availableVoices.find((v) => v.lang.startsWith("ar"))
        : availableVoices.find(
            (v) => v.lang === "en-US" && v.name.includes("Google")
          ) || availableVoices.find((v) => v.lang === "en-US");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice || null;
    utterance.lang = voice?.lang || (language === "ar" ? "ar-SA" : "en-US");
    utterance.pitch = 1;
    utterance.rate = language === "ar" ? 0.92 : 0.96;
    utterance.volume = 1;

    speechSynthesis.cancel(); // Cancel any ongoing speech
    speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string, skipUserMessage = false) => {
    if (!skipUserMessage) {
      const userMsg = { type: "user", text };
      setMessages((prev) => [...prev, userMsg]);
    }
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/chat", {
        message: text,
        language,
      });
      const botReply = data.response;
      setMessages((prev) => [...prev, { type: "bot", text: botReply }]);
      speak(botReply);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "حدث خطأ ما. حاول مرة أخرى." },
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
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const file = new File([audioBlob], "user_audio.webm");

      const formData = new FormData();
      formData.append("audio", file);
      formData.append("language", language);
      setLoading(true);

      try {
        const transcribeRes = await axios.post("/api/transcribe", formData);
        const userText = transcribeRes.data.text;
        setMessages((prev) => [...prev, { type: "user", text: userText }]);
        await handleSend(userText, true);
      } catch (err) {
        console.error("Voice transcription error:", err);
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "فشل في تحويل الصوت إلى نص." },
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
    <div className="flex flex-col h-[100dvh] bg-background text-foreground">
      <div className="flex justify-between items-center p-4 md:p-6 max-w-3xl mx-auto w-full">
        <span className="text-sm text-muted-foreground">
          Current language: {language === "ar" ? "Arabic" : "English"}
        </span>
        <Button
          variant="default"
          onClick={() => setLanguage((prev) => (prev === "ar" ? "en" : "ar"))}
          className="hover:scale-105 transition-transform p-[10px]"
          size={"lg"}
        >
          Switch to {language === "ar" ? "English" : "Arabic"}
        </Button>
      </div>

      <Card className="flex-1 overflow-y-auto px-4 max-w-3xl mx-auto w-full space-y-4">
        <CardContent className="flex flex-col space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre-line rounded-xl text-sm max-w-[80%] p-[10px] m-[10px]",
                msg.type === "user"
                  ? "bg-primary text-primary-foreground self-end"
                  : "bg-muted text-muted-foreground self-start"
              )}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className={styles.spineer}>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-[10px] mt-[4px] max-w-3xl mx-auto w-full">
        <Input
          placeholder={
            language === "ar"
              ? "اسأل سؤالاً عن العقارات..."
              : "Ask a question about properties..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          disabled={loading}
          className="p-[10px]"
        />
        <Button
          onClick={() => handleSend(input)}
          disabled={loading || !input}
          className="p-[8px]"
        >
          <Send className="w-fit h-fit" />
        </Button>
        <Button
          variant={"outline"}
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          className="p-[8px]"
        >
          {recording ? (
            <Square className="w-fit h-fit" />
          ) : (
            <Mic className="w-fit h-fit" />
          )}
        </Button>
      </div>
    </div>
  );
}
