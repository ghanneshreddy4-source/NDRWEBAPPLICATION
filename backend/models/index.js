// models/index.js

const User = require("./User");
const Course = require("./Course");
const Topic = require("./Topic");
const Test = require("./Test");
const MajorTest = require("./MajorTest");
const Result = require("./Result");
const Query = require("./Query");
const Announcement = require("./Announcement");

// Associations below
Course.hasMany(Topic, { foreignKey: "courseId", as: "topics" });
Topic.belongsTo(Course, { foreignKey: "courseId", as: "course" });

Course.hasMany(Test, { foreignKey: "courseId", as: "tests" });
Topic.hasMany(Test, { foreignKey: "topicId", as: "tests" });

Test.belongsTo(Course, { foreignKey: "courseId", as: "course" });
Test.belongsTo(Topic, { foreignKey: "topicId", as: "topic" });

Course.hasMany(MajorTest, { foreignKey: "courseId", as: "majorTests" });
MajorTest.belongsTo(Course, { foreignKey: "courseId", as: "course" });

User.hasMany(Result, { foreignKey: "userId", as: "results" });
Result.belongsTo(User, { foreignKey: "userId", as: "user" });

Test.hasMany(Result, { foreignKey: "testId", as: "results" });
Result.belongsTo(Test, { foreignKey: "testId", as: "test" });

MajorTest.hasMany(Result, { foreignKey: "majorTestId", as: "results" });
Result.belongsTo(MajorTest, { foreignKey: "majorTestId", as: "majorTest" });

User.hasMany(Query, { foreignKey: "userId", as: "queries" });
Query.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  User,
  Course,
  Topic,
  Test,
  MajorTest,
  Result,
  Query,
  Announcement,
};
