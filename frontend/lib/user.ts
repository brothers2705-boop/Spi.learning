'use client';

export interface User {
  id: string;
  name: string;
  createdAt: string;
  lastActive: string;
}

const USERS_KEY = 'spi_users';
const CURRENT_USER_KEY = 'spi_current_user';

export const userStorage = {
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Update last active silently
        const users = userStorage.getUsers();
        const exists = users.find(u => u.id === parsed.id);
        if (exists) return parsed;
      }
      
      // Create default user if none
      const users = userStorage.getUsers();
      if (users.length > 0) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[0]));
        return users[0];
      }
      
      // Create first user
      const newUser: User = {
        id: 'user_' + Date.now(),
        name: 'Student',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      userStorage.saveUsers([newUser]);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      return newUser;
    } catch { return null; }
  },

  setCurrentUser: (user: User) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...user, lastActive: new Date().toISOString() }));
    // Update last active in list
    const users = userStorage.getUsers();
    const updated = users.map(u => u.id === user.id ? { ...u, lastActive: new Date().toISOString() } : u);
    userStorage.saveUsers(updated);
  },

  createUser: (name: string): User => {
    const newUser: User = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: name.trim() || 'Student',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    const users = userStorage.getUsers();
    users.push(newUser);
    userStorage.saveUsers(users);
    userStorage.setCurrentUser(newUser);
    return newUser;
  },

  deleteUser: (id: string) => {
    const users = userStorage.getUsers().filter(u => u.id !== id);
    userStorage.saveUsers(users);
    
    // Clear user data - remove all keys containing this user id
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(id)) {
        localStorage.removeItem(key);
      }
    });
    
    // If deleted current user, switch to first or create new
    try {
      const currentData = localStorage.getItem(CURRENT_USER_KEY);
      const current = currentData ? JSON.parse(currentData) : null;
      if (current?.id === id) {
        if (users.length > 0) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[0]));
        } else {
          localStorage.removeItem(CURRENT_USER_KEY);
          userStorage.getCurrentUser(); // Will create default
        }
      }
    } catch {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  getUserDataKeys: (userId: string) => {
    return {
      notes: `spi_notes_${userId}`,
      tasks: `spi_tasks_${userId}`,
      assistant: `spi_assistant_${userId}`,
      stats: `spi_stats_${userId}`,
      spotify: `spi_spotify_${userId}`,
    };
  },

  // For admin - get all data with error handling
  getAllUserData: () => {
    if (typeof window === 'undefined') return [];
    try {
      const users = userStorage.getUsers();
      return users.map(user => {
        try {
          const keys = userStorage.getUserDataKeys(user.id);
          const notesRaw = localStorage.getItem(keys.notes);
          const tasksRaw = localStorage.getItem(keys.tasks);
          const statsRaw = localStorage.getItem(keys.stats);
          
          const notes = notesRaw ? JSON.parse(notesRaw) : [];
          const tasks = tasksRaw ? JSON.parse(tasksRaw) : [];
          const stats = statsRaw ? JSON.parse(statsRaw) : { totalSessions: 0 };
          
          // Calculate storage for this user
          let size = 0;
          Object.keys(localStorage).forEach(k => {
            if (k.includes(user.id)) {
              const v = localStorage.getItem(k);
              size += k.length + (v?.length || 0);
            }
          });
          
          return {
            user,
            notesCount: Array.isArray(notes) ? notes.length : 0,
            tasksCount: Array.isArray(tasks) ? tasks.length : 0,
            completedTasks: Array.isArray(tasks) ? tasks.filter((t: any) => t.completed).length : 0,
            sessions: stats.totalSessions || 0,
            storageSize: size
          };
        } catch {
          return {
            user,
            notesCount: 0,
            tasksCount: 0,
            completedTasks: 0,
            sessions: 0,
            storageSize: 0
          };
        }
      });
    } catch {
      return [];
    }
  },

  clearAllData: () => {
    if (typeof window === 'undefined') return;
    if (!confirm('Delete ALL data for ALL users? This cannot be undone!')) return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('spi_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Recreate default user
    const newUser: User = {
      id: 'user_' + Date.now(),
      name: 'Student',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    userStorage.saveUsers([newUser]);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    window.location.reload();
  }
};
