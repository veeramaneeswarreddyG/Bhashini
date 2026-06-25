import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : '/_/backend');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const translationApi = {
  /**
   * Translate text using backend API
   * @param {string} text 
   * @param {string} source - language code or 'auto'
   * @param {string} target - language code
   * @returns {Promise<{translatedText: string, detectedLanguage: string, provider: string}>}
   */
  translate: async (text, source = 'auto', target) => {
    try {
      const response = await api.post('/translate', { text, source, target });
      return response.data;
    } catch (error) {
      console.error('Translation service error:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Could not connect to translation server. Make sure the backend API is running.'
      );
    }
  },

  /**
   * Export translation to PDF
   * @param {string} text 
   * @param {string} translatedText 
   * @param {string} source 
   * @param {string} target 
   * @param {string} timestamp 
   */
  exportPdf: async (text, translatedText, source, target, timestamp = '') => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export-pdf`,
        { text, translatedText, source, target, timestamp },
        { responseType: 'blob' }
      );
      
      // Create a blob URL and trigger browser download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `bhashini_translation_${timestamp || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
      return true;
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error(
        'Failed to export translation PDF. Please try again.'
      );
    }
  },
};
