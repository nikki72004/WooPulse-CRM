import { daysBetween, formatCurrency } from '../../utils/helpers.js';
import { db } from '../../lib/db.js';

export const agentRules = [
  {
    id: 'rule-inactive-winback',
    name: 'Inactive Customer Re-Engagement',
    evaluate: (customer) => {
      if (!customer || customer.qualifyingOrderCount === 0) return null;
      if (customer.daysSinceLastOrder && customer.daysSinceLastOrder > 90) {
        return {
          id: `rec-inactive-${customer.id}`,
          ruleId: 'rule-inactive-winback',
          category: 'RETENTION',
          urgency: 'HIGH',
          headline: `Lapsed Patron Win-Back Opportunity for ${customer.firstName} ${customer.lastName}`,
          facts: [
            `Customer completed ${customer.qualifyingOrderCount} qualifying orders previously.`,
            `Last purchase was recorded ${customer.daysSinceLastOrder} days ago (${new Date(customer.lastOrderDate).toLocaleDateString()}).`,
            `Accumulated Lifetime Order Value: ${formatCurrency(customer.lifetimeOrderValue)}.`,
            `Marketing email consent is currently ${customer.emailConsent ? 'ACTIVE (Permitted)' : 'BLOCKED (Opted out)'}.`,
          ],
          inference: 'Customer demonstrates confirmed historical interest but is entering critical churn window (>90 days). Data indicates targeted courtesy offers yield high reactivation.',
          suggestedActions: [
            {
              type: 'DRAFT_EMAIL',
              label: 'Draft Win-Back Email (15% Savings)',
              templateId: 'tmpl-02',
              disabled: !customer.emailConsent,
              tooltip: !customer.emailConsent ? 'Blocked: Customer opted out of email' : null,
            },
            {
              type: 'CREATE_TASK',
              label: 'Create Concierge Outreach Task',
              taskTitle: `Personal re-engagement call with ${customer.firstName} ${customer.lastName}`,
              taskDescription: `Review past purchase history (${customer.qualifyingOrderCount} orders) and extend seasonal update.`,
            }
          ]
        };
      }
      return null;
    }
  },
  {
    id: 'rule-loyal-neglect',
    name: 'VIP Relationship Hygiene',
    evaluate: (customer) => {
      if (!customer || customer.segment !== 'Loyal') return null;

      // Check last communication
      const comms = db.find('communications', c => c.customerId === customer.id);
      const lastComm = comms[0];
      const daysSinceComm = lastComm ? daysBetween(lastComm.sentAt) : 999;

      if (daysSinceComm > 60) {
        return {
          id: `rec-loyal-${customer.id}`,
          ruleId: 'rule-loyal-neglect',
          category: 'VIP_CARE',
          urgency: 'MEDIUM',
          headline: `VIP Patron ${customer.firstName} ${customer.lastName} Lacks Recent Concierge Touchpoint`,
          facts: [
            `Member of Loyal / VIP segment with ${formatCurrency(customer.lifetimeOrderValue)} in qualifying purchases.`,
            daysSinceComm === 999 
              ? 'No prior direct concierge communications recorded on file.' 
              : `Last direct email touchpoint was ${daysSinceComm} days ago.`,
            `Customer account status is active with ${customer.emailConsent ? 'opt-in consent' : 'no email consent'}.`,
          ],
          inference: 'Top-tier buyers expect proactive relationship maintenance. Prolonged silence increases likelihood of competitor exploration.',
          suggestedActions: [
            {
              type: 'DRAFT_EMAIL',
              label: 'Send VIP Private Lookbook Invitation',
              templateId: 'tmpl-01',
              disabled: !customer.emailConsent,
            },
            {
              type: 'CREATE_TASK',
              label: 'Dispatch Handwritten Appreciation Note',
              taskTitle: `Send handwritten appreciation card to ${customer.firstName} ${customer.lastName}`,
              taskDescription: `Include artisan swatch booklet for upcoming collection.`,
            }
          ]
        };
      }
      return null;
    }
  },
  {
    id: 'rule-overdue-tasks',
    name: 'Operational SLA Safeguard',
    evaluate: (customer) => {
      if (!customer) return null;
      const tasks = db.find('tasks', t => t.customerId === customer.id && t.status === 'PENDING');
      const overdue = tasks.filter(t => new Date(t.dueDate) < new Date());

      if (overdue.length > 0) {
        const topTask = overdue[0];
        const daysPast = daysBetween(topTask.dueDate);
        return {
          id: `rec-task-${topTask.id}`,
          ruleId: 'rule-overdue-tasks',
          category: 'OPERATIONAL',
          urgency: 'CRITICAL',
          headline: `Overdue Task: "${topTask.title}" (${daysPast} days past SLA)`,
          facts: [
            `Task was originally scheduled for ${new Date(topTask.dueDate).toLocaleDateString()}.`,
            `Task description: "${topTask.description}".`,
            `Assigned to customer profile: ${customer.firstName} ${customer.lastName}.`,
          ],
          inference: 'Customer commitments past due date directly degrade merchant trust score.',
          suggestedActions: [
            {
              type: 'COMPLETE_TASK',
              label: 'Mark Task as Completed',
              taskId: topTask.id,
            },
            {
              type: 'RESCHEDULE_TASK',
              label: 'Extend SLA by +3 Days',
              taskId: topTask.id,
            }
          ]
        };
      }
      return null;
    }
  },
  {
    id: 'rule-new-welcome',
    name: 'First Purchase Onboarding',
    evaluate: (customer) => {
      if (!customer || customer.qualifyingOrderCount !== 1) return null;

      const comms = db.find('communications', c => c.customerId === customer.id);
      const hasWelcome = comms.some(c => c.subject.toLowerCase().includes('welcome') || c.subject.toLowerCase().includes('care guide'));

      if (!hasWelcome && customer.daysSinceLastOrder !== null && customer.daysSinceLastOrder <= 14) {
        return {
          id: `rec-new-${customer.id}`,
          ruleId: 'rule-new-welcome',
          category: 'ONBOARDING',
          urgency: 'MEDIUM',
          headline: `Deliver Artisan Care Guide to New Patron ${customer.firstName} ${customer.lastName}`,
          facts: [
            `First order completed ${customer.daysSinceLastOrder} days ago.`,
            `Initial acquisition value: ${formatCurrency(customer.lifetimeOrderValue)}.`,
            'Zero welcome/onboarding communications have been dispatched to date.',
          ],
          inference: 'Early educational content on garment care establishes immediate brand value and drives 35% higher repeat retention in month 1.',
          suggestedActions: [
            {
              type: 'DRAFT_EMAIL',
              label: 'Send Artisan Care Guide Template',
              templateId: 'tmpl-03',
              disabled: !customer.emailConsent,
            },
            {
              type: 'CREATE_TASK',
              label: 'Schedule 14-Day Delivery Check-in',
              taskTitle: `Check in on fit & delivery for ${customer.firstName} ${customer.lastName}`,
              taskDescription: `Confirm receipt of first order and solicit private feedback.`,
            }
          ]
        };
      }
      return null;
    }
  }
];
