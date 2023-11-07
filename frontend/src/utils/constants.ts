export const APP_NAME = "openLRS";
export const APP_VERSION = "v2";

export const API_ENDPOINT =
  process.env.NODE_ENV === "development" ? "http://localhost:4000/" : "/";
export const API_USER_LOGIN = "users/authenticate";
export const API_USER_CURRENT = "users/current";

export const API_GET_CONSUMERS = "consumers/getall";
export const API_CONSUMER = "consumers";
export const API_CONSUMER_REGISTER = "consumers/register";

export const API_GET_COURSES = "records/courses";
export const API_GET_COURSE = "records/course";
export const API_GET_COURSE_SUBMISSIONS_BY_TIME =
  "records/courseSubmissionsOverTime";

export const API_GET_COURSE_EXERCISE_TYPES_COUNTS =
  "records/courseExerciseTypesAndCount";

export const API_GET_EXERCISES = "records/exercises";
export const API_GET_EXERCISE_DETAILS = "records/exerciseDetails";
export const API_GET_EXERCISE_SUBMISSIONS_BY_TIME =
  "records/exerciseSubmissionsOverTime";
export const API_GET_MCQ_CHART = "records/mcqChart";

export const API_GET_TRUE_FALSE_CHART = "records/trueFalseChart";

export const API_GET_DOWNLOAD = "records/download";

export const API_GET_USERS = "users/getall";
export const API_USER = "users";
export const API_USER_REGISTER = "users/register";

export const API_GET_GLOBAL_STATS = "records/stats";
export const API_GET_ALL_COURSES_ADMIN = "records/coursesAdmin";

export const API_GET_ACTORS = "records/actors";
export const GET_ACTORS_PAGE_SIZE = 5;

export const NO_OF_CHARS_TO_CONCAT_MCQ_ANSWERS_IN_CHART = 25;

export const COLOR_CORRECT_ANSWER = "#0000ff99";
export const COLOR_WRONG_ANSWER = "#ff0000b3";

export const COLOR_CORRECT_ANSWER_DARK = "#0000ff";
export const COLOR_WRONG_ANSWER_DARK = "#ff0000";

export const TEXT_ACTORS_COUNT_MISINFORMATION =
  "The number of students in the system is not accurate. This is because the system has started to track students only from 10th November 2022. The number of students before that date is not accurate.";
