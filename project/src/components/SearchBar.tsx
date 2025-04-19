import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Search } from 'lucide-react';

export type DocumentType = 'incoming' | 'outgoing' | 'decision';

const searchFields: Record<DocumentType, string[]> = {
  incoming: ['numéro', 'date', 'expéditeur', 'destinataire', 'objet'],
  outgoing: ['numéro', 'date', 'expéditeur', 'destinataire', 'objet', 'référence'],
  decision: ['numéro', 'date', 'objet'],
};

interface SearchBarProps {
  onSearch: (type: DocumentType, searchData: Record<string, string>) => void;
  language: 'fr' | 'ar';
  activeType: DocumentType;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, language, activeType }) => {
  const [type, setType] = useState<DocumentType>(activeType);
  const [searchData, setSearchData] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('SearchBar handleSearch called with:', { type, searchData });
    if (Object.values(searchData).every(value => !value)) {
      setError(language === 'ar' ? 'يرجى إدخال معايير البحث' : 'Veuillez entrer des critères de recherche');
      return;
    }
    setError('');
    onSearch(type, searchData);
  };

  const getPlaceholder = (field: string) => {
    const translations = {
      'numéro': language === 'ar' ? 'رقم الوثيقة' : 'Numéro',
      'date': language === 'ar' ? 'التاريخ' : 'Date',
      'expéditeur': language === 'ar' ? 'المرسل' : 'Expéditeur',
      'destinataire': language === 'ar' ? 'المرسل إليه' : 'Destinataire',
      'objet': language === 'ar' ? 'الموضوع' : 'Objet',
      'référence': language === 'ar' ? 'المرجع' : 'Référence'
    };
    return translations[field as keyof typeof translations] || field;
  };

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-2">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as DocumentType);
            setSearchData({});
          }}
          className="w-full md:w-32 p-1.5 border rounded-md text-sm h-9 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="incoming">{language === 'ar' ? 'وارد' : 'Courrier arrivée'}</option>
          <option value="outgoing">{language === 'ar' ? 'صادر' : 'Courrier départ'}</option>
          <option value="decision">{language === 'ar' ? 'قرار' : 'Décision'}</option>
        </select>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {searchFields[type].map((field) => (
            <input
              key={field}
              type={field === 'date' ? 'date' : 'text'}
              name={field}
              placeholder={getPlaceholder(field)}
              value={searchData[field] || ''}
              onChange={handleChange}
              className="w-full p-1.5 border rounded-md text-sm h-9 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          ))}
        </div>

        <button
          type="submit"
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center justify-center gap-1 h-9"
        >
          <Search size={14} />
          {language === 'ar' ? 'بحث' : 'Rechercher'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-xs mt-1">
          {error}
        </div>
      )}
    </form>
  );
};