// controllers/courseController.js
const Course = require("../models/Course");
const Topic = require("../models/Topic");

// Create course (Admin)
exports.createCourse = async (req, res) => {
  try {
    const { name, code, description, resources } = req.body;

    const existing = await Course.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: "Course code already exists" });
    }

    const course = await Course.create({
      name,
      code,
      description,
      resources: resources || [],
    });

    res.status(201).json(course);
  } catch (err) {
    console.error("Create course error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all active courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    });
    res.json(courses);
  } catch (err) {
    console.error("Get courses error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single course
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error("Get course by id error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update course (Admin)
exports.updateCourse = async (req, res) => {
  try {
    const { name, code, description, resources, isActive } = req.body;

    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (name !== undefined) course.name = name;
    if (code !== undefined) course.code = code;
    if (description !== undefined) course.description = description;
    if (resources !== undefined) course.resources = resources;
    if (typeof isActive === "boolean") course.isActive = isActive;

    await course.save();
    res.json(course);
  } catch (err) {
    console.error("Update course error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete course (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // delete topics of this course too
    await Topic.destroy({ where: { courseId: course.id } });
    await course.destroy();

    res.json({ message: "Course and related topics deleted" });
  } catch (err) {
    console.error("Delete course error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Add topic to course (Admin)
exports.createTopic = async (req, res) => {
  try {
    const { name, description, order, resources } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Topic title is required" });
    }

    const topic = await Topic.create({
      courseId: req.params.courseId,
      name,
      description,
      order,
      resources: resources || [],
    });

    res.status(201).json(topic);
  } catch (err) {
    console.error("Create topic error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get topics for a course
exports.getTopicsByCourse = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      where: { courseId: req.params.courseId },
      order: [
        ["order", "ASC"],
        ["createdAt", "ASC"],
      ],
    });
    res.json(topics);
  } catch (err) {
    console.error("Get topics by course error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update topic (Admin)
exports.updateTopic = async (req, res) => {
  try {
    const { name, description, order, resources } = req.body;

    const topic = await Topic.findByPk(req.params.topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    if (name !== undefined) topic.name = name;
    if (description !== undefined) topic.description = description;
    if (order !== undefined) topic.order = order;
    if (resources !== undefined) topic.resources = resources;

    await topic.save();
    res.json(topic);
  } catch (err) {
    console.error("Update topic error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete topic (Admin)
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByPk(req.params.topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    await topic.destroy();
    res.json({ message: "Topic deleted" });
  } catch (err) {
    console.error("Delete topic error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
