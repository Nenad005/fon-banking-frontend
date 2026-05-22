import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import { View } from "react-native";

export default function ContentHeader({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <View className={cn("", className)}>
      <Text className="text-3xl">{title}</Text>
      <Text className="font-inria-light text-lg">{subtitle}</Text>
    </View>
  );
}
