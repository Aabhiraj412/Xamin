import { Button, StyleSheet, View, Text, TouchableOpacity, TextInput } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

const Login = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Login">>();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome Back!</Text>
			<TextInput style={styles.input} placeholder="Roll Number" placeholderTextColor="#aaa" />
			<TextInput
				style={styles.input}
				placeholder="Password"
				placeholderTextColor="#aaa"
				secureTextEntry
			/>
			<TouchableOpacity style={styles.loginButton} onPress={() => navigation.replace("Home")}>
				<Text style={styles.loginButtonText}>Login</Text>
			</TouchableOpacity>
		</View>
	);
};

export default Login;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#2cb5a0",
		marginBottom: 20,
	},
	loginButton: {
		backgroundColor: "#2cb5a0",
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
	},
	loginButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	input: {
		width: "80%",
		height: 40,
		borderColor: "#2cb5a0",
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		marginBottom: 15,
		backgroundColor: "#fff",
	},
});
