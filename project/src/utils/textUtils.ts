export const decodeArabicText = (text: string | undefined): string => {
  if (!text) return "";
  try {
    // Si le texte est déjà en UTF-8, le retourner tel quel
    if (/[\u0600-\u06FF]/.test(text)) {
      return text;
    }
    // Sinon, essayer de le décoder
    return decodeURIComponent(escape(text));
  } catch (error) {
    console.error("Erreur lors du décodage du texte arabe:", error);
    return text;
  }
};

export const encodeArabicText = (text: string): string => {
  try {
    return unescape(encodeURIComponent(text));
  } catch (error) {
    console.error("Erreur lors de l'encodage du texte arabe:", error);
    return text;
  }
}; 