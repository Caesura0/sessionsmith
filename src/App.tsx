import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthGuard } from "./components/layout/AuthGuard";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Editor } from "./pages/Editor";
import { PromptSetup } from "./pages/PromptSetup";
import { VisualThemes } from "./pages/VisualThemes";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { TemplateEditor } from "./pages/TemplateEditor";
import { Toaster } from 'sonner';
import { GlobalConfirmModal } from './components/GlobalConfirmModal';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<AuthGuard />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="editor" element={<Editor />} />
                  <Route path="prompt-setup" element={<PromptSetup />} />
                  <Route path="visual-themes" element={<VisualThemes />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="template" element={<TemplateEditor />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
        <Toaster theme="dark" position="bottom-right" />
        <GlobalConfirmModal />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
