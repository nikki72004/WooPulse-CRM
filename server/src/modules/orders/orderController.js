import { orderService } from './orderService.js';

export const orderController = {
  getOrders: (req, res) => {
    const filters = {
      status: req.query.status,
      search: req.query.search,
    };
    const orders = orderService.getAll(filters);
    res.json({ orders });
  },

  getOrderById: (req, res) => {
    const order = orderService.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ order });
  }
};
