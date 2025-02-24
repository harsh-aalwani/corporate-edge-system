import React from "react";
import { Navigation } from "../../components/Guest/navigation";
import Footer from "../../components/Guest/Footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
