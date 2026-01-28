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
            variant="filled"
            color="black"
            onClick={handleCopyURL}
            style={{ color: "white", border: "#2b7fff 2px solid" }}
            className="hover:opacity-65"
          >
            📋 Share
          </Button>
        </span>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="xs" className="text-center">
          Room URL Copied!
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
};

export default ShareButton;
