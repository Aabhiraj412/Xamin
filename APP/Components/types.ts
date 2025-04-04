import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
	Login: undefined;
	Home: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;
