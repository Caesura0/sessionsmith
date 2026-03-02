import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { pushToDrive, pullFromDrive } from "../utils/googleDriveSync";
import { exportAllAppData, importAllAppData } from "../utils/appDataSync";

interface AuthContextType {
    isLoggedIn: boolean;
    isSyncing: boolean;
    error: string | null;
    login: () => void;
    logout: () => void;
    pushData: () => Promise<void>;
    pullData: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem("notesmith_google_token");
        const expiresAt = localStorage.getItem("notesmith_google_token_expires");
        if (storedToken && expiresAt) {
            if (Date.now() < parseInt(expiresAt, 10)) {
                return storedToken;
            } else {
                localStorage.removeItem("notesmith_google_token");
                localStorage.removeItem("notesmith_google_token_expires");
            }
        }
        return null;
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setToken(tokenResponse.access_token);
            // Default Google Implicit flow tokens expire in 3600 seconds (1 hour)
            const expiresInMs = (tokenResponse.expires_in || 3600) * 1000;
            localStorage.setItem("notesmith_google_token", tokenResponse.access_token);
            localStorage.setItem("notesmith_google_token_expires", (Date.now() + expiresInMs).toString());
            setError(null);
        },
        onError: () => {
            setError("Google Login Failed");
        },
        scope: "https://www.googleapis.com/auth/drive.appdata"
    });

    const login = () => {
        setError(null);
        googleLogin();
    };

    const logout = () => {
        setToken(null);
        setError(null);
        localStorage.removeItem("notesmith_google_token");
        localStorage.removeItem("notesmith_google_token_expires");
    };

    const pushData = useCallback(async () => {
        if (!token) return;
        setIsSyncing(true);
        setError(null);
        try {
            const data = exportAllAppData();
            await pushToDrive(token, data);
        } catch (err: any) {
            setError(err.message || "Failed to push to Google Drive");
            if (err.message && err.message.includes('401')) {
                setToken(null);
                localStorage.removeItem("notesmith_google_token");
                localStorage.removeItem("notesmith_google_token_expires");
            }
        } finally {
            setIsSyncing(false);
        }
    }, [token]);

    const pullData = useCallback(async (): Promise<boolean> => {
        if (!token) return false;
        setIsSyncing(true);
        setError(null);
        try {
            const data = await pullFromDrive(token);
            if (data) {
                importAllAppData(data);
                return true;
            }
            return false;
        } catch (err: any) {
            setError(err.message || "Failed to pull from Google Drive");
            if (err.message && err.message.includes('401')) {
                setToken(null);
                localStorage.removeItem("notesmith_google_token");
                localStorage.removeItem("notesmith_google_token_expires");
            }
            return false;
        } finally {
            setIsSyncing(false);
        }
    }, [token]);

    // Setup Auto-Save with Debounce
    useEffect(() => {
        if (!token) return;

        let timeoutId: number;

        const handleAppDataChange = () => {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                console.log("Auto-saving to Google Drive...");
                pushData();
            }, 5000); // 5 second debounce
        };

        window.addEventListener('appDataChanged', handleAppDataChange);

        return () => {
            window.removeEventListener('appDataChanged', handleAppDataChange);
            clearTimeout(timeoutId);
        };
    }, [token, pushData]);

    return (
        <AuthContext.Provider value={{
            isLoggedIn: !!token,
            isSyncing,
            error,
            login,
            logout,
            pushData,
            pullData
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
