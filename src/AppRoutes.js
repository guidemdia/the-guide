import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EditionForm from "./backend/EditionForm";
import Separate from "./components/Separate";
import SearchPage from "./pages/SearchPage";
import AboutPage from "./pages/AboutPage";
import Login from "./components/Login";
import IndividualPage from "./pages/IndividualPage";
import EditionPage from "./pages/EditionPage";
import MySpaceIndividual from "./pages/MySpaceIndividual";
import MySpace from "./pages/MySpacePage";
import Editing from "./backend/Editing";
import AdminDashboard from "./backend/AdminDashboard";
import MySpacePanel from "./backend/MySpacePanel";
import ArticlesPanel from "./backend/ArticlesPanel";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Main Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />

      {/* Article Routes */}
      <Route path="/articlespanel" element={<ArticlesPanel />} />
      <Route path="/individual/:id" element={<IndividualPage />} />
      <Route path="/category/:type" element={<Separate />} />
      <Route path="/editing" element={<Editing />} />

      {/* MySpace Routes */}
      <Route path="/myspace" element={<MySpace />} />
      <Route path="/myspaceform" element={<MySpacePanel />} />
      <Route path="/myspace/:id" element={<MySpaceIndividual />} />

      {/* Edition Routes */}
      <Route path="/editions" element={<EditionPage />} />
      <Route path="/editionform" element={<EditionForm />} />

      {/* Admin Routes */}
      <Route path="/admindashboard" element={<AdminDashboard />} />

      {/* Additional Routes */}
      <Route path="/separate" element={<Separate />} />
    </Routes>
  );
}
