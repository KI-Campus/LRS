import axios from "src/utils/axios";
import {
  API_GET_GLOBAL_STATS,
  API_GET_EXERCISES,
  API_GET_DOWNLOAD,
  API_GET_EXERCISE_DETAILS,
  API_GET_EXERCISE_SUBMISSIONS_BY_TIME,
  API_GET_MCQ_CHART,
  API_GET_TRUE_FALSE_CHART,
} from "src/utils/constants";

export const getGlobalStatsService = async () => {
  const response = await axios.get(`${API_GET_GLOBAL_STATS}`);
  return response.data.result;
};

export const getExercisesListService = async (
  consumerId: string,
  courseId: string,
  page: number,
  pageSize: number,
  ignoreSubExercises = true,
  exerciseTypeFilters: string[] = [],
  search: string = undefined
) => {
  let url = `${API_GET_EXERCISES}?consumer=${consumerId}&course=${courseId}&page=${page}&pageSize=${pageSize}`;
  if (ignoreSubExercises) {
    url += "&ignoreSubExercises=1";
  }
  // Include only the exercise types that are selected in the filter with inverted commas
  if (exerciseTypeFilters.length > 0) {
    url += `&exerciseTypeFilters=${JSON.stringify(exerciseTypeFilters)}`;
  }
  // Include the search text if it is not empty
  if (search) {
    url += `&search=${search}`;
  }
  const response = await axios.get(url);
  return response.data;
};

export const downloadService = async (
  consumerId: string = null,
  courseId: string = null,
  exerciseId: string = null,
  ignoreSubExercises = null,
  includeSimplifyRecords = null,
  includeRAWRecords = null
) => {
  let query = `${API_GET_DOWNLOAD}?`;

  if (consumerId) query += `consumer=${consumerId}&`;

  if (courseId) query += `course=${courseId}&`;

  if (exerciseId) query += `exercise=${exerciseId}&`;

  if (ignoreSubExercises) query += "&ignoreSubExercises=1";

  if (includeSimplifyRecords) query += "&includeSimplifyRecords=1";

  if (includeRAWRecords) query += "&includeRAWRecords=1";

  const response = await axios.get(query);
  return response.data;
};

export const getExerciseDetailsService = async (
  exerciseId: string,
  subExerciseId: string
) => {
  let query = `${API_GET_EXERCISE_DETAILS}/${exerciseId}`;
  if (subExerciseId) query += `/${subExerciseId}`;
  const response = await axios.get(query);
  return response.data.result;
};

// Get Exercise Submissions By Time Service
export const getExerciseSubmissionsOverTimeService = async (
  exerciseId: string,
  subExerciseId: string
) => {
  let query = `${API_GET_EXERCISE_SUBMISSIONS_BY_TIME}/${exerciseId}`;
  if (subExerciseId) {
    query += `/${subExerciseId}`;
  }
  const response = await axios.get(query);

  return response.data.result;
};

// Get Exercise Submissions By Time Service
export const getMCQChartService = async (
  exerciseId: string,
  subExerciseId: string
) => {
  let query = `${API_GET_MCQ_CHART}/${exerciseId}`;
  if (subExerciseId) {
    query += `/${subExerciseId}`;
  }
  const response = await axios.get(query);

  return response.data;
};

// Get True False
export const getTrueFalseChartService = async (
  exerciseId: string,
  subExerciseId: string
) => {
  let query = `${API_GET_TRUE_FALSE_CHART}/${exerciseId}`;
  if (subExerciseId) {
    query += `/${subExerciseId}`;
  }
  const response = await axios.get(query);

  return response.data;
};
