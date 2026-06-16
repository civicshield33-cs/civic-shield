import React from "react";
import Svg, { Path } from "react-native-svg";

export default function GambiaMap() {
  return (
    <Svg
      width="100%"
      height="180"
      viewBox="0 0 800 200"
    >
      <Path
        d="M20 100 C100 60 200 80 300 90
           C400 100 500 70 650 90
           C720 100 760 110 780 120
           C760 140 700 150 600 145
           C450 140 300 130 150 140
           C80 145 40 130 20 100 Z"
        fill="#22C55E"
        stroke="#166534"
        strokeWidth="3"
      />
    </Svg>
  );
}