import mongoose from "mongoose"
import slugify from "slugify"
import CustomError from "../errors/customError.js"
import categoryDaos from "../daos/categoryDaos.js"
import courseDaos from "../daos/courseDaos.js"
import excludeObjectKeys from "../utils/excludeObjectKeys.js"
import includeObjectKeys from "../utils/includeObjectKeys.js"
import moduleDaos from "../daos/moduleDaos.js"
import exerciseDaos from "../daos/exerciseDaos.js"
import userDaos from "../daos/userDaos.js"
import formatValue from "../utils/formatValue.js"
import { COURSE_STATUS } from "../constants/course.js"

//GET COURSE
/*recommended course  */
const getRecommendedCourses = async (categoryId) => {
  let result = await courseDaos.findRecommendedCourses(categoryId)
  return result
}

/*free course  */
const getFreeCourses = async (categoryId) => {
  let result = await courseDaos.findFreeCourses(categoryId)
  return result
}

/*most popular course  */
const getMostPopularCourses = async (categoryId) => {
  let result = await courseDaos.findMostPopularCourses(categoryId)
  return result
}

const getAllInstructorCourseTitles = async (instructorId) => {
  const allCourses = await courseDaos.findAllCourses({
    courseInstructor: new mongoose.Types.ObjectId(instructorId),
  })
  const courseTitles = []
  for (let i = 0; i < allCourses.length; i++) {
    courseTitles.push({
      courseTitle: allCourses[i].courseTitle,
      courseId: allCourses[i]._id,
    })
  }
  return courseTitles
}

const getCourseDetail = async (courseId) => {
  const filter = {
    _id: courseId,
    courseStatus: COURSE_STATUS.PUBLIC,
  }
  let foundCourse = await courseDaos.findOneCourse(filter)
  if (!foundCourse) {
    return {}
  }

  // Get instructor information
  let instructorInfo = await userDaos.findOneUser(foundCourse.courseInstructor)
  if (!instructorInfo) {
    throw new CustomError.NotFoundError("No instructor found!")
  }
  instructorInfo = includeObjectKeys(instructorInfo, [
    'username',
    'avatarUrl',
    'jobTitle'
  ])

  foundCourse = excludeObjectKeys(foundCourse, [
    'updatedAt'
  ])
  foundCourse.courseInstructor = instructorInfo
  // Get all category name
  let categoryNames = []
  for (let i = 0; i < foundCourse.courseCategory.length; i++) {
    let foundCategoryName = await categoryDaos.findCategoryById(foundCourse.courseCategory[i])
    if (foundCategoryName) {
      categoryNames.push(foundCategoryName.categoryName)
    }
  }
  foundCourse.courseCategory = categoryNames

  // Get all modules information
  let moduleInfo = []
  for (let i = 0; i < foundCourse.courseModules.length; i++) {
    let foundModuleInfo = await moduleDaos.findModuleById(foundCourse.courseModules[i])
    if (foundModuleInfo) {
      // Get module exercise info
      let exerciseInfo = []
      for (let j = 0; j < foundModuleInfo.moduleExercises.length; j++) {
        let foundExerciseInfo = await exerciseDaos.findExerciseById(foundModuleInfo.moduleExercises[j])
        if (foundExerciseInfo) {
          foundExerciseInfo = includeObjectKeys(foundExerciseInfo, [
            'exerciseName',
            'exerciseDuration'
          ])
          exerciseInfo.push(foundExerciseInfo)
        }
      }
      foundModuleInfo.moduleExercises = exerciseInfo
    }
    moduleInfo.push(foundModuleInfo)
  }
  foundCourse.courseModules = moduleInfo
  foundCourse.courseRatingAvg = formatValue(foundCourse.courseRatingAvg)
  return foundCourse
}

//search course
const searchCourses = async (queryParams, limit, page) => {
  let { query, courseCategory } = queryParams

  let filter = {
    $text: { $search: `"${query}"` },
  }

  if (courseCategory) {
    if (!Array.isArray(courseCategory)) {
      courseCategory = [courseCategory]
    }

    const categoryIds = []
    for (let i = 0; i < courseCategory.length; i++) {
      const foundCategory = await categoryDaos.findCategoryByName(courseCategory[i])
      if (foundCategory) categoryIds.push(foundCategory._id)
    }

    filter = {
      ...filter,
      courseCategory: { $in: categoryIds },
      courseStatus: COURSE_STATUS.PUBLIC,
      isDeleted: false,
    }
  }

  const totalCourses = await courseDaos.countNumberOfCourses(filter)
  const totalPages = Math.ceil(totalCourses / limit)
  let foundCourses = await courseDaos.findCourses(filter, limit, page)

  foundCourses = await Promise.all(
    foundCourses.map(async (foundCourse) => {
      let instructor = await userDaos.findOneUser(foundCourse.courseInstructor)
      foundCourse = {
        ...foundCourse, 
      courseInstructor: instructor?.username, 
      }
      return excludeObjectKeys(foundCourse, [
        'coursePrice',
        'courseModules',
        'courseReviews',
        'courseLearnerCount',
        'createdAt',
        'updatedAt'
      ])
    }
    ))

  return {
    data: foundCourses,
    pagination: {
      totalPages,
      currentPage: page,
      itemPerPage: limit,
    }
  }
}

const getInstructorCourses = async (instructorId, limit = 10, page = 1) => {
  // Find all courses
  let foundCourses = await courseDaos.findCourses({ courseInstructor: instructorId }, limit, page)

  // Populate data of course category and exclude unnecessary fields.
  const transformedCourses = []
  for (let i = 0; i < foundCourses.length; i++) {
    // Find course categories
    let categories = []
    for (let j = 0; j < foundCourses[i].courseCategory.length; j++) {
      let foundCategory = await categoryDaos.findCategoryById(foundCourses[i].courseCategory[j])
      if (foundCategory) {
        categories.push(foundCategory.categoryName)
      }
    }
    foundCourses[i].courseCategory = categories

    // Exclude unnecessary keys from found course
    const transformedCourse = excludeObjectKeys(foundCourses[i], [
      'courseDescription',
      'courseInstructor',
      'courseImgUrl',
      'courseModules',
      'updatedAt',
      '__v',
    ])

    transformedCourses.push(transformedCourse)
  }

  // Calculate pagination
  const totalCourses = await courseDaos.countNumberOfCourses({ courseInstructor: instructorId })
  const totalPages = Math.ceil(totalCourses / limit)

  return {
    data: transformedCourses,
    pagination: {
      totalPages: totalPages,
      currentPage: page,
      limitPerPage: limit,
      totalCourses: totalCourses,
    }
  }
}

const getInstructorCourseDetail = async (courseId) => {
  const foundCourse = await courseDaos.findCourseById(courseId)
  if (!foundCourse) throw new CustomError.NotFoundError("No course found!")

  const transformedCourse = foundCourse.toObject()
  const categories = []
  for (let i = 0; i < transformedCourse.courseCategory.length; i++) {
    const foundCategory = await categoryDaos.findCategoryById(transformedCourse.courseCategory[i])
    if (foundCategory) {
      categories.push(foundCategory.categoryName)
    }
  }
  transformedCourse.courseCategory = categories

  let modules = []
  for (let i = 0; i < transformedCourse.courseModules.length; i++) {
    let foundModule = await moduleDaos.findModuleById(transformedCourse.courseModules[i])
    if (foundModule) {
      let moduleExercises = []
      for (let j = 0; j < foundModule.moduleExercises.length; j++) {
        let foundExercise = await exerciseDaos.findExerciseById(foundModule.moduleExercises[j])
        if (foundExercise) {
          moduleExercises.push(includeObjectKeys(foundExercise, [
            '_id',
            'exerciseName',
            'exerciseDuration'
          ]))
        }
      }
      foundModule.moduleExercises = moduleExercises
      modules.push(excludeObjectKeys(foundModule, [
        'courseId',
        'moduleInstructor',
        'createdAt',
        'updatedAt'
      ]))
    }
  }

  transformedCourse.courseModules = modules

  return transformedCourse
}

const searchInstructorCourses = async (instructorId, query, limit, page) => {
  let filter = {
    courseTitle: { $regex: query, $options: 'i' },
    courseInstructor: new mongoose.Types.ObjectId(instructorId)
  }
  let foundCourses = await courseDaos.findCourses(filter, limit, page);

  // Populate data of course category and exclude unnecessary fields.
  const transformedCourses = []
  for (let i = 0; i < foundCourses.length; i++) {
    // Find course categories
    let categories = []
    for (let j = 0; j < foundCourses[i].courseCategory.length; j++) {
      let foundCategory = await categoryDaos.findCategoryById(foundCourses[i].courseCategory[j])
      if (foundCategory) {
        categories.push(foundCategory.categoryName)
      }
    }
    foundCourses[i].courseCategory = categories

    // Exclude unnecessary keys from found course
    const transformedCourse = excludeObjectKeys(foundCourses[i], [
      'courseDescription',
      'courseInstructor',
      'courseImgUrl',
      'courseModules',
      'updatedAt',
      '__v',
    ])

    transformedCourses.push(transformedCourse)
  }

  // Calculate pagination
  const totalCourses = await courseDaos.countNumberOfCourses(filter)
  const totalPages = Math.ceil(totalCourses / limit)

  return {
    data: transformedCourses,
    pagination: {
      totalCourses: totalCourses,
      totalPages: totalPages,
      currentPage: page,
      limitPerPage: limit
    }
  }
}

const createNewCourse = async (instructorId, newCourseData) => {
  // Check course availability
  const { courseTitle } = newCourseData
  const foundCourse = await courseDaos.findOneCourse({
    courseTitle: courseTitle,
    courseInstructor: new mongoose.Types.ObjectId(instructorId)
  })
  if (foundCourse) throw new CustomError.BadRequestError("There's already a course with the same name")

  // Get course category IDs
  const categories = []
  for (let i = 0; i < newCourseData.courseCategory.length; i++) {
    let foundCategory = await categoryDaos.findCategoryById(newCourseData.courseCategory[i])
    if (!foundCategory) throw new CustomError.NotFoundError("No category found!")
    categories.push(foundCategory._id)
  }

  // Create new course document and insert to DB
  const newCourseDocument = {
    ...newCourseData,
    courseSlug: slugify(newCourseData.courseTitle.toLowerCase()),
    courseCategory: categories,
    courseInstructor: new mongoose.Types.ObjectId(instructorId),
    courseStatus: COURSE_STATUS.DRAFT,
  }
  const newCourse = await courseDaos.createNewCourse(newCourseDocument)

  // Remove unnecessary field
  const transformedCourse = excludeObjectKeys(newCourse._doc, [
    'courseInstructor',
    'courseImgUrl',
    'courseModules',
    'updatedAt',
    '__v',
  ])
  return transformedCourse
}

const updateCourse = async (courseId, updateCourseData) => {
  // Find course
  const foundCourse = await courseDaos.findCourseById(courseId)
  if (!foundCourse) throw new CustomError.NotFoundError("No course found!")

  // Find course categories
  const categories = []
  for (let i = 0; i < updateCourseData.courseCategory.length; i++) {
    let foundCategory = await categoryDaos.findCategoryById(updateCourseData.courseCategory[i])
    if (!foundCategory) throw new CustomError.NotFoundError("No category found!")
    categories.push(foundCategory._id)
  }

  // Update course
  let updateCourseDocument = {
    ...updateCourseData,
    courseSlug: slugify(updateCourseData.courseTitle.toLowerCase()),
    courseCategory: categories,
    courseInstructor: new mongoose.Types.ObjectId(foundCourse.courseInstructor),
  }
  const updatedCourse = await courseDaos.updateCourse(courseId, updateCourseDocument)

  // Get course categories name
  let transformedCourse = updatedCourse.toObject()
  const updatedCategories = []
  for (let i = 0; i < updatedCourse.courseCategory.length; i++) {
    let foundCategory = await categoryDaos.findCategoryById(updatedCourse.courseCategory[i])
    if (!foundCategory) throw new CustomError.NotFoundError("No category found!")
    updatedCategories.push(foundCategory.categoryName)
  }
  transformedCourse.courseCategory = updatedCategories

  // Remove unnecessary field
  transformedCourse = excludeObjectKeys(transformedCourse, [
    'courseInstructor',
    'courseImgUrl',
    'courseModules',
    'updatedAt',
    '__v',
  ])
  return transformedCourse
}

const deleteCourse = async (courseId) => {
  const foundCourse = await courseDaos.findCourseById(courseId)
  if (!foundCourse) throw new CustomError.NotFoundError("No course found!")

  if (foundCourse.isDeleted) throw new CustomError.BadRequestError("Course has already been deleted!")

  const deletedCourse = await courseDaos.updateCourse(courseId, { isDeleted: true })
  for (let i = 0; i < deletedCourse.courseModules.length; i++) {
    const deletedModule = await moduleDaos.updateModule(deletedCourse.courseModules[i], { isDeleted: true })
    if (deletedModule) {
      for (let j = 0; j < deletedModule.moduleExercises.length; j++) {
        await exerciseDaos.updateExercise(deletedModule.moduleExercises[j], { isDeleted: true })
      }
    }
  }

  return {
    courseId: foundCourse._id,
    isDeleted: true,
  }
}

export default {
  getAllInstructorCourseTitles,
  getCourseDetail,
  searchCourses,
  getFreeCourses,
  getMostPopularCourses,
  getRecommendedCourses,
  getInstructorCourses,
  getInstructorCourseDetail,
  searchInstructorCourses,
  createNewCourse,
  updateCourse,
  deleteCourse,
}