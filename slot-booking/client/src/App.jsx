import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import BookingPage from "./pages/booking";
import OAuthSuccess from "./components/OAuth";
import myBookings from "./pages/myBookings";
import ProtectedRoute from "./components/protectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/myBookings"
          element={
            <ProtectedRoute>
              <myBookings />
            </ProtectedRoute>
          }
        />
        <Route path="/book/:meetingId" element={<BookingPage />} />
        <Route path="/oauth" element={<OAuthSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;