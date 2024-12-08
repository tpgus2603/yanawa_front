import React from "react";
import "./styles/globals.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ChattingListPage from "./pages/Chatting/ChattingListPage";
import ChattingDetailPage from "./pages/Chatting/ChattingDetailPage";
import MyPage from "./pages/Mypage";
import HeaderNav from "./components/layout/HeaderNav";
import Footer from "./components/layout/Footer";
import BodyLayout from "./components/layout/BodyLayout";
import HeaderLogoBar from "./components/layout/HeaderLogoBar";
import SchedulePage from "./pages/SchedulePage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <HeaderLogoBar />
        <HeaderNav />
        <BodyLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/timetable" element={<SchedulePage />} />
            <Route path="/chattinglist" element={<ChattingListPage />} />
            <Route
              path="/chat/chatRoom/:chatRoomId"
              element={<ChattingDetailPage />}
            />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BodyLayout>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
