import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { AuthGuard } from "./components/layout/AuthGuard";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Editor } from "./pages/Editor";
import { Settings } from "./pages/Settings";
import { PromptSetup } from "./pages/PromptSetup";
import { Login } from "./pages/Login";

const GOOGLE_CLIENT_ID = "795078193322-dlh0d3un13s6a4ajhcpgtjarhucj53sh.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<AuthGuard />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="editor" element={<Editor />} />
                <Route path="prompt-setup" element={<PromptSetup />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
