"use client";

import { Popover, Text, Button } from "@mantine/core";

const ShareButton = () => {
  const handleCopyURL = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  return (
    <Popover width={200} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <span>
          <Button
            variant="gradient"
            gradient={{ from: "teal", to: "grape", deg: 90 }}
            onClick={handleCopyURL}
            style={{ color: "#f472b6" }}
          >
            📋 share
          </Button>
        </span>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="xs">Room URL Copied!</Text>
      </Popover.Dropdown>
    </Popover>
  );
};

export default ShareButton;
