
import { BackendConfig } from '@/types';

// Default configuration for development
const defaultConfig: BackendConfig = {
  apiUrl: 'http://localhost:5000/api',
  aiServiceUrl: 'http://localhost:5001',
  emailServiceEnabled: false,
};

// Load configuration from environment variables if available
const getBackendConfig = (): BackendConfig => {
  return {
    apiUrl: import.meta.env.VITE_API_URL || defaultConfig.apiUrl,
    aiServiceUrl: import.meta.env.VITE_AI_SERVICE_URL || defaultConfig.aiServiceUrl,
    emailServiceEnabled: import.meta.env.VITE_EMAIL_SERVICE_ENABLED === 'true' || defaultConfig.emailServiceEnabled,
  };
};

export default getBackendConfig();
