import axios from "src/utils/axios";
import {
  API_GET_GLOBAL_STATS,
  API_GET_EXERCISES,
  API_GET_DOWNLOAD,
  API_GET_EXERCISE_DETAILS,
  API_GET_EXERCISE_SUBMISSIONS_BY_TIME,
  API_GET_MCQ_CHART,
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
  ignoreSubExercises = true
) => {
  let url = `${API_GET_EXERCISES}?consumer=${consumerId}&course=${courseId}&page=${page}&pageSize=${pageSize}`;
  if (ignoreSubExercises) {
    url += "&ignoreSubExercises=1";
  }
  const response = await axios.get(url);
  return response.data;
};

export const downloadService = async (
  consumerId: string = null,
  courseId: string = null,
  exerciseId: string = null,
  ignoreSubExercises = false,
  includeSimplifyRecords = true,
  includeRAWRecords = true
) => {
  let query = `${API_GET_DOWNLOAD}?`;

  if (consumerId) query += `consumer=${consumerId}&`;

  if (courseId) query += `course=${courseId}&`;

  if (exerciseId) query += `exercise=${exerciseId}&`;

  if (ignoreSubExercises) query += "&ignoreSubExercises=true";

  if (includeSimplifyRecords) query += "&includeSimplifyRecords=true";

  if (includeRAWRecords) query += "&includeRAWRecords=true";

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
