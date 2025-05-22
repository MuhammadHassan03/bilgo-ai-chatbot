import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import "./App.css";
import Chat from "./pages/Chat";
// import { Toaster } from "./components/ui/sonner";
// import NotFound from "@/pages/NotFound"; // optional for 404 page
// import Header from "@/components/layout/Header"; // optional

export default function App() {
  return (
    <Router>
      {/* Global Layout */}
      <div className="min-h-screen flex flex-col bg-[#0f0f1a] text-white">
        {/* <Header /> Optional top nav or language switch */}

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </main>

        {/* Toast Notifications */}
        {/* <Toaster position="bottom-center" richColors/> */}
      </div>
    </Router>
  );
}
