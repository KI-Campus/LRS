import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import type { ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const constructChartData = (
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
            return props.labelField
              ? item[props.labelField]
              : item.title || item?._id || "";
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

export function BarGraph(props) {
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

  // @ts-ignore
  return (
    <>
      <Bar
        height={props.height ?? 100}
        options={options}
        data={constructChartData(props.data, props.title, props)}
      />
    </>
  );
}
