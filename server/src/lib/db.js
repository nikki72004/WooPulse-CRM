import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { normalizeEmail } from '../utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial realistic WooCommerce store data
function getInitialSeedData() {
  const adminPasswordHash = bcrypt.hashSync('admin', 10);
  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();

  return {
    users: [
      {
        id: 'usr-admin-01',
        email: 'admin@woopulse.local',
        passwordHash: adminPasswordHash,
        name: 'CRM Administrator',
        role: 'ADMIN',
        createdAt: daysAgo(60),
      }
    ],
    customers: [
      {
        id: 'cust-01',
        wooCustomerId: 101,
        email: 'sarah.jenkins@example.com',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        phone: '+1 (555) 234-5678',
        billing: {
          address_1: '742 Evergreen Terrace',
          city: 'Portland',
          state: 'OR',
          postcode: '97201',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: daysAgo(12),
        createdAt: daysAgo(180),
        updatedAt: daysAgo(12),
      },
      {
        id: 'cust-02',
        wooCustomerId: 102,
        email: 'david.chen@technova.io',
        firstName: 'David',
        lastName: 'Chen',
        phone: '+1 (555) 345-6789',
        billing: {
          address_1: '120 Market St, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          postcode: '94105',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: daysAgo(115),
        createdAt: daysAgo(210),
        updatedAt: daysAgo(115),
      },
      {
        id: 'cust-03',
        wooCustomerId: 103,
        email: 'elena.rostova@designlab.co',
        firstName: 'Elena',
        lastName: 'Rostova',
        phone: '+1 (555) 456-7890',
        billing: {
          address_1: '45 Crosby St, Apt 3B',
          city: 'New York',
          state: 'NY',
          postcode: '10012',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: daysAgo(4),
        createdAt: daysAgo(6),
        updatedAt: daysAgo(4),
      },
      {
        id: 'cust-04',
        wooCustomerId: 104,
        email: 'marcus.vance@archstudio.net',
        firstName: 'Marcus',
        lastName: 'Vance',
        phone: '+1 (555) 567-8901',
        billing: {
          address_1: '880 Lake Shore Dr',
          city: 'Chicago',
          state: 'IL',
          postcode: '60611',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: daysAgo(65),
        createdAt: daysAgo(140),
        updatedAt: daysAgo(65),
      },
      {
        id: 'cust-05',
        wooCustomerId: 105,
        email: 'sophia.miller@luxegallery.com',
        firstName: 'Sophia',
        lastName: 'Miller',
        phone: '+1 (555) 678-9012',
        billing: {
          address_1: '320 Rodeo Drive',
          city: 'Beverly Hills',
          state: 'CA',
          postcode: '90210',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: daysAgo(72),
        createdAt: daysAgo(240),
        updatedAt: daysAgo(72),
      },
      {
        id: 'cust-06',
        wooCustomerId: null,
        email: 'james.wilson@gmail.com',
        firstName: 'James',
        lastName: 'Wilson',
        phone: '+1 (555) 789-0123',
        billing: {
          address_1: '500 Boylston St',
          city: 'Boston',
          state: 'MA',
          postcode: '02116',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'guest',
        wooDateModified: daysAgo(18),
        createdAt: daysAgo(18),
        updatedAt: daysAgo(18),
      },
      {
        id: 'cust-07',
        wooCustomerId: 107,
        email: 'james.wilson@gmail.com',
        firstName: 'Jim',
        lastName: 'Wilson',
        phone: '+1 (555) 789-0123',
        billing: {
          address_1: '500 Boylston St, Fl 4',
          city: 'Boston',
          state: 'MA',
          postcode: '02116',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: daysAgo(150),
        createdAt: daysAgo(300),
        updatedAt: daysAgo(150),
      },
      {
        id: 'cust-08',
        wooCustomerId: 108,
        email: 'clara.barton@mercyhealth.org',
        firstName: 'Clara',
        lastName: 'Barton',
        phone: '+1 (555) 890-1234',
        billing: {
          address_1: '1400 K Street NW',
          city: 'Washington',
          state: 'DC',
          postcode: '20005',
          country: 'US',
        },
        emailConsent: false,
        unsubscribedAt: daysAgo(40),
        source: 'woo',
        wooDateModified: daysAgo(50),
        createdAt: daysAgo(160),
        updatedAt: daysAgo(40),
      },
      {
        id: 'cust-09',
        wooCustomerId: 109,
        email: 'alexander.wright@bespoketailor.co',
        firstName: 'Alexander',
        lastName: 'Wright',
        phone: '+1 (555) 901-2345',
        billing: {
          address_1: '250 Mercer Street',
          city: 'New York',
          state: 'NY',
          postcode: '10012',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: daysAgo(8),
        createdAt: daysAgo(190),
        updatedAt: daysAgo(8),
      },
      {
        id: 'cust-10',
        wooCustomerId: 110,
        email: 'olivia.taylor@trendforecast.com',
        firstName: 'Olivia',
        lastName: 'Taylor',
        phone: '+1 (555) 012-3456',
        billing: {
          address_1: '1800 Congress Ave',
          city: 'Austin',
          state: 'TX',
          postcode: '78701',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: daysAgo(20),
        createdAt: daysAgo(80),
        updatedAt: daysAgo(20),
      },
      {
        id: 'cust-11',
        wooCustomerId: 111,
        email: 'maya.patel@horizonstudio.org',
        firstName: 'Maya',
        lastName: 'Patel',
        phone: '+1 (555) 123-9876',
        billing: {
          address_1: '400 Pine Street',
          city: 'Seattle',
          state: 'WA',
          postcode: '98101',
          country: 'US',
        },
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: daysAgo(28),
        createdAt: daysAgo(220),
        updatedAt: daysAgo(28),
      }
    ],
    orders: [
      {
        id: 'ord-1001',
        wooOrderId: 5001,
        number: '5001',
        status: 'completed',
        currency: 'USD',
        total: 345.50,
        dateCreated: daysAgo(12),
        dateModified: daysAgo(12),
        customerId: 'cust-01',
        billingEmail: 'sarah.jenkins@example.com',
        billing: { firstName: 'Sarah', lastName: 'Jenkins', city: 'Portland', state: 'OR' },
        lineItems: [
          { id: 1, name: 'Silk Trench Coat (Navy)', quantity: 1, price: 295.00, total: 295.00 },
          { id: 2, name: 'Leather Belt (Brass Buckle)', quantity: 1, price: 50.50, total: 50.50 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1002',
        wooOrderId: 5002,
        number: '5002',
        status: 'completed',
        currency: 'USD',
        total: 420.00,
        dateCreated: daysAgo(45),
        dateModified: daysAgo(45),
        customerId: 'cust-01',
        billingEmail: 'sarah.jenkins@example.com',
        billing: { firstName: 'Sarah', lastName: 'Jenkins', city: 'Portland', state: 'OR' },
        lineItems: [
          { id: 3, name: 'Cashmere Knit Sweater', quantity: 2, price: 210.00, total: 420.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1003',
        wooOrderId: 5003,
        number: '5003',
        status: 'completed',
        currency: 'USD',
        total: 475.00,
        dateCreated: daysAgo(95),
        dateModified: daysAgo(95),
        customerId: 'cust-01',
        billingEmail: 'sarah.jenkins@example.com',
        billing: { firstName: 'Sarah', lastName: 'Jenkins', city: 'Portland', state: 'OR' },
        lineItems: [
          { id: 4, name: 'Wool Tailored Blazer', quantity: 1, price: 475.00, total: 475.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1004',
        wooOrderId: 5004,
        number: '5004',
        status: 'completed',
        currency: 'USD',
        total: 180.00,
        dateCreated: daysAgo(115),
        dateModified: daysAgo(115),
        customerId: 'cust-02',
        billingEmail: 'david.chen@technova.io',
        billing: { firstName: 'David', lastName: 'Chen', city: 'San Francisco', state: 'CA' },
        lineItems: [
          { id: 5, name: 'Minimalist Oxford Shirt', quantity: 2, price: 90.00, total: 180.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1005',
        wooOrderId: 5005,
        number: '5005',
        status: 'completed',
        currency: 'USD',
        total: 160.00,
        dateCreated: daysAgo(160),
        dateModified: daysAgo(160),
        customerId: 'cust-02',
        billingEmail: 'david.chen@technova.io',
        billing: { firstName: 'David', lastName: 'Chen', city: 'San Francisco', state: 'CA' },
        lineItems: [
          { id: 6, name: 'Tailored Chino Pants', quantity: 1, price: 160.00, total: 160.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1006',
        wooOrderId: 5006,
        number: '5006',
        status: 'processing',
        currency: 'USD',
        total: 145.00,
        dateCreated: daysAgo(4),
        dateModified: daysAgo(4),
        customerId: 'cust-03',
        billingEmail: 'elena.rostova@designlab.co',
        billing: { firstName: 'Elena', lastName: 'Rostova', city: 'New York', state: 'NY' },
        lineItems: [
          { id: 7, name: 'Merino Wool Scarf', quantity: 1, price: 145.00, total: 145.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1007',
        wooOrderId: 5007,
        number: '5007',
        status: 'completed',
        currency: 'USD',
        total: 290.00,
        dateCreated: daysAgo(65),
        dateModified: daysAgo(65),
        customerId: 'cust-04',
        billingEmail: 'marcus.vance@archstudio.net',
        billing: { firstName: 'Marcus', lastName: 'Vance', city: 'Chicago', state: 'IL' },
        lineItems: [
          { id: 8, name: 'Italian Leather Weekender', quantity: 1, price: 290.00, total: 290.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1008',
        wooOrderId: 5008,
        number: '5008',
        status: 'completed',
        currency: 'USD',
        total: 620.00,
        dateCreated: daysAgo(72),
        dateModified: daysAgo(72),
        customerId: 'cust-05',
        billingEmail: 'sophia.miller@luxegallery.com',
        billing: { firstName: 'Sophia', lastName: 'Miller', city: 'Beverly Hills', state: 'CA' },
        lineItems: [
          { id: 9, name: 'Evening Silk Gown', quantity: 1, price: 620.00, total: 620.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1009',
        wooOrderId: 5009,
        number: '5009',
        status: 'completed',
        currency: 'USD',
        total: 89.00,
        dateCreated: daysAgo(18),
        dateModified: daysAgo(18),
        customerId: 'cust-06',
        billingEmail: 'james.wilson@gmail.com',
        billing: { firstName: 'James', lastName: 'Wilson', city: 'Boston', state: 'MA' },
        lineItems: [
          { id: 10, name: 'Graphic Linen Tee', quantity: 1, price: 89.00, total: 89.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1010',
        wooOrderId: 5010,
        number: '5010',
        status: 'cancelled',
        currency: 'USD',
        total: 120.00,
        dateCreated: daysAgo(30),
        dateModified: daysAgo(30),
        customerId: 'cust-08',
        billingEmail: 'clara.barton@mercyhealth.org',
        billing: { firstName: 'Clara', lastName: 'Barton', city: 'Washington', state: 'DC' },
        lineItems: [
          { id: 11, name: 'Everyday Shoulder Bag', quantity: 1, price: 120.00, total: 120.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1011',
        wooOrderId: 5011,
        number: '5011',
        status: 'completed',
        currency: 'USD',
        total: 780.00,
        dateCreated: daysAgo(8),
        dateModified: daysAgo(8),
        customerId: 'cust-09',
        billingEmail: 'alexander.wright@bespoketailor.co',
        billing: { firstName: 'Alexander', lastName: 'Wright', city: 'New York', state: 'NY' },
        lineItems: [
          { id: 12, name: 'Bespoke Velvet Dinner Jacket', quantity: 1, price: 780.00, total: 780.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1012',
        wooOrderId: 5012,
        number: '5012',
        status: 'completed',
        currency: 'USD',
        total: 210.00,
        dateCreated: daysAgo(20),
        dateModified: daysAgo(20),
        customerId: 'cust-10',
        billingEmail: 'olivia.taylor@trendforecast.com',
        billing: { firstName: 'Olivia', lastName: 'Taylor', city: 'Austin', state: 'TX' },
        lineItems: [
          { id: 13, name: 'Crepe Wide-Leg Trousers', quantity: 1, price: 210.00, total: 210.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1013',
        wooOrderId: 5013,
        number: '5013',
        status: 'completed',
        currency: 'USD',
        total: 440.00,
        dateCreated: daysAgo(28),
        dateModified: daysAgo(28),
        customerId: 'cust-11',
        billingEmail: 'maya.patel@horizonstudio.org',
        billing: { firstName: 'Maya', lastName: 'Patel', city: 'Seattle', state: 'WA' },
        lineItems: [
          { id: 14, name: 'Cashmere Ribbed Cardigan', quantity: 1, price: 440.00, total: 440.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1014',
        wooOrderId: 5014,
        number: '5014',
        status: 'completed',
        currency: 'USD',
        total: 400.00,
        dateCreated: daysAgo(90),
        dateModified: daysAgo(90),
        customerId: 'cust-11',
        billingEmail: 'maya.patel@horizonstudio.org',
        billing: { firstName: 'Maya', lastName: 'Patel', city: 'Seattle', state: 'WA' },
        lineItems: [
          { id: 15, name: 'Suede Ankle Boots', quantity: 1, price: 400.00, total: 400.00 }
        ],
        rawSyncedAt: daysAgo(1),
      },
      {
        id: 'ord-1015',
        wooOrderId: 5015,
        number: '5015',
        status: 'refunded',
        currency: 'USD',
        total: 135.00,
        dateCreated: daysAgo(50),
        dateModified: daysAgo(48),
        customerId: 'cust-04',
        billingEmail: 'marcus.vance@archstudio.net',
        billing: { firstName: 'Marcus', lastName: 'Vance', city: 'Chicago', state: 'IL' },
        lineItems: [
          { id: 16, name: 'Silk Knit Tie', quantity: 1, price: 135.00, total: 135.00 }
        ],
        rawSyncedAt: daysAgo(1),
      }
    ],
    notes: [
      {
        id: 'note-01',
        customerId: 'cust-01',
        body: 'Client prefers discreet packaging and direct courier delivery in the afternoon.',
        createdAt: daysAgo(25),
        updatedAt: daysAgo(25),
      },
      {
        id: 'note-02',
        customerId: 'cust-05',
        body: 'Met at Autumn Trunk Show in Beverly Hills. Very keen on the upcoming winter velvet capsule.',
        createdAt: daysAgo(80),
        updatedAt: daysAgo(80),
      },
      {
        id: 'note-03',
        customerId: 'cust-09',
        body: 'Custom measurements taken for velvet jacket sleeve adjustments.',
        createdAt: daysAgo(8),
        updatedAt: daysAgo(8),
      }
    ],
    tasks: [
      {
        id: 'task-01',
        customerId: 'cust-09',
        title: 'Bespoke Fitting Follow-up',
        description: 'Call Alexander regarding the final fit of the dinner jacket delivered last week.',
        dueDate: daysAgo(3), // Overdue!
        status: 'PENDING',
        createdBy: 'user',
        createdAt: daysAgo(7),
      },
      {
        id: 'task-02',
        customerId: 'cust-05',
        title: 'Send Winter Capsule Lookbook',
        description: 'Send private preview link of the new evening capsule before public launch.',
        dueDate: daysAgo(-5), // Due in 5 days
        status: 'PENDING',
        createdBy: 'agent_approved',
        createdAt: daysAgo(2),
      },
      {
        id: 'task-03',
        customerId: 'cust-01',
        title: 'Thank you note for anniversary order',
        description: 'Sent handwritten concierge card with cashmere garment brush.',
        dueDate: daysAgo(40),
        status: 'COMPLETED',
        createdBy: 'user',
        createdAt: daysAgo(45),
      }
    ],
    communications: [
      {
        id: 'comm-01',
        customerId: 'cust-01',
        type: 'EMAIL',
        subject: 'Your Personal Styling Invitation — Private Preview',
        body: 'Hi Sarah, thank you for being one of our most valued patrons. We have reserved early access for you.',
        status: 'DELIVERED',
        providerMessageId: 'resend_msg_98234710',
        error: null,
        taskId: null,
        sentAt: daysAgo(14),
      },
      {
        id: 'comm-02',
        customerId: 'cust-03',
        type: 'EMAIL',
        subject: 'Welcome to the Atelier — Care Guide for your Merino Scarf',
        body: 'Hi Elena, thank you for your order #5006. Here is our artisan care guide.',
        status: 'DELIVERED',
        providerMessageId: 'resend_msg_98234711',
        error: null,
        taskId: null,
        sentAt: daysAgo(4),
      }
    ],
    emailTemplates: [
      {
        id: 'tmpl-01',
        name: 'VIP Private Preview Invitation',
        subject: 'Exclusive Invitation: Private Winter Capsule Preview for {{firstName}}',
        body: `Dear {{firstName}},

As one of our most distinguished patrons (Lifetime Order Value: {{totalSpend}}), we are pleased to extend an exclusive private preview of our upcoming Winter Collection before the public launch.

Please enjoy complimentary express courier delivery on your selections with code VIPPREVIEW.

Warmest regards,
WooPulse CRM Atelier Concierge`,
        allowedPlaceholders: ['firstName', 'lastName', 'totalSpend', 'lastOrderDate'],
      },
      {
        id: 'tmpl-02',
        name: 'Win-Back Exclusive Privilege (15% Off)',
        subject: 'We miss your eye for style, {{firstName}} — A special token for you',
        body: `Dear {{firstName}},

It has been over 90 days since your last order on {{lastOrderDate}}. We have just refreshed our curated arrivals and would love to welcome you back.

Enjoy a private 15% courtesy savings on your next acquisition with the code ATELIER15.

With appreciation,
The Atelier Team`,
        allowedPlaceholders: ['firstName', 'lastOrderDate', 'storeName'],
      },
      {
        id: 'tmpl-03',
        name: 'First Purchase Onboarding & Garment Care',
        subject: 'Welcome to our circle, {{firstName}} — Your Artisan Care Guide',
        body: `Dear {{firstName}},

Thank you for choosing our pieces for your recent purchase. Each creation is crafted with heritage materials intended to endure.

We have prepared a curated care guide to preserve the luster and longevity of your garments. Reach out to our concierge at any time should you need assistance.

Warmly,
The Concierge Team`,
        allowedPlaceholders: ['firstName', 'orderNumber', 'orderDate'],
      }
    ],
    syncRuns: [
      {
        id: 'sync-01',
        type: 'full',
        status: 'SUCCESS',
        startedAt: daysAgo(1),
        finishedAt: daysAgo(1),
        counts: { customersSynced: 11, ordersSynced: 15, duplicatesDetected: 1 },
        error: null,
      }
    ],
    webhookEvents: [
      {
        id: 'wh-01',
        deliveryId: 'wh_del_982347891234',
        topic: 'order.updated',
        resourceId: 5006,
        status: 'PROCESSED',
        error: null,
        receivedAt: daysAgo(4),
      },
      {
        id: 'wh-02',
        deliveryId: 'wh_del_982347891235',
        topic: 'customer.created',
        resourceId: 103,
        status: 'PROCESSED',
        error: null,
        receivedAt: daysAgo(6),
      }
    ],
    duplicateCandidates: [
      {
        id: 'dup-01',
        customerAId: 'cust-06', // James Wilson (Guest)
        customerBId: 'cust-07', // Jim Wilson (Woo Customer)
        reason: 'Matching normalized email: james.wilson@gmail.com and identical phone number',
        status: 'OPEN',
        createdAt: daysAgo(18),
      }
    ],
    activityLogs: [
      {
        id: 'act-01',
        type: 'SYNC',
        customerId: null,
        message: 'Completed scheduled incremental sync with Demo Boutique (11 customers, 15 orders processed).',
        createdAt: daysAgo(1),
      },
      {
        id: 'act-02',
        type: 'WEBHOOK',
        customerId: 'cust-03',
        message: 'Received webhook: Order #5006 status transitioned to processing.',
        createdAt: daysAgo(4),
      },
      {
        id: 'act-03',
        type: 'COMMUNICATION',
        customerId: 'cust-01',
        message: 'Dispatched VIP Private Preview email to Sarah Jenkins.',
        createdAt: daysAgo(14),
      },
      {
        id: 'act-04',
        type: 'AGENT',
        customerId: 'cust-05',
        message: 'Agent created task: Send Winter Capsule Lookbook for Sophia Miller.',
        createdAt: daysAgo(2),
      }
    ]
  };
}

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.data = getInitialSeedData();
      this.save();
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading db.json, reseeding with clean data:', err);
        this.data = getInitialSeedData();
        this.save();
      }
    }
  }

  save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Collections
  get(collection) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    return this.data[collection];
  }

  find(collection, predicate) {
    return this.get(collection).filter(predicate);
  }

  findOne(collection, predicate) {
    return this.get(collection).find(predicate);
  }

  findById(collection, id) {
    return this.get(collection).find(item => item.id === id);
  }

  insert(collection, item) {
    if (!item.id) {
      item.id = `${collection.slice(0, 4)}-${uuidv4().slice(0, 8)}`;
    }
    const list = this.get(collection);
    list.push(item);
    this.save();
    return item;
  }

  update(collection, id, updates) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return list[index];
  }

  delete(collection, id) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.save();
    return true;
  }

  logActivity(type, message, customerId = null) {
    const act = {
      id: `act-${uuidv4().slice(0, 8)}`,
      type,
      customerId,
      message,
      createdAt: new Date().toISOString(),
    };
    this.get('activityLogs').unshift(act);
    if (this.data.activityLogs.length > 50) {
      this.data.activityLogs.pop();
    }
    this.save();
    return act;
  }
}

export const db = new Database();
