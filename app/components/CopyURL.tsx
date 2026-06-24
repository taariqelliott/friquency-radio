"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const ShareButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyURL = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      onClick={handleCopyURL}
      className="border-border text-foreground hover:opacity-65"
    >
      📋 {copied ? "Copied!" : "Share"}
    </Button>
  );
};

export default ShareButton;
