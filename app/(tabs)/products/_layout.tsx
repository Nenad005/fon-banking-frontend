import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack>
      {/* This screen acts as the "Home" for the products tab. 
        We give it the same title as the tab and make sure the header shows.
      */}
      <Stack.Screen
        name="index"
        options={{
          title: "Proizvodi",
          // headerShown: true,
          // header: (props) => <Header title="Proizvodi" {...props} />,
        }}
      />

      {/* Nested screens automatically get a back button in a Stack.
        You can define them here to control their specific headers.
      */}
      <Stack.Screen
        name="account/[id]"
        options={{
          title: "Detalji Računa", // Customize as needed
          // headerShown is true by default in a Stack, so no need to declare it
        }}
      />

      <Stack.Screen
        name="card/[id]"
        options={{
          title: "Detalji Kartice",
        }}
      />
    </Stack>
  );
}
