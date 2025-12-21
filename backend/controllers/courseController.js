// controllers/courseController.js
const Course = require("../models/Course");
const Topic = require("../models/Topic");

// ------------------------------------
// Create course
// ------------------------------------
exports.createCourse = async (req, res) => {
  try {
    const { name, code, description, resources } = req.body;

    const exists = await Course.findOne({ where: { code } });
    if (exists) {
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

// ------------------------------------
// Get all courses
// ------------------------------------
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

// ------------------------------------
// Get single course  <-- MISSING EARLIER
// ------------------------------------
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error("Get course by id error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------
// Update course
// ------------------------------------
exports.updateCourse = async (req, res) => {
  try {
    const { name, code, description, resources, isActive } = req.body;

    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

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

// ------------------------------------
// Delete course (and topics)
// ------------------------------------
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await Topic.destroy({ where: { courseId: course.id } });
    await course.destroy();

    res.json({ message: "Course and related topics deleted" });
  } catch (err) {
    console.error("Delete course error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------
// Create topic
// ------------------------------------
exports.createTopic = async (req, res) => {
  try {
    const { name, description, order, resources, primaryVideoUrl } = req.body;

    if (!name) return res.status(400).json({ message: "Topic name required" });

    const topic = await Topic.create({
      courseId: req.params.courseId,
      name,
      description,
      order,
      primaryVideoUrl: primaryVideoUrl || null,
      resources: resources || [],
    });

    res.status(201).json(topic);
  } catch (err) {
    console.error("Create topic error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------
// Get topics for course
// ------------------------------------
exports.getTopicsByCourse = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      where: { courseId: req.params.courseId },
      order: [["order", "ASC"], ["createdAt", "ASC"]],
    });

    res.json(topics);
  } catch (err) {
    console.error("Get topics error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------
// Update topic
// ------------------------------------
exports.updateTopic = async (req, res) => {
  try {
    const { name, description, order, resources, primaryVideoUrl } = req.body;

    const topic = await Topic.findByPk(req.params.topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    if (name !== undefined) topic.name = name;
    if (description !== undefined) topic.description = description;
    if (order !== undefined) topic.order = order;
    if (resources !== undefined) topic.resources = resources;
    if (primaryVideoUrl !== undefined) topic.primaryVideoUrl = primaryVideoUrl;

    await topic.save();
    res.json(topic);
  } catch (err) {
    console.error("Update topic error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------
// Delete topic
// ------------------------------------
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
// ------------------------------------
// Get Major Tests by Course
// ------------------------------------
const MajorTest = require("../models/MajorTest");

exports.getMajorTests = async (req, res) => {
  try {
    // Read ?courseId=2 from query
    const { courseId } = req.query;

    let whereClause = {};
    if (courseId) {
      const parsedId = parseInt(courseId, 10);
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      whereClause.courseId = parsedId;
    }

    // Fetch all or by courseId
    const tests = await MajorTest.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.json(tests);
  } catch (err) {
    console.error("❌ getMajorTests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
