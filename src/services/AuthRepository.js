/**
 * Birthday Studio - Auth Repository & Local Session Manager (Section 1, 2, 3)
 * Free IndexedDB User Records + Web Crypto Password Hashing + Session Persistence
 */

import { dbService } from './IndexedDBService.js';
import { User } from '../models/User.js';

const SESSION_KEY = 'birthday_studio_session_user_id';

class AuthRepository {
  /**
   * Web Crypto API Password Hashing (SHA-256)
   */
  async hashPassword(password) {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const encoder = new TextEncoder();
      const data = encoder.encode(`bs_salt_${password}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback hash implementation
    let hash = 0;
    const str = `bs_salt_${password}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `h_${Math.abs(hash)}`;
  }

  /**
   * Register a new user
   */
  async register(usernameInput, passwordInput, displayNameInput) {
    const username = (usernameInput || '').trim().toLowerCase();
    const displayName = (displayNameInput || '').trim() || username;
    const password = passwordInput || '';

    // Validation (Section 3)
    if (!username || username.length < 3 || username.length > 30) {
      throw new Error('Username must be between 3 and 30 characters.');
    }
    if (!/^[a-z0-9_-]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens.');
    }
    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    // Check duplicate username
    const existing = await dbService.getByIndex('users', 'username', username);
    if (existing && existing.length > 0) {
      throw new Error('This username is already taken. Please choose another.');
    }

    const passwordHash = await this.hashPassword(password);
    const user = new User({
      username,
      displayName,
      passwordHash
    });

    await dbService.put('users', user.toJSON());
    // Auto login after registration (Section 7)
    this.setSession(user.id);
    return user;
  }

  /**
   * Login user
   */
  async login(usernameInput, passwordInput) {
    const username = (usernameInput || '').trim().toLowerCase();
    const password = passwordInput || '';

    if (!username || !password) {
      throw new Error('Please enter both username and password.');
    }

    const matched = await dbService.getByIndex('users', 'username', username);
    if (!matched || matched.length === 0) {
      throw new Error('Invalid username or password.'); // Generic error (Section 8)
    }

    const userRecord = matched[0];
    const passwordHash = await this.hashPassword(password);

    if (userRecord.passwordHash !== passwordHash) {
      throw new Error('Invalid username or password.'); // Generic error (Section 8)
    }

    const user = new User(userRecord);
    this.setSession(user.id);
    return user;
  }

  /**
   * Logout user
   */
  logout() {
    sessionStorage.setItem('birthday_studio_logged_out', 'true');
    localStorage.removeItem(SESSION_KEY);
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    let userId = localStorage.getItem(SESSION_KEY);
    if (!userId) {
      if (sessionStorage.getItem('birthday_studio_logged_out') === 'true') {
        return null;
      }
      try {
        const users = await dbService.getAll('users');
        if (users && users.length > 0) {
          userId = users[0].id;
          this.setSession(userId);
          return new User(users[0]);
        } else {
          const defaultUser = new User({
            id: 'user_creator',
            username: 'creator',
            displayName: 'Creator',
            passwordHash: 'default_hash'
          });
          await dbService.put('users', defaultUser.toJSON());
          this.setSession(defaultUser.id);
          return defaultUser;
        }
      } catch (e) {
        return new User({ id: 'user_creator', username: 'creator', displayName: 'Creator' });
      }
    }
    const record = await dbService.get('users', userId);
    return record ? new User(record) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem(SESSION_KEY);
  }

  setSession(userId) {
    sessionStorage.removeItem('birthday_studio_logged_out');
    localStorage.setItem(SESSION_KEY, userId);
  }

  /**
   * Update Display Name (Section 13)
   */
  async updateProfile(displayNameInput) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No active user session');
    user.displayName = (displayNameInput || '').trim() || user.username;
    user.updatedAt = Date.now();
    await dbService.put('users', user.toJSON());
    return user;
  }
}

export const authRepository = new AuthRepository();
