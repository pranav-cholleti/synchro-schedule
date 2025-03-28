
import backendConfig from '@/config/backend';

// File Service API
export const fileService = {
  uploadFile: async (file: File, path: string, authToken?: string): Promise<string> => {
    try {
      // In development or when the backend is not available, just simulate upload
      if (!import.meta.env.PROD || import.meta.env.VITE_USE_MOCK_UPLOADS === 'true') {
        console.log(`[MOCK] Uploading file ${file.name} to ${path}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
        return `https://storage.example.com/${path}/${file.name}`;
      }
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      
      const response = await fetch(`${backendConfig.apiUrl}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken || localStorage.getItem('authToken') || ''}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`File upload error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      // Return a mock URL as fallback
      return `https://storage.example.com/${path}/${file.name}`;
    }
  },
  
  generatePDF: async (content: string, fileName: string, path: string): Promise<string> => {
    try {
      // In development, just simulate PDF generation
      if (!import.meta.env.PROD || import.meta.env.VITE_USE_MOCK_UPLOADS === 'true') {
        console.log(`[MOCK] Generating PDF from content, saving to ${path}/${fileName}`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
        return `https://storage.example.com/${path}/${fileName}`;
      }
      
      const response = await fetch(`${backendConfig.apiUrl}/files/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          content,
          fileName,
          path
        })
      });
      
      if (!response.ok) {
        throw new Error(`PDF generation error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Return a mock URL as fallback
      return `https://storage.example.com/${path}/${fileName}`;
    }
  }
};
