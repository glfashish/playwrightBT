import { setAdminMode } from './utils/loginAndNavigateHome';

async function globalSetup() {
  // Set mode based on environment variable
  const isAdminMode = process.env.USE_ADMIN_USER === 'true';
  setAdminMode(isAdminMode);
  
  console.log(`Test execution mode: ${isAdminMode ? 'ADMIN USER' : 'GENERAL USERS'}`);
}

export default globalSetup;