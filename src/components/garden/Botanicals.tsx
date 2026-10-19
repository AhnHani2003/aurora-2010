export function Flower({
  color = "#e8a0af",
  className = "",
  variety = "daisy",
}: {
  color?: string;
  className?: string;
  variety?: "daisy" | "rose" | "tulip";
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 180"
      fill="none"
      aria-hidden="true"
    >
      <path d="M61 175Q52 124 63 63" stroke="#7d9275" strokeWidth="2" />
      <path
        d="M59 137Q17 119 30 99Q62 103 59 137M60 116Q98 94 97 78Q65 80 60 116"
        fill="#9baa86"
      />
      <g className="bloom" fill={color}>
        {variety === "tulip" ? (
          <>
            <path d="M30 36Q58 42 60 68Q65 42 89 36L86 65Q81 86 60 89Q34 82 32 63Z" />
            <path
              d="M60 22Q29 59 60 89Q92 58 60 22Z"
              fill={color}
              stroke="#fff6e844"
              strokeWidth="2"
            />
          </>
        ) : variety === "rose" ? (
          <>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse
                key={a}
                cx="60"
                cy="46"
                rx="21"
                ry="25"
                transform={`rotate(${a} 60 60)`}
              />
            ))}
            <path
              d="M40 56Q49 32 70 40Q91 48 78 68Q62 89 46 70Q32 57 53 48Q70 42 72 58Q71 72 57 66Q49 59 61 55"
              stroke="#fff4e977"
              strokeWidth="2"
            />
          </>
        ) : (
          <>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse
                key={a}
                cx="60"
                cy="37"
                rx="14"
                ry="26"
                transform={`rotate(${a} 60 60)`}
              />
            ))}
            <circle cx="60" cy="60" r="11" fill="#e9c177" />
            <circle cx="57" cy="57" r="3" fill="#fff1be" />
          </>
        )}
      </g>
    </svg>
  );
}
export function GardenDecor() {
  return (
    <div className="garden-decor" aria-hidden="true">
      <div className="sun-haze" />
      <div className="petal petal-one">❀</div>
      <div className="petal petal-two">✧</div>
      <div className="petal petal-three">♡</div>
      <div className="petal petal-four">✧</div>
      <div className="flower-bed left">
        {["#ecb4b9", "#f4dfba", "#d7b8d3", "#eaa0ae", "#fff4d2"].map((c, i) => (
          <Flower
            key={i}
            color={c}
            variety={i === 0 ? "rose" : i === 2 ? "tulip" : "daisy"}
            className={`stem stem-${i}`}
          />
        ))}
      </div>
      <div className="flower-bed right">
        {["#f1c8d5", "#fff4d2", "#eaa0ae", "#d5c7df", "#efc19e"].map((c, i) => (
          <Flower
            key={i}
            color={c}
            variety={i === 0 ? "rose" : i === 3 ? "tulip" : "daisy"}
            className={`stem stem-${i}`}
          />
        ))}
      </div>
      <div className="garden-ground" />
    </div>
  );
}
