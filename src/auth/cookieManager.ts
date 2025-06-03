import fs from 'fs';
import path from 'path';
import {Cookie} from 'playwright';
import logger from '../utils/logger';

export class CookieManager {
  private readonly cookiePath: string;

  constructor(cookiePath: string) {
    logger.info(`Initializing CookieManager with path: ${cookiePath}`);
    this.cookiePath = cookiePath;
  }

  async saveCookies(cookies: Cookie[]): Promise<void> {
    logger.info(`Saving ${cookies.length} cookies to ${this.cookiePath}`);
    const dir = path.dirname(this.cookiePath);
    if (!fs.existsSync(dir)) {
      logger.info(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, {recursive: true});
    }
    await fs.promises.writeFile(this.cookiePath, JSON.stringify(cookies, null, 2));
    logger.info('Cookies saved successfully');
  }

  async loadCookies(): Promise<Cookie[]> {
    if (!fs.existsSync(this.cookiePath)) {
      logger.info('No cookies file found, returning empty array');
      return [];
    }
    logger.info(`Loading cookies from ${this.cookiePath}`);
    const data = await fs.promises.readFile(this.cookiePath, 'utf-8');
    const cookies = JSON.parse(data);
    logger.info(`Loaded ${cookies.length} cookies`);
    return cookies;
  }

  async clearCookies(): Promise<void> {
    if (fs.existsSync(this.cookiePath)) {
      logger.info(`Clearing cookies at ${this.cookiePath}`);
      await fs.promises.unlink(this.cookiePath);
      logger.info('Cookies cleared successfully');
    } else {
      logger.info('No cookies file found to clear');
    }
  }
}
