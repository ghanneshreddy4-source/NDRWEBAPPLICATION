// backend/controllers/topicController.js
const Topic = require("../models/Topic");
const Course = require("../models/Course");

// GET /api/courses/:courseId/topics
exports.getTopicsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const topics = await Topic.findAll({
      where: { courseId },
      order: [["order", "ASC"], ["createdAt", "ASC"]],
    });

    // Remove any dummy "Handle Validation" topics
    const filtered = topics.filter(t => 
      t.name && !t.name.toLowerCase().includes("handle validation")
    );

    res.json(filtered);
  } catch (err) {
    console.error("getTopicsForCourse error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/courses/:courseId/topics
exports.createTopicForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, description, order, resources, primaryVideoUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Topic name is required" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Create topic
    const topic = await Topic.create({
      courseId,
      name,
      description,
      order: order || null,
      primaryVideoUrl: primaryVideoUrl || null,
      resources: Array.isArray(resources) ? resources : [],
    });

    res.status(201).json(topic);
  } catch (err) {
    console.error("createTopicForCourse error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/courses/:courseId/topics/:id
exports.updateTopic = async (req, res) => {
  try {
    const { courseId, id } = req.params;
    const { name, description, order, primaryVideoUrl, resources } = req.body;

    const topic = await Topic.findOne({ where: { id, courseId } });
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    await topic.update({
      name,
      description,
      order,
      primaryVideoUrl,
      resources: Array.isArray(resources) ? resources : [],
    });

    res.json({ message: "Topic updated successfully", topic });
  } catch (err) {
    console.error("updateTopic error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/courses/:courseId/topics/:id
exports.deleteTopic = async (req, res) => {
  try {
    const { courseId, id } = req.params;
    const topic = await Topic.findOne({ where: { id, courseId } });
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    await topic.destroy();
    res.json({ message: "Topic deleted successfully" });
  } catch (err) {
    console.error("deleteTopic error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
