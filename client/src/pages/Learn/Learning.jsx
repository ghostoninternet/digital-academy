import { useEffect, useState, useRef } from "react";
import StarIcon from "@mui/icons-material/Star";
import { useParams } from "react-router-dom";
import getCourseDetail from "../../apis/course/getCourseDetail";
import Review from "../../components/Review";
import getCourseReview from "../../apis/review/getCourseReview";
import CircularProgress from "@mui/material/CircularProgress";
import ModuleOverview from "../../components/ModuleOverview";

const Learn = () => {
  const [isSection, setIsSection] = useState("");
  const [queryParams, setQueryParams] = useState(1);
  const [isMore, setIsMore] = useState(true);
  let { courseSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({
    data: [],
    rating: {},
    pagination: {},
  });
  const [courseDetail, setCourseDetail] = useState({});
  const [isEnrollPopupOpen, setIsEnrollPopupOpen] = useState(false); // State Enroll popup
  const [isLeaveReviewOpen, setIsLeaveReviewOpen] = useState(false); // State popup Leave Review
  const [newReview, setNewReview] = useState({
    content: "",
    rating: 0,
  });
  useEffect(() => {
    if (
      3 * queryParams ===
      reviews?.pagination?.itemPerPage * reviews?.pagination?.totalPages
    ) {
      setIsMore(false);
    }
  }, [queryParams, reviews]);
  useEffect(() => {
    const fetchedCourse = async () => {
      try {
        const response = await getCourseDetail(courseSlug);
        setCourseDetail(response);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchedCourse();
  }, [courseSlug, queryParams]);

  useEffect(() => {
    const fetchedReview = async () => {
      try {
        const response = await getCourseReview(courseSlug, queryParams);
        setReviews(response);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchedReview();
  }, [courseSlug, queryParams]);

  const aboutRef = useRef(null);
  const modulesRef = useRef(null);
  const reviewsRef = useRef(null);

  const scrollToAbout = () => {
    window.location.hash = "about";
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setIsSection("About");
  };
  const scrollToModules = () => {
    window.location.hash = "modules";
    if (modulesRef.current) {
      modulesRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setIsSection("Modules");
  };
  const scrollToReviews = () => {
    window.location.hash = "reviews";
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setIsSection("Reviews");
  };

  const handleLeaveReviewClick = () => setIsLeaveReviewOpen(true);

  const handleCloseLeaveReview = () => {
    setIsLeaveReviewOpen(false);
    setNewReview({ content: "", rating: 0 });
  };

  // Hàm gửi review
  const handleSubmitReview = () => {
    if (newReview.content && newReview.rating > 0) {
      const newReviewData = {
        _id: `${reviews.data.length + 1}`,
        userId: {
          avatarUrl: "https://via.placeholder.com/50",
          username: "Current User",
        },
        reviewContent: newReview.content,
        createdAt: new Date().toISOString(),
        ratingStar: newReview.rating,
      };
      setReviews((prev) => ({
        ...prev,
        data: [...prev.data, newReviewData],
      }));
      handleCloseLeaveReview();
      alert("Review submitted successfully!");
    } else {
      alert("Please provide both content and rating.");
    }
  };
  // Quản lý Enroll popup
  const handleEnrollClick = () => setIsEnrollPopupOpen(true);
  const handleCloseEnrollPopup = () => setIsEnrollPopupOpen(false);

  const handleSeeMore = () => {
    const newQueryParams = queryParams + 1;
    setQueryParams(newQueryParams);
  };
  return (
    <div className="">
      <div className="bg-blue-100 px-16 h-[calc(100vh-3rem)] flex items-center">
        <div className="w-5/12">
          <h2 className="text-5xl font-semibold leading-tight">
            {loading ? "loading..." : courseDetail.courseTitle}
          </h2>
          <div className="text-xl font-normal mb-9">
            <span className="">
              {" "}
              {courseDetail?.courseInstructor?.username}
            </span>
          </div>
          <button
            onClick={handleEnrollClick}
            className="px-3 py-5 bg-blue-500 font-semibold text-2xl text-white rounded-md w-1/3 mb-7"
          >
            Enroll now! {courseDetail.coursePrice}$
          </button>
          <div className="">
            <p className="text-lg">
              <span className="font-semibold">
                {loading ? "..." : courseDetail.courseLearnerCount}
              </span>{" "}
              Already enrolled
            </p>
          </div>
        </div>
        <div className="w-7/12 flex">
          <div className="w-full h-full flex items-center justify-center">
            {loading ? (
              <CircularProgress />
            ) : (
              <img src={courseDetail.courseImgUrl} className="w-3/4" />
            )}
          </div>
        </div>
      </div>
      <div className="px-16">
        <ul className="-translate-y-10 -bottom-12 bg-white shadow-lg border py-6 w-full flex justify-around px-8">
          <li className=" flex flex-col border-r-2 w-4/12 items-center">
            <h3 className="text-2xl font-semibold">
              {courseDetail?.courseModules?.length} modules
            </h3>
            <p className="">
              Gain insight into a topic and learn the fundamentals.
            </p>
          </li>
          <li className="flex flex-col border-r-2 w-2/12 items-center">
            <div className="flex items-center">
              <h3 className="text-2xl font-semibold ">
                {courseDetail.courseRatingAvg}
              </h3>
              <StarIcon color="primary" />
            </div>
            <p className="">({courseDetail.courseReviewCount} Reviews)</p>
          </li>
          <li className="flex flex-col border-r-2 w-3/12 items-center">
            <h3 className="text-2xl font-semibold ">Categories</h3>
            <div className="text-center">
              {courseDetail?.courseCategory?.map((category, index) => (
                <span key={category.index}>{category} ・ </span>
              ))}
            </div>
          </li>
          <li className="flex flex-col w-3/12 items-center">
            <h3 className="text-2xl font-semibold">Flexible schedule</h3>
            <p className="">Learn at your own pace</p>
          </li>
        </ul>
      </div>
      <div className="px-16">
        <ul className="flex text-xl font-semibold gap-x-6 border-b-2 w-2/5 pb-3">
          <li
            className={`hover:bg-blue-100 p-3 rounded-sm hover:text-blue-600 cursor-pointer ${
              isSection == "About" ? "bg-blue-100 text-blue-600" : ""
            }`}
            onClick={scrollToAbout}
          >
            About
          </li>
          <li
            className={`hover:bg-blue-100 p-3 rounded-sm hover:text-blue-600 cursor-pointer ${
              isSection == "Modules" ? "bg-blue-100 text-blue-600" : ""
            }`}
            onClick={scrollToModules}
          >
            Modules
          </li>
          <li
            className={`hover:bg-blue-100 p-3 rounded-sm hover:text-blue-600 cursor-pointer ${
              isSection == "Reviews" ? "bg-blue-100 text-blue-600" : ""
            }`}
            onClick={scrollToReviews}
          >
            Reviews
          </li>
        </ul>
        <div className="my-4" ref={aboutRef}>
          <h3 className="text-3xl font-semibold">What you'll learn</h3>
          <p className="mt-3 text-xl">{courseDetail.courseDescription}</p>
        </div>
        <div className="my-8" ref={modulesRef}>
          <h3 className="text-3xl font-semibold">
            There are {courseDetail?.courseModules?.length} modules in this
            course
          </h3>
          <div className="flex gap-x-10 my-6">
            <div className="w-8/12 border-4 rounded-md px-6 pt-3 flex flex-col gap-y-4">
              {courseDetail?.courseModules?.map((moduleOverview, index) => {
                return (
                  <ModuleOverview
                    index={index}
                    key={moduleOverview._id}
                    exercises={moduleOverview.moduleExercises}
                    videoLessons={moduleOverview.moduleVideoLessons}
                    moduleDescription={moduleOverview.moduleDescription}
                    moduleTitle={moduleOverview.moduleTitle}
                  />
                );
              })}
            </div>
            <div className="w-4/12 border-4 rounded-md px-8 py-8 h-fit">
              <p className="text-3xl font-semibold">Instructor</p>
              <div className="mt-8 flex gap-x-6 items-center">
                <div>
                  <img
                    src={courseDetail?.courseInstructor?.avatarUrl}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </div>

                <div className="flex flex-col">
                  <p className="text-xl font-semibold">
                    {courseDetail?.courseInstructor?.username}
                  </p>
                  <p className="text-lg">
                    {courseDetail?.courseInstructor?.jobTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-x-14" ref={reviewsRef}>
          <div className="w-1/3">
            <h3 className="text-3xl font-semibold mb-10">Learner reviews</h3>
            <div className="flex items-center mb-10">
              <StarIcon color="primary" fontSize="large" />
              <p className="text-4xl font-semibold">
                {courseDetail.courseRatingAvg}
              </p>
              <p className="text-lg place-self-end ml-3">
                {courseDetail.courseReviewCount} Reviews
              </p>
            </div>
            <div className="">
              <div className="flex gap-3 items-center">
                <p className="font-semibold text-xl w-1/6">5 stars</p>
                <div className="bg-gray-200 h-2 w-2/3 rounded-full">
                  <div
                    className="bg-blue-700 h-2 rounded-full"
                    style={{ width: `${reviews?.rating?.fiveStar}%` }}
                  ></div>
                </div>
                <p className="font-semibold text-lg w-1/6 text-center">
                  {reviews?.rating?.fiveStar}%
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <p className="font-semibold text-xl w-1/6 ">4 stars</p>
                <div className="bg-gray-200 h-2 w-2/3 rounded-full">
                  <div
                    className="bg-blue-700 h-2 rounded-full"
                    style={{ width: `${reviews?.rating?.fourStar}%` }}
                  ></div>
                </div>
                <p className="font-semibold text-lg w-1/6 text-center">
                  {reviews?.rating?.fourStar}%
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <p className="font-semibold text-xl w-1/6 ">3 stars</p>
                <div className="bg-gray-200 h-2 w-2/3 rounded-full">
                  <div
                    className="bg-blue-700 h-2 rounded-full"
                    style={{ width: `${reviews?.rating?.threeStar}%` }}
                  ></div>
                </div>
                <p className="font-semibold text-lg w-1/6 text-center">
                  {reviews?.rating?.threeStar}%
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <p className="font-semibold text-xl w-1/6 ">2 stars</p>
                <div className="bg-gray-200 h-2 w-2/3 rounded-full">
                  <div
                    className="bg-blue-700 h-2 rounded-full"
                    style={{ width: `${reviews?.rating?.twoStar}%` }}
                  ></div>
                </div>
                <p className="font-semibold text-lg w-1/6 text-center">
                  {reviews?.rating?.twoStar}%
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <p className="font-semibold text-xl w-1/6 ">1 star</p>
                <div className="bg-gray-200 h-2 w-2/3 rounded-full">
                  <div
                    className="bg-blue-700 h-2 rounded-full"
                    style={{ width: `${reviews?.rating?.oneStar}%` }}
                  ></div>
                </div>
                <p className="font-semibold text-lg w-1/6 text-center">
                  {reviews?.rating?.oneStar}%
                </p>
              </div>
            </div>
          </div>
          <div className="w-2/3 flex flex-col gap-y-10 mb-10">
            <div className="text-xl">
              Showing {(reviews.pagination.currentPage - 1) * queryParams + reviews?.data?.length}/
              {courseDetail?.courseReviewCount}
            </div>
            {reviews?.data?.map((review) => (
              <Review
                key={review._id}
                avatarUrl={review.userId.avatarUrl}
                username={review.userId.username}
                reviewContent={review.reviewContent}
                createdAt={review.createdAt}
                star={review.ratingStar}
              />
            ))}
            {isMore && (
              <div
                className="text-xl ml-4 text-blue-700 font-semibold underline cursor-pointer"
                onClick={handleSeeMore}
              >
                See more
              </div>
            )}

          </div>
        </div>
      </div>
      {/* Popup Enroll */}
      {isEnrollPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-md shadow-md w-1/3">
            <h2 className="text-2xl font-semibold mb-4">Confirm Enrollment</h2>
            <p className="mb-6">
              Are you sure you want to enroll in{" "}
              <strong>{courseDetail.courseTitle}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCloseEnrollPopup}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Enrolled successfully!");
                  setIsEnrollPopupOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup Leave Review */}
      {isLeaveReviewOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-md shadow-md w-1/3">
            <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>
            <textarea
              value={newReview.content}
              onChange={(e) =>
                setNewReview({ ...newReview, content: e.target.value })
              }
              className="w-full border rounded-md p-3 mb-4"
              rows="4"
              placeholder="Write your review..."
            ></textarea>
            <div className="flex items-center mb-4">
              <p className="mr-4">Rating:</p>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`cursor-pointer ${
                    newReview.rating >= star
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                />
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCloseLeaveReview}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-4 py-2 bg-green-500 text-white rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;