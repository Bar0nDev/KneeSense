import Image from "next/image";
import React from "react";

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
}


const Avatar: React.FC<AvatarProps> = ({
	name,
	image = null,
	size = 64,
	className = "",
}) => {
	const dimension = `${size}px`;
	const getInitials = (fullName: string) => {
		if (!fullName) return "?";
		const words = fullName.trim().split(" ").filter(Boolean);
		if (words.length === 1) return words[0][0].toUpperCase();
		return (words[0][0] + words[words.length - 1][0]).toUpperCase();
	};
	const initials = getInitials(name);
	return (
		image ? (
			<div
				className={`relative rounded-full overflow-hidden shrink-0 shadow-sm ${className}`}
				style={{ width: dimension, height: dimension }}
			>
				<Image
					src={image}
					alt={name}
					fill
					className="object-cover"
					sizes={dimension}
				/>
			</div>
		) : (
			<div
				className={`flex items-center justify-center rounded-full text-[#FDFDFD] font-bold shrink-0 shadow-sm ${className}`}
				style={{
					width: dimension,
					height: dimension,
					fontSize: size * 0.35,
					background: "linear-gradient(135deg, #12606A, #30C3B1)"
				}}
				aria-label={name}
			>
				{initials}
			</div>
		)
	);
};

export default Avatar;
