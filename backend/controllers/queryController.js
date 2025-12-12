// controllers/queryController.js
const Query = require("../models/Query");
const User = require("../models/User");

// Create a query (student)
// POST /api/queries
exports.createQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const query = await Query.create({
      userId: req.user.id,
      message,
    });

    res.status(201).json(query);
  } catch (err) {
    console.error("Create query error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get my queries (student)
// GET /api/queries/my
exports.getMyQueries = async (req, res) => {
  try {
    const queries = await Query.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(queries);
  } catch (err) {
    console.error("Get my queries error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all queries (admin)
// GET /api/queries
exports.getAllQueries = async (req, res) => {
  try {
    const queries = await Query.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(queries);
  } catch (err) {
    console.error("Get all queries error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Reply to query (admin)
// PUT /api/queries/:id/reply
exports.replyQuery = async (req, res) => {
  try {
    const { adminReply, status } = req.body;

    const query = await Query.findByPk(req.params.id);
    if (!query) return res.status(404).json({ message: "Query not found" });

    if (adminReply !== undefined) query.adminReply = adminReply;
    if (status !== undefined) query.status = status;

    await query.save();
    res.json(query);
  } catch (err) {
    console.error("Reply query error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
