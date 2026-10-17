const Transaction = require('../models/Transaction');

class TransactionRepository {
  async findByOwner(ownerId, filter = {}, sort = { date: -1 }, skip = 0, limit = 50) {
    const query = { ownerId, ...filter };
    return Transaction.find(query)
      .populate('accountId', 'name type')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByOwner(ownerId, filter = {}) {
    return Transaction.countDocuments({ ownerId, ...filter });
  }

  async findByIdAndOwner(id, ownerId) {
    return Transaction.findOne({ _id: id, ownerId });
  }

  async create(data) {
    return Transaction.create(data);
  }

  async deleteByIdAndOwner(id, ownerId) {
    return Transaction.findOneAndDelete({ _id: id, ownerId });
  }
}

module.exports = new TransactionRepository();
