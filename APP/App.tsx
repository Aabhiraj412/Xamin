import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./Components/Login";
import Home from "./Components/Home";

const Stack = createStackNavigator<any>();

const App: React.FC =() => {
  

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2cb5a0", // Set the background color of the nav bar
          },
          headerTintColor: "#fff", // Set the color of the title and back button
          headerTitleStyle: {
            fontWeight: "bold", // Optionally customize the font style of the title
          },
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
