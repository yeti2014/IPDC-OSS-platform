// src/db/schema.ts
import Dexie, { Table } from 'dexie';
import { ServiceRequest, SyncQueueItem } from '../types';

export class IPDCDatabase extends Dexie {
  serviceRequests!: Table<ServiceRequest>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('IPDCDatabase');
    
    this.version(1).stores({
      serviceRequests: 'id, tenantId, status, priority, serviceType, createdAt',
      syncQueue: '++id, type, collection, status, createdAt',
    });
  }
}

export const db = new IPDCDatabase();