import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/DashBoard";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";

function App() {
 
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
      </Routes>
    </Router>
    </>
  )
}

export default App
