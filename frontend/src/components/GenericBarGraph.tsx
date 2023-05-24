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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function GenericBarGraph(props) {
  // @ts-ignore
  return (
    <>
      <Bar
        height={props.height ?? 100}
        options={props.options}
        data={props.data}
      />
    </>
  );
}
