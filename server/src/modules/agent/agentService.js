import { agentRules } from './rules.js';
import { agentTools } from './tools.js';
import { segmentService } from '../segments/segmentService.js';
import { db } from '../../lib/db.js';

export const agentService = {
  getRecommendations: (customerId = null) => {
    let customers = [];
    if (customerId) {
      const raw = db.findById('customers', customerId);
      if (raw) customers = [segmentService.enrichCustomer(raw)];
    } else {
      customers = segmentService.enrichAll();
    }

    const recommendations = [];

    customers.forEach(cust => {
      agentRules.forEach(rule => {
        const rec = rule.evaluate(cust);
        if (rec) {
          recommendations.push({
            ...rec,
            customer: {
              id: cust.id,
              name: `${cust.firstName} ${cust.lastName}`,
              email: cust.email,
              segment: cust.segment,
              emailConsent: cust.emailConsent,
            }
          });
        }
      });
    });

    // Sort by urgency: CRITICAL > HIGH > MEDIUM > LOW
    const urgencyOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
    recommendations.sort((a, b) => (urgencyOrder[a.urgency] || 9) - (urgencyOrder[b.urgency] || 9));

    return recommendations;
  },

  executeAction: async (actionType, payload) => {
    if (actionType === 'CREATE_TASK') {
      const task = await agentTools.createTask.execute({
        customerId: payload.customerId,
        title: payload.taskTitle,
        description: payload.taskDescription,
      });
      db.logActivity('AGENT', `Action Console approved: Created task "${payload.taskTitle}".`, payload.customerId);
      return { success: true, actionType, result: task };
    }

    if (actionType === 'COMPLETE_TASK') {
      const task = await agentTools.completeTask.execute({ taskId: payload.taskId });
      db.logActivity('AGENT', `Action Console approved: Resolved task "${task.title}".`, task.customerId);
      return { success: true, actionType, result: task };
    }

    if (actionType === 'RESCHEDULE_TASK') {
      const newDue = new Date(Date.now() + 3 * 86400000).toISOString();
      const task = db.update('tasks', payload.taskId, { dueDate: newDue });
      db.logActivity('AGENT', `Action Console extended SLA for task "${task.title}".`, task.customerId);
      return { success: true, actionType, result: task };
    }

    return { success: false, error: 'Unknown action type.' };
  }
};
