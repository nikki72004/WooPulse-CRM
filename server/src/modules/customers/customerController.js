import { customerService } from './customerService.js';

export const customerController = {
  getCustomers: (req, res) => {
    const filters = {
      search: req.query.search,
      segment: req.query.segment,
      sortBy: req.query.sortBy,
    };
    const customers = customerService.getAll(filters);
    res.json({ customers });
  },

  getCustomerById: (req, res) => {
    const customer = customerService.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json({ customer });
  },

  updateCustomer: (req, res) => {
    const updated = customerService.updateCrmFields(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json({ customer: updated });
  },

  getDuplicates: (req, res) => {
    const duplicates = customerService.getDuplicates();
    res.json({ duplicates });
  },

  resolveDuplicate: (req, res) => {
    const { action } = req.body;
    const result = customerService.resolveDuplicate(req.params.id, action);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  }
};
