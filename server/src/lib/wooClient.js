import axios from 'axios';
import { ENV } from '../config/env.js';
import { logger } from './logger.js';

export class WooCommerceClient {
  constructor() {
    this.baseURL = ENV.WOO_STORE_URL ? ENV.WOO_STORE_URL.replace(/\/+$/, '') : '';
    this.consumerKey = ENV.WOO_CONSUMER_KEY;
    this.consumerSecret = ENV.WOO_CONSUMER_SECRET;
    this.isLiveConfigured = 
      this.baseURL && 
      !this.baseURL.includes('demo') && 
      this.consumerKey && 
      !this.consumerKey.startsWith('ck_demo');
  }

  getAuthHeaders() {
    const token = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    return {
      Authorization: `Basic ${token}`,
      'User-Agent': 'WooPulse-CRM/1.0',
      'Content-Type': 'application/json',
    };
  }

  async testConnection() {
    if (!this.isLiveConfigured) {
      return {
        success: true,
        mode: 'demo',
        storeName: ENV.CONNECTED_STORE_NAME,
        message: 'Connected to WooPulse CRM Built-in WooCommerce Test Store (v3 REST API simulated)',
      };
    }

    try {
      const res = await axios.get(`${this.baseURL}/wp-json/wc/v3/system_status`, {
        headers: this.getAuthHeaders(),
        timeout: 10000,
      });
      return {
        success: true,
        mode: 'live',
        storeName: res.data?.environment?.site_title || ENV.CONNECTED_STORE_NAME,
        wpVersion: res.data?.environment?.wp_version,
        wcVersion: res.data?.environment?.version,
      };
    } catch (err) {
      logger.error('WooCommerce connection test failed:', { message: err.message });
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  }

  async fetchAllPages(endpoint, params = {}) {
    if (!this.isLiveConfigured) {
      // In demo mode, returns empty array to defer to internal db data
      return [];
    }

    let page = 1;
    let allRecords = [];
    let totalPages = 1;

    try {
      while (page <= totalPages) {
        const res = await axios.get(`${this.baseURL}/wp-json/wc/v3/${endpoint}`, {
          headers: this.getAuthHeaders(),
          params: { ...params, per_page: 100, page },
          timeout: 25000,
        });

        totalPages = parseInt(res.headers['x-wp-totalpages'] || '1', 10);
        if (Array.isArray(res.data)) {
          allRecords = allRecords.concat(res.data);
        }
        page++;
      }
      return allRecords;
    } catch (err) {
      logger.error(`Error fetching WooCommerce ${endpoint}:`, { error: err.message });
      throw err;
    }
  }

  async fetchCustomers(modifiedAfter = null) {
    const params = {};
    if (modifiedAfter) params.modified_after = new Date(modifiedAfter).toISOString();
    return this.fetchAllPages('customers', params);
  }

  async fetchOrders(modifiedAfter = null) {
    const params = {};
    if (modifiedAfter) params.modified_after = new Date(modifiedAfter).toISOString();
    return this.fetchAllPages('orders', params);
  }
}

export const wooClient = new WooCommerceClient();
