function set<T>(key: string, value: T): void {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  
  function get<T>(key: string): T | null {
    const value: string | null = localStorage.getItem(key);
  
    if (value) {
      return JSON.parse(value);
    }
  
    return null;
  }
  
  const localStorageService = {
    set,
    get,
    remove: (key: string): void => localStorage.removeItem(key),
    clear: (): void => localStorage.clear(),
  };
  
  export default localStorageService;
  