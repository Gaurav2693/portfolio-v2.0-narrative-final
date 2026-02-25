import { RouterProvider } from "react-router";
import { router } from "./routes";

// Main application – React Router v7 (v4 logo spinner loaders)
export default function App() {
  return <RouterProvider router={router} />;
}