import { ChartOptions } from "chart.js";
import React from "react";
import { GenericBarGraph } from "src/components/GenericBarGraph";
import { NO_OF_CHARS_TO_CONCAT_MCQ_ANSWERS_IN_CHART } from "src/utils/constants";

export default function ExerciseEventTypesGraph(props) {
  const options: ChartOptions = {
    responsive: true,

    plugins: {
      legend: {
        display: false,
        position: "top" as const,
      },
      title: {
        display: true,
        text: props.title,
      },
    },
  };

  const constructChartData = (
    data: Array<any>,
    title: string,
    props = null
  ) => {
    // Add random color to the data

    for (let i = 0; i < data.length; i++) {
      let randomRed = Math.floor(Math.random() * 255);
      let randomGreen = Math.floor(Math.random() * 255);
      let randomBlue = Math.floor(Math.random() * 255);

      data[
        i
      ].backgroundColor = `rgba(${randomRed}, ${randomGreen}, ${randomBlue}, 0.2)`;

      data[
        i
      ].borderColor = `rgba(${randomRed}, ${randomGreen}, ${randomBlue}, 1)`;
    }

    return {
      labels:
        data.length > 0
          ? data.map((item) => {
              // Convert "http://adlnet.gov/expapi/verbs/progressed" to "Progressed" by taking the last part of the url
              let label = item.title.split("/").pop();
              // Capitalize the first letter
              label = label.charAt(0).toUpperCase() + label.slice(1);
              return label;
            })
          : [],
      datasets: [
        {
          label: title,
          display: true,
          data: data.map((item) => item.count || 0),
          backgroundColor: data.map((item) => item.backgroundColor),
          borderColor: data.map((item) => item.borderColor),
          borderWidth: 1,
          tension: 0.3,
        },
      ],
    };
  };

  return (
    <GenericBarGraph
      title={props.title}
      options={options}
      data={constructChartData(props.data, props.title, props)}
    />
  );
}
