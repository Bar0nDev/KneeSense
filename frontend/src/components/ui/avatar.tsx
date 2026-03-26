type AvatarProps = {
  name: string;
  subtext?: string;
  imgUrl?: string;
  size?: number;
  textColor?: string;
  bgColor?: string;
  reverse?: boolean;  // text on left, circle on right
};

export default function Avatar({
  name,
  subtext,
  imgUrl,
  size = 40,
  textColor = "#12606A",
  bgColor = "#EFF1FE",
  reverse = false,
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "'DM Sans', sans-serif", flexDirection: reverse ? "row-reverse" : "row" }}>
      {/* Circle */}
      <div style={{ width: size, height: size, borderRadius: "999px", backgroundColor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        {imgUrl ? (
          <img src={imgUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: size * 0.3, fontWeight: 700, color: textColor }}>
            {initials}
          </span>
        )}
      </div>

      {/* Name + subtext */}
      {(name || subtext) && (
        <div style={{ textAlign: reverse ? "right" : "left" }}>
          {name && (
            <div style={{ fontSize: "17px", fontWeight: 700, color: textColor, lineHeight: 1.2 }}>
              {name}
            </div>
          )}
          {subtext && (
            <div style={{ fontSize: "15px", color: textColor, opacity: 0.6, lineHeight: 1.2 }}>
              {subtext}
            </div>
          )}
        </div>
      )}
    </div>
  );
}