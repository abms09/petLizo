import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import SellerNavbar from "./SellerNavbar";

export default function SellerLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block w-64">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold">🐾 Seller</h2>
          <Sidebar mobile />
        </div>

        <div className="hidden md:block">
          <SellerNavbar />
        </div>

        <main className="p-4 md:p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
