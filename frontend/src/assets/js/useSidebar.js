import { useEffect } from "react";

const useSidebarLogic = () => {
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    const wrapper = document.querySelector(".wrapper");
    const sidebarToggle = document.getElementById("toggle-sidebar");

    // Function to toggle sidebar minimize state
    const toggleSidebar = () => {
      if (wrapper.classList.contains("sidebar_minimize")) {
        wrapper.classList.remove("sidebar_minimize");
        sidebarToggle.innerHTML = '<i class="gg-menu-right"></i>';
      } else {
        wrapper.classList.add("sidebar_minimize");
        sidebarToggle.innerHTML = '<i class="gg-more-vertical-alt"></i>';
      }
    };

    // Function to handle hover events
    const handleMouseEnter = () => {
      if (wrapper.classList.contains("sidebar_minimize")) {
        wrapper.classList.add("sidebar_minimize_hover");
      }
    };

    const handleMouseLeave = () => {
      wrapper.classList.remove("sidebar_minimize_hover");
    };

    // Event listeners for toggle and hover functionality
    sidebarToggle.addEventListener("click", toggleSidebar);
    sidebar.addEventListener("mouseenter", handleMouseEnter);
    sidebar.addEventListener("mouseleave", handleMouseLeave);

    // Cleanup event listeners on component unmount
    return () => {
      sidebarToggle.removeEventListener("click", toggleSidebar);
      sidebar.removeEventListener("mouseenter", handleMouseEnter);
      sidebar.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
};

export default useSidebarLogic;
