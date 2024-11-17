import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  // useNavigate
} from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/DashBoard";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import ChatPage from "./pages/Chat";
import BillingAccount from "./pages/BillingAccount";
import PaymentSuccess from "./pages/payment/Success";
import PaymentFailure from "./pages/payment/Failed";
// import { useState , useEffect} from "react";
// import axios from "axios"
// import BackendErrorPage from "./BackendErrorPage";

function App() {

  // const [error, setError] = useState(false);
  //  const navigate = useNavigate(); // Initialize the useNavigate hook


  //   const pingBackend = () => {
  //   // Simulate retry logic here
  //   axios
  //     .get("http://localhost:8000/api/v1/ping")
  //     .then((response) => {
  //       if (response.status === 200) {
  //         setError(false);
  //         console.log("Backend is up and running");
  //       }
  //       else {
  //         setError(true);
  //         console.log("Backend is down");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("error occurred while pinging the backend, maybe the backend is down", error);
  //       setError(true);
  //     });
  // };

  //  useEffect(() => {

  //   pingBackend() ;

  //   if (error) {
  //     navigate("/loading/failed"); // Navigate to the error page when error is true
  //   }
  // }, [error, navigate]); // Dependency array ensures it triggers when `error` changes

 
  return (
    <>
     <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<LoginPage />} path="/login"></Route>
        <Route element={<RegisterPage />} path="/register"></Route>
        <Route element={<DashboardPage />} path="/dashboard"></Route>
        <Route element={<ProfilePage />} path="/profile"></Route>
        <Route element={<SettingsPage />} path="/settings"></Route>
        <Route element={<ChatPage />} path="/chat"></Route>
        <Route element={<BillingAccount/>} path="/billingAccount"></Route>
        <Route element={<PaymentSuccess/>} path="/payment/success"></Route>
        <Route element={<PaymentFailure/>} path="/payment/failed"></Route>
        {/* <Route element={<BackendErrorPage pingBackend={pingBackend} />} path="/loading/failed"></Route> */}
      </Routes>
    </Router>
    </>
  )
}

export default App
