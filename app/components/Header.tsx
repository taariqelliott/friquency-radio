"use client";

import { useMantineColorScheme, Button, MantineProvider } from "@mantine/core";

export default function Header() {
  const { setColorScheme, clearColorScheme } = useMantineColorScheme();

  const buttons = [
    { label: "light", onClick: () => setColorScheme("light") },
    { label: "dark", onClick: () => setColorScheme("dark") },
    { label: "auto", onClick: () => setColorScheme("auto") },
    { label: "clear", onClick: clearColorScheme },
  ];

  return (
    <MantineProvider>
      <div className="absolute z-10 text-white right-2 mt-2">
        <div className="flex flex-col gap-1">
          {buttons.map((button, index) => (
            <Button
              key={index}
              variant="gradient"
              gradient={{ from: "purple", to: "#dc7633", deg: 90 }}
              onClick={button.onClick}
              className="w-20 hover:opacity-50"
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>
    </MantineProvider>
  );
}
