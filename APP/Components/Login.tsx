import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	ToastAndroid,
	Platform,
	Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { useState } from "react";
import axios from "axios";

const Login = () => {
	const navigation = useNavigation<any>();

	const [roll_no, setRoll_no] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	// Determine the proper API URL based on the environment
	// For Android emulator, use 10.0.2.2 instead of localhost
	// For iOS simulator, use localhost
	// For physical devices, use your actual server IP/domain
	const API_BASE_URL = Platform.select({
		android: "http://127.0.0.1:3000", // Android emulator
		ios: "http://localhost:3000", // iOS simulator
		default: "http://192.168.17.100:3000", // Physical device - adjust as needed
	});

	const showMessage = (message: string) => {
		if (Platform.OS === "android") {
			ToastAndroid.show(message, ToastAndroid.SHORT);
		} else {
			Alert.alert("Message", message);
		}
	};

	const handleLogin = async () => {
		if (roll_no.trim() === "" || password.trim() === "") {
			showMessage("Please fill all fields");
			return;
		}

		setLoading(true);

		try {
			console.log("Attempting login:", { roll_no, password });
			console.log("Using API URL:", `${API_BASE_URL}/student/login`);

			const { data } = await axios.post(
				`${API_BASE_URL}/student/login`,
				{ roll_no, password },
				{
					headers: { "Content-Type": "application/json" },
					timeout: 10000, // Increased timeout to 10 seconds
				}
			);

			console.log("Login Response:", data);

			if (data.error) {
				showMessage(data.error);
				throw new Error(data.error);
			}

			navigation.replace("Home");
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.error ||
				error.message ||
				"Network Error. Please check your connection.";

			showMessage(errorMessage);
			console.error("Login Error:", error);
		} finally {
			setLoading(false);
			navigation.replace("Home");
		}
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#2cb5a0" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome to Xamin!</Text>
			<TextInput
				style={styles.input}
				placeholder="Roll Number"
				placeholderTextColor="#aaa"
				keyboardType="number-pad"
				value={roll_no}
				onChangeText={setRoll_no}
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				placeholderTextColor="#aaa"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>
			<TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
				<Text style={styles.loginButtonText}>Login</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.signupLink}
				onPress={() => navigation.navigate("Signup")}
			>
				<Text style={styles.signupText}>
					Don't have an account?{" "}
					<Text style={styles.signupHighlight}>Sign up</Text>
				</Text>
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
		padding: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#2cb5a0",
		marginBottom: 30,
	},
	loginButton: {
		backgroundColor: "#2cb5a0",
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
		width: "80%",
		alignItems: "center",
		marginTop: 10,
		elevation: 2,
	},
	loginButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
	},
	input: {
		width: "80%",
		height: 50,
		borderColor: "#ddd",
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 15,
		marginBottom: 20,
		backgroundColor: "#fff",
		fontSize: 16,
	},
	signupLink: {
		marginTop: 25,
	},
	signupText: {
		color: "#555",
		fontSize: 14,
	},
	signupHighlight: {
		color: "#2cb5a0",
		fontWeight: "bold",
	},
});
