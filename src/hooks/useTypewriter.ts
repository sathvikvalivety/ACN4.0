import { useState, useEffect } from "react";

export default function useTypewriter(
  text: string,
  speed = 100,
  onComplete?: () => void,
  start = true
) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!start || !text) return;

    let i = 0;
    setDisplayed(""); // reset cleanly

    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1)); // ✅ slice ensures no skips
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, start]);

  return displayed;
}
