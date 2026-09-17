import { Routes, Route, Navigate } from "react-router-dom";
import { Guard } from "./Guard";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Search from "@/pages/Search";
import Find from "@/pages/Find";
import SpaceDetail from "@/pages/SpaceDetail";
import Compare from "@/pages/Compare";
import Saved from "@/pages/Saved";
import Portfolio from "@/pages/Portfolio";
import ListSpace from "@/pages/ListSpace";
import Requests from "@/pages/Requests";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      {/* Open to everyone */}
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/search" element={<Search />} />
      <Route path="/find" element={<Find />} />
      <Route path="/space/:id" element={<SpaceDetail />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/requests" element={<Requests />} />

      <Route path="/signin" element={<Auth initial="signin" />} />
      <Route path="/signup" element={<Auth initial="signup" />} />

      {/* Needs an account */}
      <Route
        path="/saved"
        element={
          <Guard allow={["renter", "owner", "admin"]}>
            <Saved />
          </Guard>
        }
      />
      <Route
        path="/account"
        element={
          <Guard allow={["renter", "owner", "admin"]}>
            <Profile />
          </Guard>
        }
      />

      {/* Owner only */}
      <Route
        path="/portfolio"
        element={
          <Guard allow={["owner", "admin"]}>
            <Portfolio />
          </Guard>
        }
      />
      <Route
        path="/list"
        element={
          <Guard allow={["owner", "admin"]}>
            <ListSpace />
          </Guard>
        }
      />

      {/* Legacy paths from earlier phases */}
      <Route path="/profile" element={<Navigate to="/account" replace />} />
      <Route path="/property/:id" element={<Navigate to="/portfolio" replace />} />
      <Route path="/intake" element={<Navigate to="/find" replace />} />
      <Route path="/list-property" element={<Navigate to="/list" replace />} />
      <Route path="/owner" element={<Navigate to="/portfolio" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
