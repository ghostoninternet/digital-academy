import React, { useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import formatDate from "../helpers/formatDate";
import PropTypes from "prop-types";
import deleteCourseReview from "../apis/review/deleteCourseReview";
import updateCourseReview from "../apis/review/updateCourseReview";
import getCourseDetail from "../apis/course/getCourseDetail";

const Review = ({ avatarUrl, username, reviewContent, createdAt, star, reviewId, onDelete, onUpdate, courseId, setCourseDetail }) => { 
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(reviewContent);
  const [editedStar, setEditedStar] = useState(star);

  const handleDelete = async () => {
    try {
      const response = await deleteCourseReview(reviewId);
      if (response.success) {
        onDelete(reviewId);
      } else {
        alert("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await updateCourseReview(reviewId, { reviewContent: editedContent, ratingStar: editedStar });
      onUpdate(reviewId, editedContent, editedStar);
      setEditedContent(editedContent);
      setEditedStar(editedStar);
      alert("Review updated successfully!"); // Success notification

      // Fetch updated course details to update courseRatingAvg
      const updatedCourseDetails = await getCourseDetail(courseId);
      setCourseDetail(updatedCourseDetails);
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex gap-x-14 p-8 border-2 rounded-md relative">
      <div className="flex flex-col items-center gap-x-2 w-1/6 justify-center">
        <img src={avatarUrl} width={50} className="rounded-full" alt="User Avatar" />
        <h3 className="text-2xl text-center">{username}</h3>
      </div>
      <div className="w-5/6">
        <div className="flex items-center mb-4">
          {isEditing ? (
            <div className="flex gap-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <StarIcon
                  key={value}
                  color={value <= editedStar ? "primary" : "disabled"}
                  onClick={() => setEditedStar(value)}
                  className="cursor-pointer"
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center">
              <p className="font-semibold text-xl">{star}</p>
              <StarIcon color="primary" />
            </div>
          )}
          <p className="ml-3">Reviewed on {formatDate(createdAt)}</p>
        </div>
        {isEditing ? (
          <textarea
            className="w-full border rounded-md p-2 text-lg"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        ) : (
          <p className="text-lg">{reviewContent}</p>
        )}
      </div>
      <div className="absolute top-4 right-4 flex gap-x-2">
        {isEditing ? (
          <button
            className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={handleUpdate}
          >
            Save
          </button>
        ) : (
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setIsEditing(true)}
          >
            <EditIcon color="primary" />
          </button>
        )}
        <button
          className="p-2 rounded-full hover:bg-red-100"
          onClick={handleDelete}
        >
          <CloseIcon color="error" />
        </button>
      </div>
    </div>
  );
};

Review.propTypes = {
  avatarUrl: PropTypes.string,
  username: PropTypes.string,
  reviewContent: PropTypes.string,
  createdAt: PropTypes.string,
  star: PropTypes.number,
  reviewId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired, 
  setCourseDetail: PropTypes.func.isRequired, 
};

export default Review;