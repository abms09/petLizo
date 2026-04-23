import {
  Navigate,
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Admin
import Layout from "../pages/admin/Layout";
import Users from "../pages/admin/Users";
import Sellers from "../pages/admin/Sellers";
import Pets from "../pages/admin/Pets";
import SoldPets from "../pages/admin/SoldPets";
import Feedbacks from "../pages/admin/Feedbacks";
import Complaints from "../pages/admin/Complaints";
import Dashboard from "../pages/admin/AdminDashboard";
import ContactMessages from "../pages/admin/ContactMessages";

// Auth
import Signup from "../components/Signup";
import Login from "../components/Login";
import VerifyOtp from "../components/verify-otp";
import ResetPassword from "../components/ResetPassword";

// Seller
import SellerDashboard from "../pages/seller/Dashboard";
import MyPets from "../pages/seller/Mypets";
import AddPet from "../pages/seller/AddPet";
import EditPet from "../pages/seller/EditPet";
import SellerLayout from "../pages/seller/Layout";
import SellerFeedback from "../pages/seller/SellerFeedback";
import SellerProfile from "../pages/seller/SellerProfile";
import SellerRequests from "../pages/seller/SellerRequests";

// User
import UserLayout from "../pages/user/UserLayout";
import Home from "../pages/user/Home";
import About from "../pages/user/About";
import Contact from "../pages/user/Contact";
import Orders from "../pages/user/Orders";
import Pet from "../pages/user/Pets";
import BecomeSeller from "../pages/user/BecomeSeller";
import PetDetails from "../pages/user/PetDetails";
import UserRequests from "../pages/user/Requests";
import UserProfile from "../pages/user/UserProfile";
import Chat from "../components/Chat";

function AppWrapper() {
  return (
    <BrowserRouter basename="/petLizo">
      <App />
    </BrowserRouter>
  );
}

function App() {
  const navigate = useNavigate();

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "logout") {
        localStorage.clear();
        navigate("/login");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [navigate]);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = getUser();
    const token = localStorage.getItem("token");

    if (!token || !user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.some((r) => user.roles?.includes(r))) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <>
      <Routes>
        {/* public */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/chat" element={<Chat />} />

        {/* admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="pets" element={<Pets />} />
          <Route path="sold" element={<SoldPets />} />
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="messages" element={<ContactMessages />} />
        </Route>

        {/* seller */}
        <Route
          path="/seller/*"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="mypets" element={<MyPets />} />
          <Route path="addpet" element={<AddPet />} />
          <Route path="sold" element={<SoldPets />} />
          <Route path="edit-pet" element={<EditPet />} />
          <Route path="sellerFeedback" element={<SellerFeedback />} />
          <Route path="profile" element={<SellerProfile />} />
          <Route path="requests" element={<SellerRequests />} />
        </Route>

        {/* user */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/pets" element={<Pet />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="/requests" element={<UserRequests />} />
          <Route path="/userProfile" element={<UserProfile />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={15000} />
    </>
  );
}

export default AppWrapper;
