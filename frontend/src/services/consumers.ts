import axios from "src/utils/axios";
import {
  API_GET_CONSUMERS,
  API_CONSUMER,
  API_CONSUMER_REGISTER,
} from "src/utils/constants";

export const getConsumersListService = async () => {
  const response = await axios.get(`${API_GET_CONSUMERS}`);
  return response.data.result;
};

// Update consumer service
export const updateConsumerService = async (id: string, values: any) => {
  const response = await axios.put(`${API_CONSUMER}/${id}`, values);
  return response.data.result;
};

// Delete consumer service
export const deleteConsumerService = async (id: string) => {
  const response = await axios.delete(`${API_CONSUMER}/${id}`);
  return response.data.result;
};

// Create consumer service
export const createConsumerService = async (values: any) => {
  const response = await axios.post(`${API_CONSUMER_REGISTER}`, values);
  return response.data.result;
};
