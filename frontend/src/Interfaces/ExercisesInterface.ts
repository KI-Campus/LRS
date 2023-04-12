import React from "react";
export interface ExercisesInterface {
  key: React.Key;
  name?: string;
  _id?: string;
  title?: string;
  type?: any;
  totalSubmissions?: number;
  averageScore?: number;
  averageScoreOutOf?: number;
}
