import { UserInterface } from "src/Interfaces/UserInterface";
import axios from "src/utils/axios";
import {
  API_GET_USERS,
  API_USER,
  API_USER_REGISTER,
} from "src/utils/constants";

// Get all users service
export const getUsersListService = async () => {
  const response = await axios.get(`${API_GET_USERS}`);
  return response.data;
};

// Update user service
export const updateUserService = async (userId: string, values) => {
  const response = await axios.put(`${API_USER}/${userId}`, values);
  return response.data;
};

// Delete user service
export const deleteUserService = async (user: UserInterface) => {
  const response = await axios.delete(`${API_USER}/${user.id}`);
  return response.data;
};

// Create user service
export const createUserService = async (values) => {
  const response = await axios.post(`${API_USER_REGISTER}`, values);
  return response.data;
};
