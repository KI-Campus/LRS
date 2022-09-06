import React, { ReactElement } from "react";
import { ChartOptions } from "chart.js";
import { GenericBarGraph } from "src/components/GenericBarGraph";
import { NO_OF_CHARS_TO_CONCAT_MCQ_ANSWERS_IN_CHART } from "src/utils/constants";

export default function ExerciseMCQGraph(props): ReactElement {
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
              return item._id.length >
                NO_OF_CHARS_TO_CONCAT_MCQ_ANSWERS_IN_CHART
                ? item.key +
                    "-" +
                    item._id.substring(
                      0,
                      NO_OF_CHARS_TO_CONCAT_MCQ_ANSWERS_IN_CHART
                    ) +
                    "..."
                : item.key + "-" + item._id;
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
      data={constructChartData(props.data, props.title, props)}
      options={options}
    />
  );
}
