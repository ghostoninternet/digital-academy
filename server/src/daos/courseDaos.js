import Courses from "../models/courseModel.js";
import CustomError from "../errors/customError.js";
import { COURSE_STATUS } from "../constants/course.js";
const findRecommendedCourses = async (categoryId) => {
  if (Array.isArray(categoryId) && categoryId.length > 0) {
    return await Courses.aggregate([
      {
        $match: {
          courseCategory: { $all: categoryId },
          courseStatus: COURSE_STATUS.PUBLIC,
          isDeleted: false,
        },
      },
      {
        $sort: { courseRatingAvg: -1 }, //-1: sort descending
      },
      {
        //get 3 fields: title, imgURL, description
        $project: {
          courseTitle: 1,
          courseImgUrl: 1,
          courseSlug: 1,
          courseDescription: 1,
          coursePrice: 1,
          courseRatingAvg: 1,
          courseLearnerCount: 1,
          courseCategory: 1,
        },
      },
      {
        $limit: 4,
      },
    ]);
  } else {
    return await Courses.aggregate([
      {
        $match: {
          courseStatus: COURSE_STATUS.PUBLIC,
          isDeleted: false,
        }
      },
      {
        $sort: { courseRatingAvg: -1 }, //-1: sort descending
      },
      {
        //get 3 fields: title, imgURL, description
        $project: {
          courseTitle: 1,
          courseImgUrl: 1,
          courseSlug: 1,
          courseDescription: 1,
          coursePrice: 1,
          courseRatingAvg: 1,
          courseLearnerCount: 1,
          courseCategory: 1,
        },
      },
      {
        $limit: 4,
      },
    ]);
  }
};

const findFreeCourses = async (categoryId) => {
  if (Array.isArray(categoryId) && categoryId.length > 0) {
    return await Courses.aggregate([
      {
        $match: {
          courseCategory: { $all: categoryId },
          coursePrice: 0,
          courseStatus: COURSE_STATUS.PUBLIC,
          isDeleted: false,
        },
      },
      {
        $sort: { courseRatingAvg: -1 },
      },
      {
        $project: {
          courseTitle: 1,
          courseSlug: 1,
          courseImgUrl: 1,
          courseDescription: 1,
          coursePrice: 1,
          courseRatingAvg: 1,
          courseLearnerCount: 1,
          courseCategory: 1,
        },
      },
      {
        $limit: 4,
      },
    ]);
  } else {
    return await Courses.aggregate([
      {
        $match: {
          coursePrice: 0,
          courseStatus: COURSE_STATUS.PUBLIC,
          isDeleted: false,
        },
      },
      {
        $sort: { courseRatingAvg: -1 },
      },
      {
        $project: {
          courseTitle: 1,
          courseSlug: 1,
          courseImgUrl: 1,
          courseDescription: 1,
          coursePrice: 1,
          courseRatingAvg: 1,
          courseLearnerCount: 1,
          courseCategory: 1,
        },
      },
      {
        $limit: 4,
      },
    ]);
  }
};

const findMostPopularCourses = async (categoryId) => {
  if (Array.isArray(categoryId) && categoryId.length > 0) {
    return await Courses.aggregate([
      {
        $match: {
          courseCategory: { $all: categoryId },
          courseStatus: COURSE_STATUS.PUBLIC,
          isDeleted: false,
        },
      },
      {
        $sort: { courseLearnerCount: -1 }, //sort by descending
      },
      {
        $project: {
          courseTitle: 1,
          courseSlug: 1,
          courseImgUrl: 1,
          courseDescription: 1,
          coursePrice: 1,
          courseRatingAvg: 1,
          courseLearnerCount: 1,
          courseCategory: 1,
        },
      },
      {
        $limit: 4,
      },
    ]);
  } else {
    return await Courses.aggregate([
      {
        $match: {
          courseStatus: COURSE_STATUS.PUBLIC,
          isDeleted: false,
        },
      },
      {
        $sort: { courseLearnerCount: -1 }, //sort by descending
      },
      {
        $project: {
          courseTitle: 1,
          courseSlug: 1,
          courseImgUrl: 1,
          courseDescription: 1,
          coursePrice: 1,
          courseRatingAvg: 1,
          courseLearnerCount: 1,
          courseCategory: 1,
        },
      },
      {
        $limit: 4,
      },
    ]);
  }
};
const countNumberOfCourses = async (filter = {}) => {
  return await Courses.countDocuments(filter)
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      throw new CustomError.DatabaseError();
    });
};

const findOneCourse = async (filter = {}) => {
  return await Courses.findOne(filter)
    .lean()
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      throw new CustomError.DatabaseError();
    });
};

const findAllCourses = async (filter={}) => {
  return await Courses.find(filter).lean()
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      throw new CustomError.DatabaseError();
    });
}

const findCourses = async (filter = {}, limit = 12, page = 1) => {
  return await Courses.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      throw new CustomError.DatabaseError();
    });
};

const findCourseBySlug = async (filter={}) => {
  return await Courses.findOne(filter).lean()
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      throw new CustomError.DatabaseError();
    });
};

const findCourseById = async (courseId) => {
  return await Courses.findById(courseId)
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      throw new CustomError.DatabaseError();
    });
};

const createNewCourse = async (newCourseDocument) => {
  return await Courses.create(newCourseDocument)
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      throw new CustomError.DatabaseError();
    });
};

const updateCourse = async (courseId, updateCourseData) => {
  return await Courses.findOneAndUpdate({ _id: courseId }, updateCourseData, {
    new: true,
  })
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      throw new CustomError.DatabaseError();
    });
};

const deleteCourse = async (courseId) => {
  return await Courses.findOneAndDelete({ _id: courseId })
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      throw new CustomError.DatabaseError();
    });
};

export default {
  countNumberOfCourses,
  findOneCourse,
  findCourses,
  findRecommendedCourses,
  findFreeCourses,
  findMostPopularCourses,
  findCourseById,
  createNewCourse,
  updateCourse,
  deleteCourse,
  findCourseBySlug,
  findAllCourses,
};