import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { NewCourierDialog } from "./NewCourierDialog";
import { SearchBar } from "./SearchBar";
import { MailManagement } from "./MailManagement";
import { Mail, FileText, LogOut, Menu, X } from "lucide-react";
import type { CourierType } from "../types/courier";
import type { DocumentType } from "./SearchBar";
import toast from "react-hot-toast";
import logo from "./logo.png";
import { authService } from "../services/authService";
import { IncomingMail } from "./IncomingMail";
import { OutgoingMail } from "./OutgoingMail";
import { DecisionList } from "./DecisionList";
import { NewDecisionDialog } from "./NewDecisionDialog";
import { useAuth } from "../hooks/useAuth";
import { API_CONFIG } from "../config/api";
import jsPDF from "jspdf";
import amiriFont from "../fonts/Amiri-Regular-normal.js"; // Assurez-vous que ce fichier existe

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isNewCourierDialogOpen, setIsNewCourierDialogOpen] = useState(false);
  const [isMailManagementOpen, setIsMailManagementOpen] = useState(false);
  const [isDecisionListOpen, setIsDecisionListOpen] = useState(false);
  const [isNewDecisionDialogOpen, setIsNewDecisionDialogOpen] = useState(false);
  const [newCourierType, setNewCourierType] = useState<CourierType>("incoming");
  const [language, setLanguage] = useState<"fr" | "ar">("fr");
  const [theme] = useState<"light" | "dark">("light");
  const [activeLink, setActiveLink] = useState("dashboard");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<DocumentType>("incoming");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      console.error("Utilisateur non authentifié. Redirection vers /login.");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleNewCourier = useCallback((type: CourierType) => {
    setNewCourierType(type);
    setIsNewCourierDialogOpen(true);
  }, []);

  const handleCourierAdded = useCallback(() => {
    toast.success("Courrier ajouté avec succès");
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const handleLanguageChange = useCallback(() => {
    setLanguage((prev) => (prev === "fr" ? "ar" : "fr"));
  }, []);

  const handleNewDecision = useCallback(() => {
    setIsNewDecisionDialogOpen(true);
  }, []);

  const navigationItems = useMemo(
    () => [
      {
        key: "dashboard",
        label: "Tableau de Bord",
        icon: <FileText size={20} />,
      },
      { key: "incoming", label: "Courriers Arrivés", icon: <Mail size={20} /> },
      { key: "outgoing", label: "Courriers Départ", icon: <Mail size={20} /> },
      { key: "decisions", label: "Décisions", icon: <FileText size={20} /> },
    ],
    []
  );

  const handleNavigation = useCallback((key: string) => {
    console.log("Navigation key clicked:", key);
    setActiveLink(key);
    setIsMobileMenuOpen(false);
  
    switch (key) {
      case "incoming":
        setActiveType("incoming");
        setIsMailManagementOpen(true);
        break;
      case "outgoing":
        setActiveType("outgoing");
        setIsMailManagementOpen(true);
        break;
      case "decisions":
        console.log("Opening DecisionList");
        setActiveType("decision");
        setIsDecisionListOpen(true);
        break;
      default:
        break;
    }
  }, []);

  const handleSearch = async (params: any) => {
    try {
      console.log('Search params:', params);
      
      // Vérification de la santé de l'API avec gestion d'erreur améliorée
      try {
        const healthCheck = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`);
        if (!healthCheck.ok) {
          throw new Error('API is not available');
        }
      } catch (error) {
        console.error('Erreur de connexion à l\'API:', error);
        toast.error(
          language === 'ar'
            ? 'تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم.'
            : 'Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d\'exécution.'
        );
        return;
      }
      
      let endpoint = '';
      switch (params.type) {
        case 'incoming':
          endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COURIERS.INCOMING}`;
          break;
        case 'outgoing':
          endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COURIERS.OUTGOING}`;
          break;
        case 'decision':
          endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DECISIONS.SEARCH}`;
          break;
        default:
          throw new Error('Invalid search type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Search request failed');
      }

      const data = await response.json();
      console.log('Search results:', data);

      // Formater les résultats selon le type
      const formattedResults = data.map((result: any) => {
        if (params.type === 'incoming') {
          return {
            type: 'incoming',
            number: result.numero_bo,
            date: result.date_arrivee_bo,
            sender: result.expediteur,
            subject: result.objet,
            recipient: result.destinataire,
            nature: result.nature_courrier,
            orientation: result.orientation,
            reference: result.reference,
            referenceNumber: result.numero_reference,
            referenceDate: result.date_reference
          };
        } else if (params.type === 'outgoing') {
          return {
            type: 'outgoing',
            number: result.numero,
            date: result.date,
            sender: result.expediteur,
            recipient: result.destinataire,
            subject: result.objet
          };
        } else {
          return {
            type: 'decision',
            number: result.numero,
            date: result.date,
            subject: result.objet,
            observation: result.observation
          };
        }
      });

      console.log('Formatted results:', formattedResults);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Erreur détaillée lors de la recherche:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.'
          : 'Une erreur est survenue lors de la recherche. Veuillez réessayer.'
      );
    }
  };

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF();
  
    // Ajouter la police personnalisée pour le support des caractères arabes
    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri", "normal");
  
    // Exemple de texte en arabe ou en français
    const title = language === "ar" ? "تقرير PDF" : "PDF Report";
    doc.text(title, 10, 10, { align: "right" });
  
    // Ajouter les résultats de recherche
    searchResults.forEach((result, index) => {
      const text = language === "ar"
        ? `${index + 1}. ${result.subject || ""}`
        : `${index + 1}. ${result.subject || ""}`;
      doc.text(text, 10, 20 + index * 10, { align: "right" });
    });
  
    // Sauvegarder le fichier PDF
    doc.save(language === "ar" ? "تقرير.pdf" : "report.pdf");
  }, [searchResults, language]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation latérale */}
      <nav className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 z-40`}>
        <div className="p-6">
          <img src={logo} alt="Logo" className="h-20 w-auto mx-auto" />
          <h1 className="text-xl font-bold text-center mt-4 text-gray-900 dark:text-white">
            {language === "ar" ? "مكتب الضبط" : "Bureau d'Ordre"}
          </h1>
        </div>

        <div className="mt-6">
          {navigationItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleNavigation(key)}
              className={`w-full flex items-center px-6 py-3 text-sm font-medium ${
                activeLink === key
                  ? "text-blue-600 bg-blue-50 dark:text-blue-500 dark:bg-blue-900/20"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-500 dark:hover:bg-blue-900/20"
              }`}
            >
              {icon}
              <span className="ml-4">{label}</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20"
          >
            <LogOut size={20} />
            <span className="ml-4">
              {language === "ar" ? "تسجيل الخروج" : "Déconnexion"}
            </span>
          </button>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="lg:ml-64">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-6">
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white w-full">
                {language === "ar"
                  ? "مجلس عمالة الصخيرات-تمارة - مكتب الضبط"
                  : "Le Conseil Préfectoral de Skhirat-Témara"}
              </h1>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium tracking-wide">
                {language === "ar" ? (
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    نظام إدارة المراسلات
                  </span>
                ) : (
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Système de Gestion des Courriers
                  </span>
                )}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleLanguageChange}
                className="px-3 lg:px-4 py-1 lg:py-2 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors duration-200 text-sm lg:text-base"
              >
                {language === "ar" ? "Français" : "العربية"}
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 lg:px-8 py-4 lg:py-8 pb-16">
          <div className="space-y-4 lg:space-y-6">
            <SearchBar
              onSearch={handleSearch}
              language={language}
              activeType={activeType}
            />

            {/* Display search results */}
            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <ul className="space-y-4">
                  {searchResults.map((result, index) => (
                    <li key={index} className="border-b py-2">
                      {result.type === 'incoming' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <p>
                            <strong>{language === 'ar' ? 'رقم البريد الوارد:' : 'N° BO:'}</strong> {result.number}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'تاريخ البريد الوارد:' : 'Date arrivée BO:'}</strong> {result.date}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'المرسل:' : 'Expéditeur:'}</strong> {result.sender}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'الموضوع:' : 'Objet:'}</strong> {result.subject}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'المستلم:' : 'Destinataire:'}</strong> {result.recipient}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'طبيعة المراسلة:' : 'Nature du courrier:'}</strong> {result.nature}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'التوجيه:' : 'Orientation:'}</strong> {result.orientation}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'المرجع:' : 'Référence:'}</strong> {result.reference}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'رقم المرجع:' : 'Numéro de référence:'}</strong> {result.referenceNumber}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'تاريخ المرجع:' : 'Date de référence:'}</strong> {result.referenceDate}
                          </p>
                        </div>
                      )}
                      {result.type === 'outgoing' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <p>
                            <strong>{language === 'ar' ? 'الرقم:' : 'Numéro:'}</strong> {result.number}
                          </p>
                          <p>
                            <strong>{language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {result.date}
                      </p>
                      <p>
                            <strong>{language === 'ar' ? 'المرسل:' : 'Expéditeur:'}</strong> {result.sender}
                      </p>
                      <p>
                            <strong>{language === 'ar' ? 'المستلم:' : 'Destinataire:'}</strong> {result.recipient}
                      </p>
                      <p>
                            <strong>{language === 'ar' ? 'الموضوع:' : 'Objet:'}</strong> {result.subject}
                          </p>
                        </div>
                      )}
                      {result.type === 'decision' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <p>
                            <strong>{language === 'ar' ? 'الرقم:' : 'Numéro:'}</strong> {result.number}
                      </p>
                      <p>
                            <strong>{language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {result.date}
                      </p>
                      <p>
                            <strong>{language === 'ar' ? 'الموضوع:' : 'Objet:'}</strong> {result.subject}
                      </p>
                      <p>
                            <strong>{language === 'ar' ? 'ملاحظة:' : 'Observation:'}</strong> {result.observation}
                      </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Dashboard
              onNewIncoming={() => handleNewCourier("incoming")}
              onNewOutgoing={() => handleNewCourier("outgoing")}
              onNewDecision={handleNewDecision}
              language={language}
            />
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <NewCourierDialog
        isOpen={isNewCourierDialogOpen}
        onClose={() => setIsNewCourierDialogOpen(false)}
        type={newCourierType}
        onSuccess={handleCourierAdded}
        language={language}
      />

      <IncomingMail
        isOpen={isMailManagementOpen && activeType === "incoming"}
        onClose={() => setIsMailManagementOpen(false)}
        language={language}
      />

      <OutgoingMail
        isOpen={isMailManagementOpen && activeType === "outgoing"}
        onClose={() => setIsMailManagementOpen(false)}
        language={language}
      />

      <DecisionList
        isOpen={isDecisionListOpen}
        onClose={() => setIsDecisionListOpen(false)}
        language={language}
      />

      <NewDecisionDialog
        isOpen={isNewDecisionDialogOpen}
        onClose={() => setIsNewDecisionDialogOpen(false)}
        language={language}
      />

      {/* Footer with Copyright */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 py-2 border-t border-gray-200 z-30">
        <div className="container mx-auto px-4 lg:px-8">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()}{" "}
            {language === "ar"
              ? "المجلس الإقليمي الصخيرات-تمارة. جميع الحقوق محفوظة."
              : "Le Conseil Préfectoral de Skhirat-Témara. Tous droits réservés."}
          </p>
        </div>
      </footer>
    </div>
  );
};
