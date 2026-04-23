import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow pt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
