"use client";

import { useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"; // Import Zego UIKit

const AudioStream = () => {
  useEffect(() => {
    // Function to get URL parameters
    function getUrlParams(url: string) {
      let urlStr = url.split("?")[1];
      const urlSearchParams = new URLSearchParams(urlStr);
      const result = Object.fromEntries(urlSearchParams.entries());
      return result;
    }

    // Generate a Token by calling a method.
    const roomID =
      getUrlParams(window.location.href)["roomID"] ||
      Math.floor(Math.random() * 10000) + "";
    const userID = Math.floor(Math.random() * 10000) + "";
    const userName = "userName" + userID;
    const appID = 1121934493;
    const serverSecret = "28484acab909019279b14111a001452b";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    // Assign different roles based on URL parameters
    let role: "Host" | "Audience" =
      (getUrlParams(window.location.href)["role"] as "Host" | "Audience") ||
      "Host";
    const liveRole =
      role === "Host" ? ZegoUIKitPrebuilt.Host : ZegoUIKitPrebuilt.Audience;

    let config: Record<string, boolean> = {};
    if (role === ZegoUIKitPrebuilt.Host) {
      config = {
        turnOnCameraWhenJoining: false,
        showMyCameraToggleButton: false,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: false,
        showTextChat: false,
        showUserList: false,
      };
    }

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: document.getElementById("root") as HTMLElement,
      scenario: {
        mode: ZegoUIKitPrebuilt.LiveStreaming,
        config: {
          role: liveRole,
        },
      },
      sharedLinks: [
        {
          name: "Join as an audience",
          url:
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?roomID=" +
            roomID +
            "&role=Audience",
        },
      ],
      ...config,
    });
  }, []); // Run this effect only once

  return (
    <div
      id="root"
      style={{
        width: "500px",
        height: "500px",
        display: "flex",
        justifyContent: "start",

      }}
    >
      {/* The UI Kit will render here */}
    </div>
  );
};

export default AudioStream;
