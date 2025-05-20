import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// How long to wait before trying again if all users are busy
const RETRY_DELAY_MS = 5000;
// Maximum time to wait for a user to become available
const MAX_WAIT_TIME_MS = 300000; // 5 minutes

interface UserCredential {
  companyId: string;
  userId: string;
  password: string;
}

interface UserSession {
  credential: UserCredential;
  inUse: boolean;
  workerId: string | null;
  lastUsed: Date;
}

class UserSessionManager {
  private sessions: UserSession[] = [];
  private adminCredential: UserCredential | null = null;
  private readonly sleep = promisify(setTimeout);
  private configDir: string;
  private useAdminMode: boolean = false;

  constructor() {
    this.configDir = path.join(process.cwd(), 'config');
    this.initializeSessions();
  }

  setAdminMode(enabled: boolean): void {
    this.useAdminMode = enabled;
    console.log(`Admin mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  private initializeSessions() {
    const runnerLabel = process.env.RUNNER_LABEL || 'default';
    console.log(`Initializing user sessions for runner: ${runnerLabel}`);

    try {
      // Load admin user credentials
      const adminFilePath = path.join(this.configDir, 'login-admin.json');
      if (fs.existsSync(adminFilePath)) {
        const content = fs.readFileSync(adminFilePath, 'utf8');
        const cleanContent = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
        this.adminCredential = JSON.parse(cleanContent) as UserCredential;
        console.log(`Admin user credentials loaded for ${this.adminCredential.userId}`);
      } else {
        console.warn('Admin user credentials not found');
      }

      // Load general user credentials
      const userFiles = fs.readdirSync(this.configDir)
        .filter(file => file.startsWith('login-user') && file.endsWith('.json'));

      if (userFiles.length === 0) {
        console.warn('No general user credential files found');
      } else {
        // Create sessions from user files
        for (const file of userFiles) {
          const filePath = path.join(this.configDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const cleanContent = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
          const credential = JSON.parse(cleanContent) as UserCredential;

          this.sessions.push({
            credential,
            inUse: false,
            workerId: null,
            lastUsed: new Date(0)
          });
          
          console.log(`Added general user session for ${credential.userId}`);
        }
      }
    } catch (error) {
      console.error('Error initializing user sessions:', error);
      throw error;
    }
  }

  async acquireUser(workerId: string): Promise<UserCredential> {
    // If admin mode is enabled, always return admin credentials
    if (this.useAdminMode) {
      if (!this.adminCredential) {
        throw new Error('Admin credentials not found but admin mode is enabled');
      }
      console.log(`Worker ${workerId} using admin user: ${this.adminCredential.userId}`);
      return this.adminCredential;
    }
    
    // Otherwise, use the regular user session management logic
    const startTime = Date.now();
    
    while (true) {
      // First try to get a session the worker already has
      const existingSession = this.sessions.find(session => session.workerId === workerId);
      if (existingSession) {
        console.log(`Worker ${workerId} reusing existing session with user ${existingSession.credential.userId}`);
        return existingSession.credential;
      }
      
      // Then try to find an unused session
      const availableSession = this.sessions.find(session => !session.inUse);
      if (availableSession) {
        availableSession.inUse = true;
        availableSession.workerId = workerId;
        availableSession.lastUsed = new Date();
        console.log(`Worker ${workerId} acquired session with user ${availableSession.credential.userId}`);
        return availableSession.credential;
      }
      
      // If we've waited too long, throw an error
      if (Date.now() - startTime > MAX_WAIT_TIME_MS) {
        throw new Error(`Timed out waiting for an available user session after ${MAX_WAIT_TIME_MS}ms`);
      }
      
      // Wait and try again
      console.log(`All users are busy. Worker ${workerId} waiting ${RETRY_DELAY_MS}ms for an available session...`);
      await this.sleep(RETRY_DELAY_MS);
      
      // Check for abandoned sessions (older than 10 minutes)
      const now = new Date();
      for (const session of this.sessions) {
        if (session.inUse && now.getTime() - session.lastUsed.getTime() > 600000) {
          console.log(`Found abandoned session for user ${session.credential.userId}. Resetting.`);
          session.inUse = false;
          session.workerId = null;
        }
      }
    }
  }

  releaseUser(workerId: string): void {
    // Skip in admin mode
    if (this.useAdminMode) {
      return;
    }
    
    const session = this.sessions.find(s => s.workerId === workerId);
    if (session) {
      session.inUse = false;
      session.lastUsed = new Date();
      console.log(`Worker ${workerId} released session with user ${session.credential.userId}`);
    }
  }
}

// Singleton instance
export const userSessionManager = new UserSessionManager();