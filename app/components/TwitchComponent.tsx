"use client";

import { useState } from "react";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";

export default function ClientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    setIsPlaying((currentState) => !currentState);
  };

  let twitchStream =
    "https://player.twitch.tv/?channel=djaj2&parent=localhost&muted=false";

  const getUsernameFromUrl = (url: string) => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get("channel");
  };

  const username = getUsernameFromUrl(twitchStream);

  return (
    <div className="absolute top-4 left-4">
      {!isPlaying && (
        <button
          onClick={togglePlayback}
          className="play-button border-2 rounded-lg border-pink-500 p-2 bg-black text-green-500 hover:opacity-50"
        >
          <IconPlayerPlay />
        </button>
      )}
      {isPlaying && (
        <div>
          <button
            onClick={togglePlayback}
            className="play-button border-2 rounded-lg border-pink-500 p-2 bg-black text-green-500 hover:opacity-50"
          >
            <IconPlayerPause />
          </button>
          <iframe
            src={twitchStream}
            height="0"
            width="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            hidden
            data-tilt-gyroscope="false"
          ></iframe>
          <h1>
            Currently playing{" "}
            <a
              className="text-green-500 hover:text-black hover:bg-green-500 hover:border-pink-500 bg-black rounded p-2 border-2 border-pink-500"
              href={twitchStream}
              target="_blank"
            >
              {username}
            </a>
          </h1>
        </div>
      )}
    </div>
  );
}
