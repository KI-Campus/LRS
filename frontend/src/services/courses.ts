import axios from "src/utils/axios";
import {
  API_GET_COURSES,
  API_GET_COURSE,
  API_GET_COURSE_SUBMISSIONS_BY_TIME,
  API_GET_COURSE_EXERCISE_TYPES_COUNTS,
} from "src/utils/constants";

export const getCoursesListService = async (consumer: string) => {
  const response = await axios.get(`${API_GET_COURSES}?consumer=${consumer}`);
  return response.data.result;
};

// Get course details
export const getCourseDetailsService = async (courseId: string) => {
  const response = await axios.get(`${API_GET_COURSE}/${courseId}`);
  return response.data.result;
};

// Get Course Submissions By Time Service
export const getCourseSubmissionsOverTimeService = async (courseId: string) => {
  const response = await axios.get(
    `${API_GET_COURSE_SUBMISSIONS_BY_TIME}/${courseId}`
  );
  return response.data.result;
};

// Get Course Exercise Types and their records/events counts
export const getCourseExerciseTypesCountsService = async (courseId: string) => {
  const response = await axios.get(
    `${API_GET_COURSE_EXERCISE_TYPES_COUNTS}/${courseId}`
  );
  return response.data.result;
};
