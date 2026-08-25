import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BrowsePage from "./pages/BrowsePage";
import NameDetailPage from "./pages/NameDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import InfoPage from "./pages/InfoPage";
import LegalPage from "./pages/LegalPage";
import { SiteShell } from "./components/SiteShell";

/** Quiet Courtyard: moving from an archive slip into a name story always begins at the title and meaning, never at a carried-over scroll offset. */
function NameRouteScrollReset() {
  const [location] = useLocation();

  useEffect(() => {
    if (!location.startsWith("/name/")) return;
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    return () => window.cancelAnimationFrame(frame);
  }, [location]);

  return null;
}
function Router() {
  return (
    <SiteShell>
      <NameRouteScrollReset />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/boy-names"}>{() => <BrowsePage forcedGender="boy" />}</Route>
        <Route path={"/boy-names/:letter"}>{() => <BrowsePage forcedGender="boy" />}</Route>
        <Route path={"/girl-names"}>{() => <BrowsePage forcedGender="girl" />}</Route>
        <Route path={"/girl-names/:letter"}>{() => <BrowsePage forcedGender="girl" />}</Route>
        <Route path={"/name/:slug"} component={NameDetailPage} />
        <Route path={"/meaning/:meaning"}>{() => <BrowsePage mode="meaning" />}</Route>
        <Route path={"/origin/:origin"}>{() => <BrowsePage mode="origin" />}</Route>
        <Route path={"/quranic-names"}>{() => <BrowsePage mode="quranic" />}</Route>
        <Route path={"/unique-muslim-names"}>{() => <BrowsePage mode="unique" />}</Route>
        <Route path={"/search"}>{() => <BrowsePage mode="search" />}</Route>
        <Route path={"/favorites"} component={FavoritesPage} />
        <Route path={"/about"} component={InfoPage} />
        <Route path={"/sources"} component={InfoPage} />
        <Route path={"/privacy"} component={LegalPage} />
        <Route path={"/terms"} component={LegalPage} />
        <Route path={"/contact"} component={LegalPage} />
        <Route path={"/child-safety"} component={LegalPage} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </SiteShell>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
