import NavBar from "./components/NavBar";
import { AllRoutes } from "./routes/AllRoutes";
import { ThemeConfig } from "flowbite-react";

function App() {
  return (
    <div className="w-screen text-center">
      <ThemeConfig dark={false} />
      <NavBar />
      <AllRoutes />
    </div>
  );
}

export default App;
