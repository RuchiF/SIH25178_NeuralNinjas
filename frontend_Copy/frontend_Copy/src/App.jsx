import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "@/App.css";

// Import pages
import { Homepage, Dashboard } from "./pages";

// Import authentication
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const API = `${BACKEND_URL}/api`;

function App() {
  const [apiStatus, setApiStatus] = useState(null);

  // Test API connection on app start
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get(`${API}/`);
        setApiStatus("connected");
        console.log("API Connected:", response.data);
      } catch (error) {
        setApiStatus("error");
        console.error("API Connection Error:", error);
      }
    };

    testConnection();
  }, []);

  return (
    <ThemeProvider>
      <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
