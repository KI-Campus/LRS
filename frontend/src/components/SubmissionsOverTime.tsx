import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import type { ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function SubmissionsOverTime(props) {
  const options: ChartOptions = {
    responsive: true,

    plugins: {
      legend: {
        display: false,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Submissions Over Time",
      },
    },
  };
  const constructChartData = (data: any) => {
    return {
      labels:
        data.length > 0
          ? data.map((item) => {
              return item._id;
            })
          : [],
      datasets: [
        {
          label: "Submissions Over Time",
          data: data.map((item) => item.submissions || 0),
          borderColor: "rgba(255, 99, 132, 1)",
          tension: 0.25,
        },
      ],
    };
  };

  // @ts-ignore
  return (
    <Line
      height={props.height ?? 100}
      options={options}
      data={constructChartData(props.data)}
    />
  );
}
