// controllers/announcementController.js
const Announcement = require("../models/Announcement");

// Create announcement (Admin)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, isPinned } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    const ann = await Announcement.create({
      title,
      body,
      isPinned: Boolean(isPinned),
      isActive: true,
    });

    return res.status(201).json(ann);

  } catch (err) {
    console.error("🔥 createAnnouncement error:", err);
    return res.status(500).json({
      message: "Server error",
      details: err.message,
    });
  }
};


// Get active announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const anns = await Announcement.findAll({
      where: { isActive: true },
      order: [
        ["isPinned", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.json(anns);

  } catch (err) {
    console.error("🔥 getAnnouncements error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// Update announcement (Admin)
exports.updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByPk(req.params.id);
    if (!ann) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const { title, body, isPinned, isActive } = req.body;

    if (title !== undefined) ann.title = title;
    if (body !== undefined) ann.body = body;
    if (isPinned !== undefined) ann.isPinned = Boolean(isPinned);
    if (isActive !== undefined) ann.isActive = Boolean(isActive);

    await ann.save();
    return res.json(ann);

  } catch (err) {
    console.error("🔥 updateAnnouncement error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// Delete announcement (Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByPk(req.params.id);
    if (!ann) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await ann.destroy();
    return res.json({ message: "Announcement deleted" });

  } catch (err) {
    console.error("🔥 deleteAnnouncement error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
