import ForgotPassword from "../pages/Login/ForgotPassword";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import RegisterVerify from "../pages/Register/RegisterVerify";
import { useAppSelector } from "../redux/hook";
import { RootState } from "../redux/store";
import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const token = useAppSelector(
    (state: RootState) => state.auth?.userInfo?.token
  );
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token]);
  return (
    <div>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/register-verify" element={<RegisterVerify />} />
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  );
}

export default LandingPage;
