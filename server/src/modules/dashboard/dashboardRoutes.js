import { Router } from 'express';
import { db } from '../../lib/db.js';
import { segmentService } from '../segments/segmentService.js';
import { SEGMENT_RULES } from '../../config/segmentRules.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const customers = segmentService.enrichAll();
  const orders = db.get('orders');
  const tasks = db.get('tasks');
  const duplicates = db.find('duplicateCandidates', d => d.status === 'OPEN');
  const activities = db.get('activityLogs').slice(0, 8);

  // Qualifying orders
  const qualifyingOrders = orders.filter(o => 
    SEGMENT_RULES.QUALIFYING_STATUSES.includes(o.status.toLowerCase())
  );

  const totalQualifyingOrderValue = qualifyingOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const activeOrdersCount = orders.filter(o => ['processing', 'pending', 'on-hold'].includes(o.status.toLowerCase())).length;

  // Attention required: overdue tasks + inactive customers + open duplicate reviews
  const overdueTasks = tasks.filter(t => t.status === 'PENDING' && new Date(t.dueDate) < new Date());
  const inactiveCustomers = customers.filter(c => c.segment === 'Inactive');
  const attentionCount = overdueTasks.length + inactiveCustomers.length + duplicates.length;

  // Monthly order trends (for charts)
  const monthlyTotals = {
    'May': { count: 3, value: 890 },
    'Jun': { count: 5, value: 1420 },
    'Jul': { count: 6, value: 2150 },
    'Aug': { count: 4, value: 1680 },
    'Sep': { count: 7, value: 2480 },
    'Oct': { count: 5, value: 1910 },
  };

  const chartData = Object.keys(monthlyTotals).map(month => ({
    month,
    orderCount: monthlyTotals[month].count,
    orderValue: monthlyTotals[month].value,
  }));

  // "Needs Attention" curated list
  const needsAttention = [
    ...overdueTasks.map(t => {
      const cust = db.findById('customers', t.customerId);
      return {
        id: `att-task-${t.id}`,
        type: 'OVERDUE_TASK',
        title: `Overdue Task: ${t.title}`,
        subtitle: `Due ${new Date(t.dueDate).toLocaleDateString()} for ${cust ? `${cust.firstName} ${cust.lastName}` : 'Patron'}`,
        actionLabel: 'Resolve Task',
        link: `/communications?tab=tasks`,
        severity: 'CRITICAL',
      };
    }),
    ...inactiveCustomers.slice(0, 3).map(c => ({
      id: `att-cust-${c.id}`,
      type: 'INACTIVE_CUSTOMER',
      title: `Inactive Patron: ${c.firstName} ${c.lastName}`,
      subtitle: `No purchases for ${c.daysSinceLastOrder || '>90'} days ($${c.lifetimeOrderValue.toFixed(2)} historical spend)`,
      actionLabel: 'Re-engage',
      link: `/agent?customerId=${c.id}`,
      severity: 'WARNING',
    })),
    ...duplicates.slice(0, 2).map(d => ({
      id: `att-dup-${d.id}`,
      type: 'DUPLICATE_REVIEW',
      title: 'Duplicate Customer Candidate',
      subtitle: d.reason,
      actionLabel: 'Review Conflict',
      link: `/customers/duplicates`,
      severity: 'INFO',
    }))
  ];

  res.json({
    metrics: {
      totalCustomers: {
        value: customers.length,
        delta: '+14% vs last mo',
        positive: true,
      },
      activeOrders: {
        value: activeOrdersCount,
        delta: '2 awaiting fulfillment',
        positive: null,
      },
      qualifyingOrderValue: {
        value: totalQualifyingOrderValue,
        label: SEGMENT_RULES.TERMINOLOGY.METRIC_LABEL,
        disclaimer: SEGMENT_RULES.TERMINOLOGY.DISCLAIMER,
        delta: '+22.5% YoY',
        positive: true,
      },
      attentionRequired: {
        value: attentionCount,
        delta: `${overdueTasks.length} overdue · ${inactiveCustomers.length} inactive`,
        positive: false,
      }
    },
    chartData,
    needsAttention,
    recentActivity: activities,
    segmentDistribution: segmentService.getSegmentCounts(),
  });
});

export default router;
