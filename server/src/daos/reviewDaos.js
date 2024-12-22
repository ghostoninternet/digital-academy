import Reviews from "../models/reviewModel.js"
import CustomError from "../errors/customError.js"

const countNumberOfReviews = async (filter = {}) => {
  return await Reviews.countDocuments(filter)
    .then(data => data)
    .catch(err => {
      console.log(err)
      throw new CustomError.DatabaseError()
    })
}

const findAllCourseReviews = async (courseId) => {
  return await Reviews.find({ courseId: courseId })
    .then(data => data)
    .catch(err => {
      console.log(err)
      throw new CustomError.DatabaseError()
    })
}

const findCourseReviews = async (filter={}, limit = 5, page = 1) => {
  return await Reviews.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).lean()
    .then(data => data)
    .catch(err => {
      console.log(err)
      throw new CustomError.DatabaseError()
    })
}

const findCourseReviewById = async (reviewId) => {
  return await Reviews.findById(reviewId)
    .then(data => data)
    .catch(err => {
      console.log(err)
      throw new CustomError.DatabaseError()
    })
}

const createCourseReview = async (newCourseReviewDocument) => {
  return await Reviews.create(newCourseReviewDocument)
    .then(data => data)
    .catch(err => {
      console.log(err)
      throw new CustomError.DatabaseError()
    })
}

const updateCourseReview = async (reviewId, updateCourseReviewDocument) => {
  return await Reviews.findOneAndUpdate(
    {
      _id: reviewId
    },
    updateCourseReviewDocument,
    { new: true }
  )
    .then(data => data)
    .catch(err => {
      console.log(err)
      throw new CustomError.DatabaseError()
    })
}

const deleteCourseReview = async (reviewId) => {
  return await Reviews.findOneAndDelete({ _id: reviewId })
    .then(data => data)
    .catch(err => {
      console.log(err)
      throw new CustomError.DatabaseError()
    })
}

export default {
  countNumberOfReviews,
  findAllCourseReviews,
  findCourseReviewById,
  findCourseReviews,
  createCourseReview,
  updateCourseReview,
  deleteCourseReview,
}