// Environment configuration
export const ENV = {
  PUBLIC: 'public',
  DEV: 'dev'
};

// Set default environment
let currentEnv = ENV.DEV;

// Function to get current environment
export const getCurrentEnv = () => currentEnv;

// Function to set environment
export const setEnvironment = (env) => {
  if (Object.values(ENV).includes(env)) {
    currentEnv = env;
    return true;
  }
  return false;
}; 