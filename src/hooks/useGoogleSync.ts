import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { pushToDrive, pullFromDrive } from "../utils/googleDriveSync";
import { exportAllAppData, importAllAppData } from "../utils/appDataSync";

export function useGoogleSync() {
    const [token, setToken] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            setToken(tokenResponse.access_token);
            setError(null);
        },
        onError: () => {
            setError("Google Login Failed");
        },
        scope: "https://www.googleapis.com/auth/drive.appdata"
    });

    const handleLogin = () => {
        setError(null);
        login();
    };

    const logout = () => {
        setToken(null);
        setError(null);
    };

    const pushData = async () => {
        if (!token) {
            setError("You must be logged in to sync.");
            return;
        }

        setIsSyncing(true);
        setError(null);
        try {
            const data = exportAllAppData();
            await pushToDrive(token, data);
        } catch (err: any) {
            setError(err.message || "Failed to push to Google Drive");
            if (err.message && err.message.includes('401')) {
                setToken(null); // token expired
            }
        } finally {
            setIsSyncing(false);
        }
    };

    const pullData = async (): Promise<boolean> => {
        if (!token) {
            setError("You must be logged in to sync.");
            return false;
        }

        setIsSyncing(true);
        setError(null);
        try {
            const data = await pullFromDrive(token);
            if (data) {
                importAllAppData(data);
                return true;
            } else {
                setError("No backup found in Google Drive.");
                return false;
            }
        } catch (err: any) {
            setError(err.message || "Failed to pull from Google Drive");
            if (err.message && err.message.includes('401')) {
                setToken(null); // token expired
            }
            return false;
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        isLoggedIn: !!token,
        isSyncing,
        error,
        handleLogin,
        logout,
        pushData,
        pullData
    };
}
