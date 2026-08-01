/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { ArticlePage } from "./pages/ArticlePage";
import { Admin } from "./pages/Admin";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="article/:id" element={<ArticlePage />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
