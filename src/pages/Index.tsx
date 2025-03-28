
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-synchro-700 dark:text-synchro-400">SynchroSchedule</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
