import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./Context/AuthContext";

import LoadingScreen from "./Components/LoadingScreen";
import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";
import TopLoader from "./Components/TopLoader";
import DashboardLayout from "./Layouts/DashboardLayout";
import Drivers from "./Pages/Drivers/Drivers";
import VehicleTypeDetails from "./Pages/Vehicles/VehicleTypeDetails";
import PricingSettings from "./Pages/Pricing/PricingSettings";
import SubAdminsPage from "./Pages/SubAdmins/SubAdminsPage";

const Login = lazy(() => import("./Pages/Auth/Login"));
const EmailVerification = lazy(() => import("./Pages/Auth/EmailVerification"));
const EmailSending = lazy(() => import("./Pages/Auth/EmailSending"));
const NotFound = lazy(() => import("./Components/NotFound"));
const ResetPassword = lazy(() => import("./Pages/Auth/ResetPassword"));

function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Suspense fallback={<TopLoader />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/send-email" element={<EmailSending />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="drivers" element={<Drivers />} />
               <Route path="vehicles" element={<VehicleTypeDetails />} />
               <Route path="pricing" element={<PricingSettings />} />
               <Route path="subadmins" element={<SubAdminsPage />} />

              <Route index element={<Navigate to="drivers" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
