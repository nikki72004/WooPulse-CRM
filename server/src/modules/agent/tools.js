import { db } from '../../lib/db.js';
import { segmentService } from '../segments/segmentService.js';

export const agentTools = {
  getCustomer: {
    description: 'Retrieves enriched customer profile including lifetime spend and segment',
    execute: async ({ customerId }) => {
      const raw = db.findById('customers', customerId);
      return segmentService.enrichCustomer(raw);
    }
  },

  getOrders: {
    description: 'Retrieves order history for a customer',
    execute: async ({ customerId }) => {
      return db.find('orders', o => o.customerId === customerId);
    }
  },

  getTasks: {
    description: 'Retrieves pending and completed tasks for a customer',
    execute: async ({ customerId }) => {
      return db.find('tasks', t => t.customerId === customerId);
    }
  },

  createTask: {
    description: 'Creates a new actionable follow-up task',
    execute: async ({ customerId, title, description, dueDate }) => {
      return db.insert('tasks', {
        customerId,
        title,
        description: description || '',
        dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString(),
        status: 'PENDING',
        createdBy: 'agent_approved',
        createdAt: new Date().toISOString(),
      });
    }
  },

  completeTask: {
    description: 'Marks an existing task as completed',
    execute: async ({ taskId }) => {
      return db.update('tasks', taskId, { status: 'COMPLETED' });
    }
  }
};
