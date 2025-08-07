import fs from 'fs-extra';
import path from 'path';

// Загружаем конфигурацию из файла или используем значения по умолчанию
const loadConfig = () => {
  const configPath = './config.json';
  
  try {
    if (fs.existsSync(configPath)) {
      const config = fs.readJsonSync(configPath);
      return { ...defaultConfig, ...config };
    }
  } catch (error) {
    console.warn('Error loading config file, using defaults');
  }
  
  return defaultConfig;
};

const defaultConfig = {
  server: {
    host: 'localhost',
    port: 3001,
    protocol: 'http'
  },
  client: {
    name: 'IPA Console Client',
    version: '1.0.0',
    reconnectAttempts: 5,
    reconnectDelay: 3000
  },
  display: {
    colors: true,
    timestamps: true,
    maxMessageLength: 1000
  }
};

export const config = loadConfig();

// Сохраняем конфигурацию
export const saveConfig = async (newConfig) => {
  try {
    await fs.writeJson('./config.json', { ...config, ...newConfig }, { spaces: 2 });
    Object.assign(config, newConfig);
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
};

// Получаем URL сервера
export const getServerUrl = () => {
  const { host, port, protocol } = config.server;
  return `${protocol}://${host}:${port}`;
};
