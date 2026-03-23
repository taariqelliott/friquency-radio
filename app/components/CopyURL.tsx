"use client";

import { Button, Popover, Text } from "@mantine/core";

const ShareButton = () => {
  const handleCopyURL = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  return (
    <Popover width={200} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <span>
          <Button variant="light" color="blue" onClick={handleCopyURL} radius="xl">
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
