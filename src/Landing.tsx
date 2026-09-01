import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import styles from "./Landing.module.css";
import type { Phone } from "./types";
import { LegalContent } from "./LegalContent";
import { LANDING_SUBPAGES, PAGE_META, type LandingPage } from "./pages/landing/types";
import { InicioPage } from "./pages/landing/InicioPage";
import { QuienesSomosPage } from "./pages/landing/QuienesSomosPage";
import { TiendaPage } from "./pages/landing/TiendaPage";
import { Header } from "./components/landing/Header";
import { Footer } from "./components/landing/Footer";
import { QuickViewModal } from "./components/landing/QuickViewModal";
import { useCatalogo } from "./hooks/useCatalogo";
import imgPasoSinFilas from "./assets/carrusel-sin-filas.webp";
import imgPorQue1 from "./assets/figma-card1.webp";
import imgPorQue2 from "./assets/figma-card2.webp";
import imgPorQue3 from "./assets/figma-card3.webp";
import logoColor from "./assets/movinex_color.webp";

interface LandingProps {
  onSelectPhone: (phone: Phone) => void;
  onNavigateAdmin: () => void;
  showAdminButton?: boolean;
}

export const Landing: React.FC<LandingProps> = ({
  onSelectPhone,
  onNavigateAdmin,
  showAdminButton = false,
}) => {
  const { page: pageParam } = useParams<{ page?: string }>();
  const navigate = useNavigate();
  const page: LandingPage = (LANDING_SUBPAGES as readonly string[]).includes(pageParam || "")
    ? (pageParam as LandingPage)
    : "inicio";
  const irA = (p: LandingPage) => navigate(p === "inicio" ? "/" : `/${p}`);

  const [selectedQuickView, setSelectedQuickView] = useState<Phone | null>(null);

  // Cargar catálogo de celulares desde el backend. También se pide en
  // "inicio" y "movinex", porque el banner "Último Celular" (compartido por
  // ambas páginas) muestra el primero del catálogo (el backend ya lo
  // devuelve ordenado por updated_at desc).
  const catalogoActivo = page === "tienda" || page === "inicio" || page === "movinex";
  const { phones, loading, fotosListas } = useCatalogo(catalogoActivo, page === "tienda");
  const ultimoCelular = phones[0];

  // Smooth scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleProcederCotizar = (phone: Phone) => {
    setSelectedQuickView(null);
    onSelectPhone(phone);
  };

  // State to track if all heavy main page images are loaded
  const [criticalImagesLoaded, setCriticalImagesLoaded] = useState(false);

  useEffect(() => {
    const criticalUrls = [logoColor, imgPasoSinFilas, imgPorQue1, imgPorQue2, imgPorQue3];

    let loadedCount = 0;
    const totalToLoad = criticalUrls.length;

    criticalUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalToLoad) setCriticalImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalToLoad) setCriticalImagesLoaded(true);
      };
    });
  }, []);

  const canonicalPath = page === "inicio" ? "" : page;

  return (
    <div className={styles.container}>
      <title>{PAGE_META[page].title}</title>
      <meta name="description" content={PAGE_META[page].description} />
      <link rel="canonical" href={`https://www.movinex.mx/${canonicalPath}`} />

      {/* Full Page Loader Overlay */}
      {!criticalImagesLoaded && (
        <div className={styles.pageLoaderOverlay}>
          <div className={styles.loaderContent}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      )}

      <Header page={page} irA={irA} showAdminButton={showAdminButton} onNavigateAdmin={onNavigateAdmin} />

      {page === "inicio" && <InicioPage ultimoCelular={ultimoCelular} activa={page === "inicio"} />}

      {page === "movinex" && <QuienesSomosPage ultimoCelular={ultimoCelular} />}

      {page === "tienda" && (
        <TiendaPage
          phones={phones}
          loading={loading}
          fotosListas={fotosListas}
          onVerDetalles={setSelectedQuickView}
        />
      )}

      {["privacidad", "terminos", "cookies", "envios"].includes(page) && (
        <LegalContent page={page as any} />
      )}

      {selectedQuickView && (
        <QuickViewModal
          phone={selectedQuickView}
          onClose={() => setSelectedQuickView(null)}
          onSolicitar={handleProcederCotizar}
        />
      )}

      <Footer irA={irA} />
    </div>
  );
};
