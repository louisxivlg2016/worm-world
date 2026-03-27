"use dom";

import courseImg from "../../assets/course-bg.jpg";

export default function RaceImage({ dom }: { dom?: import("expo/dom").DOMProps }) {
  return (
    <img
      src={courseImg}
      style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
    />
  );
}
