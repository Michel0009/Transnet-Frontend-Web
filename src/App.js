import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./Context/AuthContext";

import LoadingScreen from "./Components/LoadingScreen";
import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";
import TopLoader from "./Components/TopLoader";

const Login = lazy(() => import("./Pages/Auth/Login"));
const EmailVerification = lazy(() => import("./Pages/Auth/EmailVerification"));
const EmailSending = lazy(() => import("./Pages/Auth/EmailSending"));
const NotFound = lazy(() => import("./Components/NotFound"));
const ResetPassword = lazy(() => import("./Pages/Auth/ResetPassword"));
const SubAdminsPage = lazy(() => import("./Pages/SubAdmins/SubAdminsPage"));
const VehicleTypeDetails = lazy(
  () => import("./Pages/Vehicles/VehicleTypeDetails"),
);
const PricingSettings = lazy(() => import("./Pages/Pricing/PricingSettings"));
const ContractTerms = lazy(() => import("./Pages/Contracts/ContractTerms"));
const DashboardLayout = lazy(() => import("./Layouts/DashboardLayout"));
const Drivers = lazy(() => import("./Pages/Drivers/Drivers"));
const CreateDriver = lazy(() => import("./Pages/Drivers/CreateDriver"));
const DriverDetails = lazy(() => import("./Pages/Drivers/DriverDetails"));
const UpdateDriver = lazy(() => import("./Pages/Drivers/UpdateDriver"));
const Clients = lazy(() => import("./Pages/Clients/Clients"));
const ClientDetails = lazy(() => import("./Pages/Clients/ClientDetails"));
const BlockedUsers = lazy(() => import("./Pages/General/BlockedUsers"));
const Shipments = lazy(() => import("./Pages/Shipments/Shipments"));
const ShipmentDetails = lazy(() => import("./Pages/Shipments/ShipmentDetails"));
const TrackingMap = lazy(() => import("./Pages/Tracking/TrackingMap"));
const StatisticsPage = lazy(() => import("./Pages/Statistics/StatisticsPage"));
const BadgesPage = lazy(() => import("./Pages/Badges/BadgesPage"));
const ReportsPage = lazy(() => import("./Pages/Reports/ReportsPage"));

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
          <Route
            element={<ProtectedRoute allowedRoles={["admin", "employee"]} />}
          >
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="drivers" element={<Drivers />} />
              <Route path="clients" element={<Clients />} />
              <Route path="shipments" element={<Shipments />} />
              <Route path="vehicles" element={<VehicleTypeDetails />} />
              <Route path="badges" element={<BadgesPage/>} />
              <Route path="reports" element={<ReportsPage/>} />
              <Route path="tracking" element={<TrackingMap />} />
              <Route
                path="tracking/:shipmentNumber"
                element={<TrackingMap />}
              />
              <Route index element={<Navigate to="tracking" replace />} />
            </Route>
            <Route path="drivers/create" element={<CreateDriver />} />
            <Route path="drivers/edit/:id" element={<UpdateDriver />} />
            <Route path="drivers/:id" element={<DriverDetails />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="shipments/:id" element={<ShipmentDetails />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="blocked-users" element={<BlockedUsers />} />
              <Route path="pricing" element={<PricingSettings />} />
              <Route path="subadmins" element={<SubAdminsPage />} />
              <Route path="contracts" element={<ContractTerms />} />
              <Route path="statistics" element={<StatisticsPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
