import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CloudIcon, RefreshCwIcon, LogOutIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardHeader = ({ onRefresh, isLoading, onHomeClick }) => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <img
              src="/image.png"
              alt="SIH"
              className="h-8 sm:h-10 w-auto object-contain"
            />
            <Button
              variant="ghost"
              onClick={onHomeClick}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 p-2"
              data-testid="home-btn"
            >
              <CloudIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-semibold text-sm sm:text-base hidden sm:inline">
                AQ Portal
              </span>
            </Button>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <h1 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100 font-['Space_Grotesk']">
              <span className="hidden md:inline">Air Quality Dashboard</span>
              <span className="md:hidden">AQ Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3">
            {currentUser && (
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden lg:block truncate max-w-[150px]">
                {currentUser.email}
              </span>
            )}

            <ThemeToggle />

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
              data-testid="refresh-btn"
            >
              <RefreshCwIcon
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 px-2 sm:px-3"
            >
              <LogOutIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs px-2 hidden sm:inline-flex"
            >
              Live
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
