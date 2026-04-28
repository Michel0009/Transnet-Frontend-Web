import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css"; 
import "./TopLoader.css";
NProgress.configure({
  showSpinner: false,
  speed: 500,
  minimum: 0.2, 
  easing: "ease",
});
const TopLoader = () => {
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done(); 
    };
  }, []);

  return null;
};

export default TopLoader;
