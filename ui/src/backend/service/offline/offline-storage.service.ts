import { Injectable } from '@angular/core';
import { Product, ProductCategory } from '../../../app/back/models/product.model';

export interface PendingOperation {
  id?: number;
  type: 'OPEN_SESSION' | 'SALE' | 'CLOSE_SESSION';
  payload: any;
  localId: string;
  timestamp: string;
  localOrderNumber?: number;
}

const DB_NAME = 'pos-offline-db';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products-cache';
const STORE_PENDING = 'pending-operations';

@Injectable({ providedIn: 'root' })
export class OfflineStorageService {

  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.openDb();
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
          db.createObjectStore(STORE_PRODUCTS, { keyPath: 'posId' });
        }
        if (!db.objectStoreNames.contains(STORE_PENDING)) {
          const store = db.createObjectStore(STORE_PENDING, { keyPath: 'id', autoIncrement: true });
          store.createIndex('type', 'type', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async db(): Promise<IDBDatabase> {
    return this.dbPromise;
  }

  // ── Menu cache (products + categories) ────────────────────────────────────

  async saveMenuData(posId: number, products: Product[], categories: ProductCategory[]): Promise<void> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      tx.objectStore(STORE_PRODUCTS).put({ posId, products, categories, cachedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getMenuData(posId: number): Promise<{ products: Product[]; categories: ProductCategory[] }> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readonly');
      const req = tx.objectStore(STORE_PRODUCTS).get(posId);
      req.onsuccess = () => resolve({
        products: req.result?.products ?? [],
        categories: req.result?.categories ?? []
      });
      req.onerror = () => reject(req.error);
    });
  }

  // ── Pending operations ──────────────────────────────────────────────────────

  async addPendingOp(op: Omit<PendingOperation, 'id'>): Promise<void> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readwrite');
      tx.objectStore(STORE_PENDING).add(op);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getPendingOps(): Promise<PendingOperation[]> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readonly');
      const req = tx.objectStore(STORE_PENDING).getAll();
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => reject(req.error);
    });
  }

  async deletePendingOps(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readwrite');
      const store = tx.objectStore(STORE_PENDING);
      ids.forEach(id => store.delete(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearPendingOps(): Promise<void> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readwrite');
      tx.objectStore(STORE_PENDING).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
