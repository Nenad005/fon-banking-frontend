import { cn } from "@/lib/utils";
import React, { forwardRef, useEffect, useState } from "react";
import { Pressable, type PressableProps } from "react-native";
import Animated, {
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type AnimatedSwitchChangeEvent = {
  nativeEvent: {
    value: boolean;
  };
};

export type AnimatedSwitchProps = Omit<
  PressableProps,
  "accessibilityRole" | "accessibilityState" | "disabled" | "onPress"
> & {
  /** Controlled checked state. */
  value?: boolean;
  /** Initial checked state when the switch is uncontrolled. */
  defaultValue?: boolean;
  disabled?: boolean;
  /** Called with the next checked state. */
  onValueChange?: (value: boolean) => void;
  /** Native Switch-like change event. */
  onChange?: (event: AnimatedSwitchChangeEvent) => void;
  /** Classes applied to the visible track. */
  trackClassName?: string;
  /** Classes applied to the thumb. */
  thumbClassName?: string;
};

const ANIMATION_CONFIG = {
  duration: 180,
  reduceMotion: ReduceMotion.System,
} as const;

/**
 * An accessible, animated switch with controlled and uncontrolled modes.
 * The default active color uses the app's NativeWind `cmagenta` token.
 */
export const AnimatedSwitch = forwardRef<
  React.ElementRef<typeof Pressable>,
  AnimatedSwitchProps
>(function AnimatedSwitch(
  {
    value,
    defaultValue = false,
    disabled = false,
    onValueChange,
    onChange,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
    className,
    trackClassName,
    thumbClassName,
    hitSlop = 6,
    ...props
  },
  ref,
) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const isOn = isControlled ? value : internalValue;
  const progress = useSharedValue(isOn ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOn ? 1 : 0, ANIMATION_CONFIG);
  }, [isOn, progress]);

  const controlStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, 0.96]) },
    ],
  }));

  const activeTrackStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, 23]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.92]) },
    ],
  }));

  const handleToggle = () => {
    const nextValue = !isOn;

    if (!isControlled) setInternalValue(nextValue);

    onValueChange?.(nextValue);
    onChange?.({ nativeEvent: { value: nextValue } });
  };

  return (
    <Pressable
      ref={ref}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn, disabled }}
      className={cn("h-8 w-[52px] rounded-full", className)}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={handleToggle}
      onPressIn={(event) => {
        pressed.value = withTiming(1, ANIMATION_CONFIG);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withTiming(0, ANIMATION_CONFIG);
        onPressOut?.(event);
      }}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      {...props}
    >
      {isFocused && !disabled ? (
        <Animated.View
          pointerEvents="none"
          className="absolute -inset-1 rounded-full border-2 border-cmagenta/40"
        />
      ) : null}

      <Animated.View
        className={cn(
          "h-8 w-[52px] justify-center rounded-full bg-[#D9DEE3] py-[1px] px-[2px]",
          disabled && "opacity-40",
          trackClassName,
        )}
        style={controlStyle}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 rounded-full bg-cmagenta"
          style={activeTrackStyle}
        />
        <Animated.View
          pointerEvents="none"
          className={cn(
            "h-[25px] w-[25px] rounded-full border border-black/10 bg-white",
            thumbClassName,
          )}
          style={thumbStyle}
        />
      </Animated.View>
    </Pressable>
  );
});

AnimatedSwitch.displayName = "AnimatedSwitch";
