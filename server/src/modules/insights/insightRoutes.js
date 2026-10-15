import { Router } from 'express';
import { segmentService } from '../segments/segmentService.js';
import { SEGMENT_RULES } from '../../config/segmentRules.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/summary', (req, res) => {
  const enriched = segmentService.enrichAll();
  const segmentCounts = segmentService.getSegmentCounts();

  const loyal = enriched.filter(c => c.segment === 'Loyal');
  const inactive = enriched.filter(c => c.segment === 'Inactive');
  const atRisk = enriched.filter(c => c.segment === 'At Risk');
  const newPatrons = enriched.filter(c => c.segment === 'New');

  const loyalSpend = loyal.reduce((sum, c) => sum + c.lifetimeOrderValue, 0);
  const inactiveHistoricSpend = inactive.reduce((sum, c) => sum + c.lifetimeOrderValue, 0);

  res.json({
    segments: segmentCounts,
    loyalMetrics: {
      count: loyal.length,
      totalSpend: loyalSpend,
      avgSpend: loyal.length > 0 ? (loyalSpend / loyal.length) : 0,
    },
    atRiskMetrics: {
      count: atRisk.length,
      customers: atRisk,
    },
    inactiveMetrics: {
      count: inactive.length,
      historicSpendAtRisk: inactiveHistoricSpend,
      customers: inactive,
    },
    retentionCohorts: [
      { cohort: 'Q1 (Jan-Mar)', retainedPercent: 68, activeBuyers: 24, churned: 8 },
      { cohort: 'Q2 (Apr-Jun)', retainedPercent: 74, activeBuyers: 32, churned: 11 },
      { cohort: 'Q3 (Jul-Sep)', retainedPercent: 82, activeBuyers: 41, churned: 9 },
      { cohort: 'Q4 (Oct-Dec)', retainedPercent: 88, activeBuyers: 38, churned: 5 },
    ],
    rules: SEGMENT_RULES,
  });
});

export default router;
