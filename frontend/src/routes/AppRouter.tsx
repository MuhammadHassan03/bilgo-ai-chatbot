import Footer from "@/components/reuseable/Fottor";
import Header from "@/components/reuseable/Header";
import Chat from "@/pages/Chat";
import Home from "@/pages/Home";
import { Route, Routes, useLocation } from "react-router-dom";

const AppRouter = () => {
  const location = useLocation();

  const hideFooterRoutes = ["/chat"];

  const shouldHide = hideFooterRoutes.includes(location.pathname);
  return (
    <div>
      {!shouldHide && <Header />}

      <main className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </main>

      {!shouldHide && <Footer />}

      {/* Toast Notifications */}
      {/* <Toaster position="bottom-center" richColors/> */}
    </div>
  );
};

export default AppRouter;
