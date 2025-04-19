import type { CourierType, CourierStatus, CourierPriority } from '../types/courier';
import { API_CONFIG } from '../config/api';

export interface Decision {
  id: string;
  type: CourierType;
  number: string;
  date: Date;
  subject: string;
  reference: string;
  description: string;
  status: CourierStatus;
  priority: CourierPriority;
  observation?: string;
  attachments?: {
    name: string;
    driveUrl: string;
  }[];
  qrCode: string;
  history: {
    date: Date;
    action: string;
    user: string;
  }[];
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

const decisionService = {
  getAll: async (): Promise<Decision[]> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DECISIONS.LIST}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des décisions');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des décisions:', error);
      return [];
    }
  },

  getNextNumber: async (): Promise<string> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DECISIONS.LIST}/next-number`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du prochain numéro');
      }
      const data = await response.json();
      return data.nextNumber;
    } catch (error) {
      console.error('Erreur lors de la récupération du prochain numéro:', error);
      return '1';
    }
  },

  create: async (decision: Omit<Decision, 'id'>): Promise<Decision> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DECISIONS.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(decision),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la décision');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la décision:', error);
      throw error;
    }
  },

  update: async (id: string, decision: Partial<Decision>): Promise<Decision> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DECISIONS.UPDATE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(decision),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la décision');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la décision:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DECISIONS.DELETE}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la décision');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la décision:', error);
      throw error;
    }
  },

  search: async (criteria: Record<string, string>): Promise<Decision[]> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DECISIONS.SEARCH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche des décisions');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la recherche des décisions:', error);
      return [];
    }
  }
};

export default decisionService;
