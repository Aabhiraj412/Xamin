import { useNavigation } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import {
	AppState,
	BackHandler,
	ToastAndroid,
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Notifications from "expo-notifications";

const Home = () => {
	const navigation = useNavigation<any>();
	const [timeLeft, setTimeLeft] = useState(60);
	const [stateChangeCount, setStateChangeCount] = useState(0);
	const [isLocked, setIsLocked] = useState(false);
	const [loading, setLoading] = useState(true);
	const [pdfError, setPdfError] = useState(false);
	const webViewRef = useRef(null);
	const timerRef = useRef(null);

	// Block notifications
	useEffect(() => {
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: false,
				shouldPlaySound: false,
				shouldSetBadge: false,
			}),
		});

		return () => {
			Notifications.setNotificationHandler({
				handleNotification: async () => ({
					shouldShowAlert: true,
					shouldPlaySound: true,
					shouldSetBadge: true,
				}),
			});
		};
	}, []);

	const pdfSources = [
		"https://www.pdf995.com/samples/pdf.pdf", // Online PDF
	];

	const [currentSource, setCurrentSource] = useState(pdfSources[0]);


	// Timer and app state handling
	useEffect(() => {
		timerRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current);
					ToastAndroid.show(
						"Time's up! Returning to Home Page",
						ToastAndroid.SHORT
					);
					if (navigation.isFocused()) {
						navigation.reset({
							index: 0,
							routes: [{ name: "Login" }],
						})
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		const backAction = () => {
			ToastAndroid.show("Back button is disabled", ToastAndroid.SHORT);
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);

		const handleAppStateChange = (nextAppState: string) => {
			if (isLocked) {
				ToastAndroid.show("App is locked.", ToastAndroid.SHORT);
				setTimeout(() => BackHandler.exitApp(), 1000);
				return;
			}

			if (nextAppState === "inactive" || nextAppState === "background") {
				if (stateChangeCount === 0) {
					setTimeLeft((prev) => Math.max(0, prev - 5));
					setStateChangeCount(1);
					ToastAndroid.show(
						"Warning: Do not minimize the app! 5 seconds deducted",
						ToastAndroid.SHORT
					);
				} else if (stateChangeCount === 1) {
					ToastAndroid.show(
						"App is locked due to multiple minimizations.",
						ToastAndroid.SHORT
					);
					setIsLocked(true);
					setTimeout(() => BackHandler.exitApp(), 1000);
				}
			}
		};

		const appStateSubscription = AppState.addEventListener(
			"change",
			handleAppStateChange
		);

		return () => {
			clearInterval(timerRef.current);
			backHandler.remove();
			appStateSubscription.remove();
		};
	}, [stateChangeCount, isLocked, navigation]);

	return (
		<View style={styles.container}>
			<View style={styles.timerContainer}>
				<Text style={styles.timerText}>{timeLeft}s</Text>
			</View>
			<View style={styles.pdfContainer}>
				{pdfError ? (
					<View style={styles.errorContainer}>
						<Text style={styles.errorText}>Failed to load PDF</Text>
					</View>
				) : (
					<>
						{loading && (
							<View style={styles.loadingContainer}>
								<ActivityIndicator
									size="large"
									color="#0000ff"
								/>
								<Text style={styles.loadingText}>
									Loading PDF...
								</Text>
							</View>
						)}
						<WebView
							ref={webViewRef}
							source={{
								uri: `https://docs.google.com/viewer?url=${encodeURIComponent(
									currentSource
								)}`,
							}}
							style={styles.webView}
							onLoad={() => setLoading(false)}
							onError={() => setPdfError(true)}
						/>
					</>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	timerContainer: {
		position: "absolute",
		zIndex: 1,
		top: 10,
		right: 10,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		padding: 5,
		borderRadius: 5,
	},
	timerText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	pdfContainer: {
		flex: 1,
		marginTop: -50,
	},
	webView: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	pdfView: {
		flex: 1,
		width: "100%",
		height: "100%",
	},
	loadingContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		marginTop: 10,
		color: "#333",
	},
	errorContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	errorText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#d9534f",
	},
});

export default Home;
