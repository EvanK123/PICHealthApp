// Environment configuration
export const ENV = {
  PUBLIC: 'public',
  DEV: 'dev'
};

// Default to public environment
let currentEnv = ENV.PUBLIC;

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