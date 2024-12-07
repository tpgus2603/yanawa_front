import React from "react";
import "./styles/globals.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import ChattingListPage from "./pages/Chatting/ChattingListPage";
import MyPage from "./pages/Mypage";
import HeaderNav from "./components/layout/HeaderNav";
import Footer from "./components/layout/Footer";
import BodyLayout from "./components/layout/BodyLayout";
import HeaderLogoBar from "./components/layout/HeaderLogoBar";
import SchedulePage from "./pages/SchedulePage";

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
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </BodyLayout>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
