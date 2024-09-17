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
            gradient={{ from: "#ec4899", to: "", deg: 90 }}
            onClick={handleCopyURL}
            style={{ color: "white" }}
          >
            📋 Share
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
