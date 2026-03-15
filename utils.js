// ═══════════════════════════════════════════════════════
// KATHA APP - UTILITIES & VALIDATION LAYER
// ═══════════════════════════════════════════════════════

// ─── VALIDATORS ───
const Validators = {
  // Validate phone number (10-digit Indian format)
  phone: (value) => {
    const clean = String(value).replace(/\D/g, '');
    return clean.length === 10;
  },
  
  // Validate name (2-100 chars, letters/spaces/apostrophes only)
  name: (value) => {
    const trimmed = String(value).trim();
    return trimmed.length >= 2 && trimmed.length <= 100 && /^[a-zA-Z\s'-]+$/.test(trimmed);
  },
  
  // Validate positive amount
  amount: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && num <= 999999;
  },
  
  // Validate credit limit
  limit: (value) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && num <= 1000000;
  },
  
  // Validate address
  address: (value) => {
    return String(value).trim().length === 0 || String(value).trim().length >= 3;
  },
  
  // Validate cycle
  cycle: (value) => {
    return ['Weekly', 'Every 15 days', 'Monthly'].includes(value);
  }
};

// ─── SANITIZERS ───
const Sanitizers = {
  // Remove XSS attack attempts
  text: (value) => {
    const div = document.createElement('div');
    div.textContent = String(value).trim();
    return div.innerHTML;
  },
  
  // Phone - extract only digits
  phone: (value) => String(value).replace(/\D/g, '').slice(-10),
  
  // Amount - round to 2 decimals
  amount: (value) => Math.round(parseFloat(value) * 100) / 100,
  
  // Name - trim and normalize spaces
  name: (value) => String(value).trim().replace(/\s+/g, ' ')
};

// ─── ERROR HANDLER ───
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.field = field;
    this.name = 'ValidationError';
  }
}

// ─── LOGGER ───
const Logger = {
  store: [],
  maxLogs: 1000,
  
  log: (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, data };
    Logger.store.push(entry);
    
    // Keep only recent logs
    if (Logger.store.length > Logger.maxLogs) {
      Logger.store.shift();
    }
    
    // Console output
    const style = {
      'error': 'color: red; font-weight: bold;',
      'warn': 'color: orange; font-weight: bold;',
      'info': 'color: blue;',
      'debug': 'color: gray;'
    };
    
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `%c[${level.toUpperCase()}] ${message}`,
      style[level] || ''
    );
    
    if (data) console.log(data);
  },
  
  error: (msg, data) => Logger.log('error', msg, data),
  warn: (msg, data) => Logger.log('warn', msg, data),
  info: (msg, data) => Logger.log('info', msg, data),
  debug: (msg, data) => Logger.log('debug', msg, data),
  
  export: () => JSON.stringify(Logger.store, null, 2),
  clear: () => { Logger.store = []; }
};

// ─── STATE MANAGEMENT ───
const StateManager = {
  state: {},
  observers: {},
  
  // Subscribe to state changes
  subscribe: (key, callback) => {
    if (!StateManager.observers[key]) StateManager.observers[key] = [];
    StateManager.observers[key].push(callback);
    return () => {
      StateManager.observers[key] = StateManager.observers[key].filter(cb => cb !== callback);
    };
  },
  
  // Update state and notify observers
  setState: (key, value) => {
    const oldValue = StateManager.state[key];
    StateManager.state[key] = value;
    
    if (StateManager.observers[key]) {
      StateManager.observers[key].forEach(callback => {
        try {
          callback(value, oldValue);
        } catch (err) {
          Logger.error('Observer callback error', err);
        }
      });
    }
  },
  
  // Get state
  getState: (key) => StateManager.state[key],
  
  // Get all state
  getAllState: () => ({ ...StateManager.state })
};

// ─── OPERATION DEBOUNCER ───
const OperationDebouncer = {
  pending: {},
  debounceTime: 500, // ms
  
  // Execute operation with debounce (prevents duplicate rapid operations)
  execute: async (operationId, operation) => {
    if (OperationDebouncer.pending[operationId]) {
      Logger.warn(`Operation ${operationId} already in progress`);
      return null;
    }
    
    OperationDebouncer.pending[operationId] = true;
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      Logger.error(`Operation ${operationId} failed`, err);
      throw err;
    } finally {
      setTimeout(() => {
        delete OperationDebouncer.pending[operationId];
      }, OperationDebouncer.debounceTime);
    }
  },
  
  // Check if operation is pending
  isPending: (operationId) => !!OperationDebouncer.pending[operationId]
};

// ─── SYNC MANAGER ───
const SyncManager = {
  queue: [],
  syncing: false,
  maxRetries: 3,
  
  // Add operation to sync queue
  queue: async (operation, retries = 0) => {
    try {
      await operation();
      Logger.info('Sync operation successful');
    } catch (err) {
      if (retries < SyncManager.maxRetries) {
        Logger.warn(`Sync failed, retrying (${retries + 1}/${SyncManager.maxRetries})`, err);
        setTimeout(() => SyncManager.queue(operation, retries + 1), 1000 * (retries + 1));
      } else {
        Logger.error('Sync failed after max retries', err);
      }
    }
  }
};

// ─── FORMAT HELPERS ───
const Formatters = {
  phone: (value) => {
    const clean = String(value).replace(/\D/g, '');
    if (clean.length !== 10) return value;
    return `${clean.slice(0, 5)} ${clean.slice(5)}`;
  },
  
  currency: (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '₹0';
    return '₹' + Math.round(num).toLocaleString('en-IN');
  },
  
  date: (value) => {
    try {
      return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return value;
    }
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Validators, Sanitizers, ValidationError, Logger, StateManager, OperationDebouncer, SyncManager, Formatters };
}
