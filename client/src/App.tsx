import { Toaster } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import Storefront from "./pages/Storefront";

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <Storefront />
    </ErrorBoundary>
  );
}
