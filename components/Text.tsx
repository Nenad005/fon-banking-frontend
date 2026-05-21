import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";

interface CustomTextProps extends RNTextProps {
  className?: string;
}

export function Text({ className = "", style, ...props }: CustomTextProps) {
  return (
    <RNText
      className={`font-inria text-black ${className}`}
      style={style}
      {...props}
    />
  );
}
