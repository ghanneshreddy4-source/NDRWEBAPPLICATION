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

    res.json(topics);
  } catch (err) {
    console.error("getTopicsForCourse error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/courses/:courseId/topics
exports.createTopicForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, description, order, resources } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Topic name is required" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const topic = await Topic.create({
      courseId,
      name,
      description,
      order: order || null,
      resources: resources || [],
    });

    res.status(201).json(topic);
  } catch (err) {
    console.error("createTopicForCourse error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
