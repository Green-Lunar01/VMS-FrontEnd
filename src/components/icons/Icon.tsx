import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";

export type IconProps = Omit<HugeiconsIconProps, "icon"> & {
  icon: HugeiconsIconProps["icon"];
};

export function Icon({ size = 20, strokeWidth = 1.75, color = "currentColor", ...props }: IconProps) {
  return <HugeiconsIcon size={size} strokeWidth={strokeWidth} color={color} {...props} />;
}
