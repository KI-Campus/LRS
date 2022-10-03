import { ChartOptions } from "chart.js";
import React, { ReactElement } from "react";
import { GenericBarGraph } from "src/components/GenericBarGraph";
import {
  COLOR_CORRECT_ANSWER,
  COLOR_CORRECT_ANSWER_DARK,
  COLOR_WRONG_ANSWER,
  COLOR_WRONG_ANSWER_DARK,
} from "src/utils/constants";

export default function TrueFalseGraph(props): ReactElement {
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

    for (let i = 0; i < data?.length; i++) {
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
              return item.title;
            })
          : [],
      datasets: [
        {
          label: "Number of times submitted",
          display: true,
          data: data.map((item) => item.count || 0),
          backgroundColor: data.map((item) =>
            item.isCorrect ? COLOR_CORRECT_ANSWER : COLOR_WRONG_ANSWER
          ),
          borderColor: data.map((item) =>
            item.isCorrect ? COLOR_CORRECT_ANSWER_DARK : COLOR_WRONG_ANSWER_DARK
          ),
          borderWidth: 1,
          tension: 0.3,
        },
      ],
    };
  };

  return (
    <GenericBarGraph
      options={options}
      data={constructChartData(props.data, props.title, props)}
    />
  );
}
