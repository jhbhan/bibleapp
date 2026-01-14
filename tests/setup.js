import '@testing-library/jest-dom';
import { vi } from 'vitest';

const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock for fetch

global.fetch = vi.fn(() =>

  Promise.resolve({

    json: () => Promise.resolve({

      "3 John": {

        "1": {

          "1": "The elder to the beloved Gaius, whom I love in truth."

        }

      }

    }),

  })

);



window.HTMLElement.prototype.scrollIntoView = vi.fn();
