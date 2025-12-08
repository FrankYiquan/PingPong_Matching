import { Platform } from "react-native";

const PORT = 4000; 

const LOCALHOST =
  Platform.OS === "android"
    ? `http://10.0.2.2:${PORT}`
    : `http://localhost:${PORT}`;

export const API_URL = process.env.EXPO_PUBLIC_API_URL || LOCALHOST;