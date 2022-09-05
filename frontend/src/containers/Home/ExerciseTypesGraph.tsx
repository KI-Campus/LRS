import React from "react";
import { GenericBarGraph } from "src/components/GenericBarGraph";
import type { ChartOptions } from "chart.js";
import { NO_OF_CHARS_TO_CONCAT_MCQ_ANSWERS_IN_CHART } from "src/utils/constants";

export default function ExerciseTypesGraph(props) {
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
              let label = item._id[0];
              // Convert http://h5p.org/libraries/H5P.LibraryName-versionNumber to LibraryName versionNumber
              if (label.includes("http://h5p.org/libraries/")) {
                label = label.replace("http://h5p.org/libraries/", "");
                label = label.replace(/-/g, " ");
              }
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

  return (
    <GenericBarGraph
      options={options}
      data={constructChartData(props.data, props.title, props)}
    />
  );
}
