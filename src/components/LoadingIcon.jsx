import { motion } from "framer-motion";
import logo from "../assets/logo.png";

const LoadingIcon = () => {
  return (
    <div className="flex justify-center items-center animate-pulse">
      <motion.div
        initial={{ scale: 0, rotate: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1],
          rotate: [0, 360],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 0.3, // Lebih smooth
          times: [0, 0.3, 1], // Scale selesai di 40% durasi
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1, // Jeda **1 detik** sebelum animasi berulang lagi

          repeatType: "loop",
        }}>
        <img src={logo} width={40} alt="Elomate United Tractor" />
      </motion.div>
    </div>
  );
};

export default LoadingIcon;
