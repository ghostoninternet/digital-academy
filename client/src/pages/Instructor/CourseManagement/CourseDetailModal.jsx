/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import ModuleContent from '../../../components/Accordion/ModuleContent'
import CourseReview from '../../../components/CourseReview'
import MultiSelectDropdown from '../../../components/Input/MultiSelectDropdown '
import { getInstructorCourseDetail } from '../../../apis/course/instructorCourse'
import Spinner from '../../../components/Spinner/Spinner'
import getInstructorCourseReview from '../../../apis/review/getInstructorCourseReview'
import deleteCourseReview from '../../../apis/review/deleteCourseReview'
import { uploadImage } from '../../../apis/upload'
import SelectDropdown from '../../../components/Input/SelectDropdown'
import { COURSE_STATUS } from '../../../constants/course'
import CancelConfirmModal from '../../../components/Modals/Confirmation/CancelConfirmModal'

function CourseStatus({ courseStatus }) {
  return (
    <div>
      {
        courseStatus == "draft" ? (
          <span className="uppercase bg-slate-300 font-bold px-2 py-1 rounded-lg text-xs">{courseStatus}</span>
        ) : (
          <span className="uppercase bg-green-600 text-white font-bold px-2 py-1 rounded-lg text-xs">{courseStatus}</span>
        )
      }
    </div>
  )
}

function CourseDetailModal({
  courseId,
  category,
  isOpen,
  setOpen,
  editCourseData,
  setEditCourseData,
  isEditMode,
  setIsEditMode,
  handleEditCourse,
}) {
  const [optionCourseStatus, setOptionCourseStatus] = useState(Object.keys(COURSE_STATUS).map(status => {
    return {
      value: COURSE_STATUS[status],
      label: status
    }
  }))
  const [courseDetail, setCourseDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchError, setIsFetchError] = useState(false);

  const [courseReviews, setCourseReviews] = useState(null);
  const [isLoadingCourseReviews, setIsLoadingCourseReviews] = useState(true);
  const [isFetchCourseReviewError, setIsFetchCourseReviewError] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [limitPerPage, setLimitPerPage] = useState(5)

  const [isOpenCancel, setIsOpenCancel] = useState(false)

  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const toggleDropdown = () => setIsOpenCategory(!isOpenCategory);
  const handleItemClick = (item) => {
    const categoryId = category.filter(c => c.categoryName == item)[0]._id
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
      setEditCourseData({
        ...editCourseData,
        courseCategory: editCourseData.courseCategory.filter(cId => cId !== categoryId)
      })
    } else {
      setSelectedItems([...selectedItems, item]);
      setEditCourseData({
        ...editCourseData,
        courseCategory: [...editCourseData.courseCategory, categoryId]
      })
    }
  };
  const isSelected = (item) => selectedItems.includes(item);

  const handleChangeCourseStatus = (newStatus) => {
    setEditCourseData({
      ...editCourseData,
      courseStatus: newStatus,
    })
  }

  const calculateCurrentDisplayRange = () => {
    const start = (currentPage - 1) * limitPerPage + 1
    const end = currentPage * limitPerPage > totalReviews ? totalReviews : currentPage * limitPerPage
    return (
      <span className="font-semibold text-gray-900">{start} - {end}</span>
    )
  }
  const previousPage = () => {
    if (currentPage == 1) return
    setCurrentPage(currentPage - 1)
  }
  const nextPage = () => {
    if (currentPage == totalPages) return
    setCurrentPage(currentPage + 1)
  }

  const handleCourseImgChange = async (e) => {
    if (e.target.files) {
      try {
        const formData = new FormData();
        formData.append('image', e.target.files[0]);
        const response = await uploadImage(formData);
        const courseImgUrl = response.data;
        setEditCourseData({ ...editCourseData, courseImgUrl: courseImgUrl });
      } catch (error) {
        console.log(error);
      }
    }
  };
  const handleCancelEditCourseDetail = async () => {
    setEditCourseData({
      courseTitle: courseDetail.courseTitle,
      courseDescription: courseDetail.courseDescription,
      courseCategory: courseDetail.courseCategory.map(c => {
        for (let i = 0; i < category.length; i++) {
          if (category[i].categoryName === c) return category[i]._id
        }
      }),
      coursePrice: courseDetail.coursePrice,
      courseImgUrl: courseDetail.courseImgUrl,
      courseStatus: courseDetail.courseStatus,
    })
    setIsEditMode(false)
    setIsOpenCancel(false)
    setOpen(false)
  }
  const handleEditCourseDetail = async () => {
    await handleEditCourse()
    await fetchInstructorCourseDetail()
  }

  const fetchInstructorCourseDetail = async () => {
    try {
      if (courseId) {
        const courseDetail = await getInstructorCourseDetail(courseId)
        if (courseDetail?.statusCode) {
          throw new Error(courseDetail.message)
        }
        setCourseDetail(courseDetail)
        setEditCourseData({
          courseTitle: courseDetail.courseTitle,
          courseDescription: courseDetail.courseDescription,
          courseCategory: courseDetail.courseCategory.map(c => {
            for (let i = 0; i < category.length; i++) {
              if (category[i].categoryName === c) return category[i]._id
            }
          }),
          coursePrice: courseDetail.coursePrice,
          courseImgUrl: courseDetail.courseImgUrl,
          courseStatus: courseDetail.courseStatus,
        })
        setSelectedItems(courseDetail.courseCategory)
        setIsFetchError(false)
        if (courseDetail.courseStatus == COURSE_STATUS.PUBLIC) {
          setOptionCourseStatus([
            {
              label: 'PUBLIC',
              value: COURSE_STATUS.PUBLIC,
            },
            {
              label: 'DRAFT',
              value: COURSE_STATUS.DRAFT,
            }
          ])
        } else {
          setOptionCourseStatus([
            {
              label: 'DRAFT',
              value: COURSE_STATUS.DRAFT,
            },
            {
              label: 'PUBLIC',
              value: COURSE_STATUS.PUBLIC,
            },
          ])
        }
        toast('Successfully get course detail!', {
          type: 'success',
          autoClose: 1000,
        })
      }
    } catch (error) {
      console.error(error)
      setCourseDetail(null)
      setIsFetchError(true)
      toast(error.message, {
        type: 'error',
        autoClose: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }
  const fetchInstructorCourseReview = async (limit, page) => {
    try {
      if (courseId) {
        const responseData = await getInstructorCourseReview(courseId, limit, page)
        if (responseData?.statusCode) {
          throw new Error(responseData.message)
        }
        if (responseData.length == 0) {
          setCourseReviews(null)
          setIsFetchCourseReviewError(false)
          setTotalReviews(0)
          setTotalPages(1)
          setCurrentPage(1)
          setLimitPerPage(5)
        } else {
          const courseReviews = responseData.data
          setCourseReviews(courseReviews)
          setCurrentPage(Number.parseInt(responseData.pagination.currentPage))
          setLimitPerPage(Number.parseInt(responseData.pagination.itemPerPage))
          setTotalPages(Number.parseInt(responseData.pagination.totalPages))
          setTotalReviews(Number.parseInt(responseData.pagination.totalReviews))
          setIsFetchCourseReviewError(false)
        }
        toast('Successfully get course reviews', {
          type: 'success',
          autoClose: 1000,
        })
      }
    } catch (error) {
      console.error(error)
      setCourseReviews(null)
      setIsFetchCourseReviewError(true)
      toast(error.message, {
        type: 'error',
        autoClose: 2000,
      })
    } finally {
      setIsLoadingCourseReviews(false)
    }
  }
  const handleDeleteCourseReview = async (reviewId) => {
    try {
      const deleteResult = await deleteCourseReview(reviewId)
      if (deleteResult) {
        fetchInstructorCourseReview(limitPerPage, currentPage)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchInstructorCourseDetail()
  }, [])
  useEffect(() => {
    if (courseId && limitPerPage) {
      fetchInstructorCourseReview(limitPerPage, currentPage);
    }
  }, [courseId, currentPage]);

  return (
    <div className={`${isOpen ? '' : 'hidden'} absolute z-50 top-0 right-0 left-0 bottom-0 bg-slate-950/50 w-full h-full`}>
      <div onClick={(e) => { e.stopPropagation() }} className="w-4/5 max-h-[90dvh] overflow-auto mx-auto mt-10 p-3 border-2 bg-white rounded-2xl lg:px-8">
        <div className='flex justify-end'>
          <button
            onClick={() => {
              if (isEditMode) {
                setIsOpenCancel(true)
              } else {
                setOpen(false)
                setIsEditMode(false)
              }
            }}
            className="text-gray-500 hover:text-black"
          >
            ✖
          </button>
        </div>
        {
          isLoading ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : isFetchError ? (
            <p>Oops. Something went wrong</p>
          ) : (
            <>
              <div className='my-5 lg:mb-10'>
                <img
                  className='w-[60%] h-[60%] mx-auto lg:w-[40%] lg:h-[40%]'
                  alt='Course Image'
                  src={isEditMode ? editCourseData.courseImgUrl : courseDetail.courseImgUrl}
                />
              </div>
              <div className='mb-10'>
                <div className="flex w-full mb-2">
                  <p className="w-2/5 font-bold text-xl">Course Title</p>
                  {
                    isEditMode ? (
                      <input
                        value={editCourseData.courseTitle}
                        onChange={(e) => setEditCourseData({
                          ...editCourseData,
                          courseTitle: e.target.value
                        })}
                        placeholder='Enter course title'
                        className="w-3/5 border-2 px-2 py-1 border-black rounded-xl"
                      />
                    ) : (
                      <p className="w-3/5 text-xl">{courseDetail.courseTitle}</p>
                    )
                  }
                </div>
                <div className="flex w-full mb-2">
                  <p className="w-2/5 font-bold text-xl">Course Description</p>
                  {
                    isEditMode ? (
                      <textarea
                        value={editCourseData.courseDescription}
                        onChange={(e) => setEditCourseData({
                          ...editCourseData,
                          courseDescription: e.target.value,
                        })}
                        placeholder='Enter course description'
                        className="w-3/5 border-2 px-2 py-1 border-black rounded-xl"
                      />
                    ) : (
                      <p className="w-3/5 text-xl">{courseDetail.courseDescription}</p>
                    )
                  }
                </div>
                <div className="flex w-full mb-2">
                  <p className="w-2/5 font-bold text-xl">Course Status</p>
                  {
                    isEditMode ? (
                      <div className='relative w-3/5 border-2  border-black rounded-xl cursor-pointer'>
                        <SelectDropdown
                          options={optionCourseStatus}
                          setSelectedOptions={handleChangeCourseStatus}
                          hasDefault={false}
                        />
                      </div>
                    ) : (
                      <p className="w-3/5 text-xl"><CourseStatus courseStatus={courseDetail.courseStatus} /></p>
                    )
                  }
                </div>
                <div className="flex w-full mb-2">
                  <p className="w-2/5 font-bold text-xl">Course Category</p>
                  {
                    isEditMode ? (
                      <div className="relative w-3/5 border-2 px-2 py-1 border-black rounded-xl cursor-pointer">
                        <MultiSelectDropdown
                          items={category.map(c => c.categoryName)}
                          selectedItems={selectedItems}
                          isSelected={isSelected}
                          toggleDropdown={toggleDropdown}
                          isOpen={isOpenCategory}
                          handleItemClick={handleItemClick}
                        />
                      </div>
                    ) : (
                      <div className="w-3/5 font-bold text-base flex flex-wrap gap-1">
                        {
                          courseDetail.courseCategory.map((item) => (
                            <span
                              key={item}
                              className="bg-blue-100 text-blue-600 text-sm px-2 py-1 rounded"
                            >{item}</span>
                          ))
                        }
                      </div>
                    )
                  }

                </div>
                <div className="flex w-full items-center mb-2">
                  <p className="w-2/5 font-bold text-xl">Course Price { isEditMode ? '($)' : null }</p>
                  {
                    isEditMode ? (
                      <input
                        value={editCourseData.coursePrice}
                        onChange={(e) => {
                          setEditCourseData({
                            ...editCourseData,
                            coursePrice: e.target.value,
                          })
                        }}
                        placeholder='Enter the price'
                        className="w-3/5 border-2 px-2 py-1 border-black rounded-xl"
                      />
                    ) : (
                      <p className="w-3/5 text-xl">{courseDetail.coursePrice}$</p>
                    )
                  }
                </div>
                {
                  isEditMode ? (
                    <div className="flex w-full items-center mb-2">
                      <label className="w-2/5 font-bold text-xl">Course Image</label>
                      <input onChange={handleCourseImgChange} className="w-3/5 text-sm cursor-pointer bg-gray-50" type="file" />
                    </div>
                  ) : (
                    null
                  )
                }
                <div className="flex w-full items-center mb-2">
                  <p className="w-2/5 font-bold text-xl">Rating</p>
                  <p className="w-3/5 text-xl">{courseDetail.courseRatingAvg}</p>
                </div>
                <div className="flex w-full items-center mb-2">
                  <p className="w-2/5 font-bold text-xl">Number Of Learner</p>
                  <p className="w-3/5 text-xl">{courseDetail.courseLearnerCount}</p>
                </div>
              </div>

              <div className='mb-2'>
                <div className='text-xl font-bold mb-2'>Course Module</div>
                {
                  courseDetail.courseModules.map(courseModule => (
                    <ModuleContent key={courseModule._id} courseModule={courseModule} />
                  ))
                }
              </div>

              <div className='mb-2'>
                <div className='text-xl font-bold mb-2'>Course Review</div>
                {
                  isLoadingCourseReviews ? (
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  ) : isFetchCourseReviewError ? (
                    <p>Oops. Something went wrong</p>
                  ) : (
                    <>
                      {
                        courseReviews && courseReviews.map(courseReview => (
                          <CourseReview
                            key={courseReview._id}
                            courseReview={courseReview}
                            isEditMode={isEditMode}
                            handleDeleteReview={handleDeleteCourseReview}
                          />
                        ))
                      }
                    </>
                  )
                }
                <div>
                  <nav className="flex flex-col justify-center items-center sm:flex-row sm:justify-between py-2">
                    <div>
                      <span className="text-sm font-normal text-gray-700 mb-4 md:mb-0 block w-full md:inline md:w-auto">
                        Showing {calculateCurrentDisplayRange()} of <span className="font-semibold text-gray-900">{totalReviews}</span>
                      </span>
                    </div>
                    <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                      <li>
                        <button onClick={previousPage} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700">Previous</button>
                      </li>
                      <li>
                        <button aria-current="page" className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700">{currentPage}</button>
                      </li>
                      <li>
                        <button onClick={nextPage} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700">Next</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              {
                isEditMode ? (
                  <div className="flex justify-center">
                    <button onClick={() => setIsOpenCancel(true)} className="mx-5 px-2 py-1 bg-gray-500 font-bold text-white rounded-lg">Cancel</button>
                    <button onClick={handleEditCourseDetail} className="mx-5 px-2 py-1 bg-blue-700 font-bold text-white rounded-lg">Save</button>
                  </div>
                ) : null
              }
            </>
          )
        }
      </div>

      {
        isOpenCancel && (
          <CancelConfirmModal
            isOpen={isOpenCancel}
            confirmMessage={"Are you sure you want to discard all changes ?"}
            handelClose={() => setIsOpenCancel(false)}
            handleSave={() => {
              handleEditCourseDetail()
              setIsOpenCancel(false)
            }}
            handleConfirmCancel={handleCancelEditCourseDetail}
          />
        )
      }
    </div >
  )
}

export default CourseDetailModal