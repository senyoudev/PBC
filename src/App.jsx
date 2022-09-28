import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header/Header";
import CreateEvent from "./pages/CreateEvent";
import Events from "./pages/Events";
import EventPage from "./pages/EventPage";
import RequestsPage from "./pages/RequestsPage";
import HomeScreen from "./pages/HomeScreen";
import WalletInformations from "./pages/WalletInformations";
import NotFoundScreen from "./pages/NotFoundScreen";
import { Web3ReactProvider } from "@web3-react/core";
import { injected } from "./components/Connectors";
import Web3 from "web3";
import "./index.css";
import Faq from "./pages/Faq";



function App() {
  function getLibrary(provider) {
    return new Web3(provider);
  }

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <BrowserRouter>
        <Header />
        <div className="main">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/CreateEvent" element={<CreateEvent />} />
            <Route path="/Events" element={<Events />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/Requests/:id" element={<RequestsPage />} />
            <Route path="/Events/:id" element={<EventPage />} />
            <Route path="/WalletInformations" element={<WalletInformations />} />
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </div>
        {/* <Footer /> */}
      </BrowserRouter>
    </Web3ReactProvider>
  );
}

export default App;
