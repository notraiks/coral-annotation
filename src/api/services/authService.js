import { supabase } from '../supabaseClient.js';

export const authService = {
  /**
   * Login user with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password (plaintext)
   * @returns {Promise<Object>} User object
   */
  async login(username, password) {
    const { data, error } = await supabase.rpc('authenticate_user', {
      p_username: username,
      p_password: password
    });

    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Invalid username or password');
    }

    const user = data[0];
    
    // Store session with 24-hour expiry
    const session = {
      user: {
        id: user.user_id,
        username: user.username,
        name: user.full_name,
        role: user.role
      },
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    localStorage.setItem('annotatorSession', JSON.stringify(session));
    return session.user;
  },

  /**
   * Logout current user
   */
  logout() {
    localStorage.removeItem('annotatorSession');
  },

  /**
   * Get currently logged-in user
   * @returns {Object|null} User object or null if not authenticated
   */
  getCurrentUser() {
    const sessionStr = localStorage.getItem('annotatorSession');
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      
      // Check if session expired
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      return session.user;
    } catch (error) {
      console.error('Failed to parse session:', error);
      this.logout();
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }
};
