import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage, LoginPage, ChannelPage, PageNotFound } from "../pages";
import { useAuth } from "../context/AuthContext";

export const AllRoutes = () => {
  const { isLoggedIn } = useAuth();
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route path="login" element={<LoginPage />} />
        <Route path={`channel`} element={<Navigate to="/" replace />} />
        <Route
          path={`channel/:id`}
          element={isLoggedIn ? <ChannelPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};
