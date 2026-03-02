import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Editor } from "./pages/Editor";
import { Settings } from "./pages/Settings";
import { PromptSetup } from "./pages/PromptSetup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="editor" element={<Editor />} />
          <Route path="prompt-setup" element={<PromptSetup />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
