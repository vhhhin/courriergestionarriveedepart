import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "./logo.png";
import { X } from "lucide-react";

// Mot de passe : Courriel@2025!
const SUGGESTED_PASSWORD = "Courriel@2025!";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [language] = useState<"fr" | "ar">("fr");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowError(false);
    setShowSuccess(false);

    if (password.trim() !== SUGGESTED_PASSWORD) {
      setError("Erreur : Mot de passe incorrect");
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 5000);
      return;
    }

    try {
      setIsConnecting(true);
      await login(fullName, password);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError("Erreur : Mot de passe incorrect");
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 5000);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 flex items-center justify-center">
              <img
                className="h-full w-full object-contain"
                src={logo}
                alt="Logo"
              />
            </div>
            <h1 className="mt-2 text-lg font-bold text-gray-900 text-center">
              {language === "ar"
                ? "المجلس الإقليمي الصخيرات-تمارة"
                : "Conseil Préfectoral de Skhirat-Témara"}
            </h1>
            <h2 className="text-xs text-gray-600 text-center">
              {language === "ar"
                ? "نظام إدارة المراسلات - مكتب الضبط"
                : "Gestion des Courriers - Bureau d'Ordre"}
            </h2>
          </div>
        </div>
      </header>

      {/* Notification d'erreur */}
      {showError && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setShowError(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Notification de succès */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]">
            <span>Connexion réussie</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200">
          <div>
            <h2 className="text-center text-2xl font-extrabold text-gray-900">
              {language === "ar" ? "تسجيل الدخول" : "Connexion"}
            </h2>
            <p className="mt-1 text-center text-xs text-gray-600">
              {language === "ar"
                ? "الرجاء إدخال بيانات الاعتماد الخاصة بك"
                : "Veuillez entrer vos identifiants"}
            </p>
          </div>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  {language === "ar" ? "الاسم الكامل" : "Nom complet"}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder={
                    language === "ar" ? "الاسم الكامل" : "Nom complet"
                  }
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  {language === "ar" ? "كلمة المرور" : "Mot de passe"}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder={
                    language === "ar" ? "كلمة المرور" : "Mot de passe"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                disabled={isConnecting}
              >
                {isConnecting ? "Connexion en cours..." : (language === "ar" ? "تسجيل الدخول" : "Se connecter")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer with Copyright */}
      <footer className="bg-white/80 backdrop-blur-sm py-2 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()}{" "}
            {language === "ar"
              ? "المجلس الإقليمي الصخيرات-تمارة. جميع الحقوق محفوظة."
              : "Le Conseil Préfectoral de Skhirat-Témara Système de Gestion des Courriers"}
          </p>
        </div>
      </footer>
    </div>
  );
};
