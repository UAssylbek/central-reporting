// frontend/src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./app/router/AppRouter";
import { AppProviders } from "./app/providers/AppProviders";

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
