// controllers/testController.js
const Test = require("../models/Test");
const MajorTest = require("../models/MajorTest");
const Result = require("../models/Result");

// =====================================================
//                NORMAL (TOPIC-WISE) TESTS
// =====================================================

// Create normal test (topic-wise) - Admin
exports.createTest = async (req, res) => {
  try {
    const {
      title,
      courseId,
      topicId,
      course, // fallback for old frontend
      topic,  // fallback for old frontend
      durationMinutes,
      questions,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const resolvedCourseId = courseId || course;
    const resolvedTopicId = topicId || topic;

    if (!resolvedCourseId || !resolvedTopicId) {
      return res
        .status(400)
        .json({ message: "courseId and topicId are required" });
    }

    const test = await Test.create({
      title,
      courseId: resolvedCourseId,
      topicId: resolvedTopicId,
      durationMinutes: durationMinutes ?? 30,
      questions: questions || [],
    });

    res.status(201).json(test);
  } catch (err) {
    console.error("Create test error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get tests by topic (for listing tests of a topic)
exports.getTestsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const tests = await Test.findAll({
      where: {
        topicId,
        isActive: true,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(tests);
  } catch (err) {
    console.error("Get tests by topic error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single test (for taking exam)
exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findByPk(id);
    if (!test || !test.isActive) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json(test);
  } catch (err) {
    console.error("Get test by id error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update test - Admin
exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, durationMinutes, questions, isActive } = req.body;

    const test = await Test.findByPk(id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (title !== undefined) test.title = title;
    if (durationMinutes !== undefined) test.durationMinutes = durationMinutes;
    if (questions !== undefined) test.questions = questions;
    if (typeof isActive === "boolean") test.isActive = isActive;

    await test.save();
    res.json(test);
  } catch (err) {
    console.error("Update test error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete test - Admin
exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findByPk(id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    await test.destroy();
    res.json({ message: "Test deleted" });
  } catch (err) {
    console.error("Delete test error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit normal test (user)
exports.submitTest = async (req, res) => {
  try {
    const { id } = req.params; // testId
    const test = await Test.findByPk(id);

    if (!test || !test.isActive) {
      return res.status(404).json({ message: "Test not found" });
    }

    const { answers } = req.body; // [{questionId, selectedOptionIndex}, ...]
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers are required" });
    }

    let score = 0;
    let totalMarks = 0;
    const answersResult = [];

    const questions = test.questions || [];

    questions.forEach((q, index) => {
      const qId = q._id ?? index; // support _id or fallback index
      totalMarks += q.marks || 0;

      const userAnswer = answers.find(
        (a) => String(a.questionId) === String(qId)
      );

      if (!userAnswer) return;

      const isCorrect =
        userAnswer.selectedOptionIndex === q.correctOptionIndex;
      const marksAwarded = isCorrect ? (q.marks || 0) : 0;
      score += marksAwarded;

      answersResult.push({
        questionId: qId,
        selectedOptionIndex: userAnswer.selectedOptionIndex,
        isCorrect,
        marksAwarded,
      });
    });

    const result = await Result.create({
      userId: req.user.id,
      testId: test.id,
      majorTestId: null,
      score,
      totalMarks,
      answers: answersResult,
    });

    res.json({
      message: "Test submitted",
      score,
      totalMarks,
      resultId: result.id,
    });
  } catch (err) {
    console.error("Submit test error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
//                    MAJOR TESTS (Weekly)
// =====================================================

// Create major test - Admin
exports.createMajorTest = async (req, res) => {
  try {
    const { title, courseId, course, durationMinutes, questions } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const resolvedCourseId = courseId || course;
    if (!resolvedCourseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const majorTest = await MajorTest.create({
      title,
      courseId: resolvedCourseId,
      durationMinutes: durationMinutes ?? 60,
      questions: questions || [],
    });

    res.status(201).json(majorTest);
  } catch (err) {
    console.error("Create major test error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get major tests by course
exports.getMajorTestsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const tests = await MajorTest.findAll({
      where: {
        courseId,
        isActive: true,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(tests);
  } catch (err) {
    console.error("Get major tests by course error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single major test
exports.getMajorTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await MajorTest.findByPk(id);
    if (!test || !test.isActive) {
      return res.status(404).json({ message: "Major test not found" });
    }

    res.json(test);
  } catch (err) {
    console.error("Get major test by id error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update major test - Admin
exports.updateMajorTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, durationMinutes, questions, isActive } = req.body;

    const test = await MajorTest.findByPk(id);
    if (!test) {
      return res.status(404).json({ message: "Major test not found" });
    }

    if (title !== undefined) test.title = title;
    if (durationMinutes !== undefined) test.durationMinutes = durationMinutes;
    if (questions !== undefined) test.questions = questions;
    if (typeof isActive === "boolean") test.isActive = isActive;

    await test.save();
    res.json(test);
  } catch (err) {
    console.error("Update major test error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete major test - Admin
exports.deleteMajorTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await MajorTest.findByPk(id);
    if (!test) {
      return res.status(404).json({ message: "Major test not found" });
    }

    await test.destroy();
    res.json({ message: "Major test deleted" });
  } catch (err) {
    console.error("Delete major test error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit major test (user)
exports.submitMajorTest = async (req, res) => {
  try {
    const { id } = req.params; // majorTestId
    const test = await MajorTest.findByPk(id);

    if (!test || !test.isActive) {
      return res.status(404).json({ message: "Major test not found" });
    }

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers are required" });
    }

    let score = 0;
    let totalMarks = 0;
    const answersResult = [];

    const questions = test.questions || [];

    questions.forEach((q, index) => {
      const qId = q._id ?? index;
      totalMarks += q.marks || 0;

      const userAnswer = answers.find(
        (a) => String(a.questionId) === String(qId)
      );

      if (!userAnswer) return;

      const isCorrect =
        userAnswer.selectedOptionIndex === q.correctOptionIndex;
      const marksAwarded = isCorrect ? (q.marks || 0) : 0;
      score += marksAwarded;

      answersResult.push({
        questionId: qId,
        selectedOptionIndex: userAnswer.selectedOptionIndex,
        isCorrect,
        marksAwarded,
      });
    });

    const result = await Result.create({
      userId: req.user.id,
      testId: null,
      majorTestId: test.id,
      score,
      totalMarks,
      answers: answersResult,
    });

    res.json({
      message: "Major test submitted",
      score,
      totalMarks,
      resultId: result.id,
    });
  } catch (err) {
    console.error("Submit major test error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
