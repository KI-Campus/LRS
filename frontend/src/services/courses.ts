import axios from "src/utils/axios";
import {
  API_GET_COURSES,
  API_GET_COURSE,
  API_GET_COURSE_SUBMISSIONS_BY_TIME,
  API_GET_COURSE_EXERCISE_TYPES_COUNTS,
  API_GET_ALL_COURSES_ADMIN,
} from "src/utils/constants";

export const getCoursesListService = async (consumer: string) => {
  const response = await axios.get(`${API_GET_COURSES}?consumer=${consumer}`);
  return response.data.result;
};

// Get course details
export const getCourseDetailsService = async (
  consumer: string,
  courseId: string,
  actor?: string
) => {
  // Construct query string
  let query = `${API_GET_COURSE}/${courseId}?consumer=${consumer}`;
  if (actor) {
    query += `&filters[xAPI.actor.name]=${actor}`;
  }

  const response = await axios.get(query);

  return response.data.result;
};

// Get Course Submissions By Time Service
export const getCourseSubmissionsOverTimeService = async (
  consumer: string,
  courseId: string,
  actor?: string
) => {
  // Construct query string
  let queryString = `/${courseId}?consumer=${consumer}`;
  if (actor) {
    queryString += `&filters[xAPI.actor.name]=${actor}`;
  }
  const response = await axios.get(
    `${API_GET_COURSE_SUBMISSIONS_BY_TIME}${queryString}`
  );

  return response.data.result;
};

// Get Course Exercise Types and their records/events counts
export const getCourseExerciseTypesCountsService = async (
  consumer: string,
  courseId: string,
  actor?: string
) => {
  // Construct query string
  let queryString = `/${courseId}?consumer=${consumer}`;
  if (actor) {
    queryString += `&filters[xAPI.actor.name]=${actor}`;
  }

  const response = await axios.get(
    `${API_GET_COURSE_EXERCISE_TYPES_COUNTS}${queryString}`
  );

  return response.data.result;
};

// Get All courses Admin endpoint
export const getAllCoursesAdminService = async () => {
  const response = await axios.get(`${API_GET_ALL_COURSES_ADMIN}`);
  return response.data.result;
};
