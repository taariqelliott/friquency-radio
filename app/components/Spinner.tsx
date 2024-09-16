import { MantineProvider } from "@mantine/core";
import "./Spinner.css";

export default function Spinner() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <span className="loader"></span>
    </MantineProvider>
  );
}
