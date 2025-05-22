import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 60, duration: 0.5 }}
      className="bg-background shadow-md flex justify-between items-center px-4 py-3"
    >
      <motion.div whileHover={{ scale: 1.05 }}>
        <Link to="/" className="no-underline text-primary text-base">
          <span className="text-[1.4rem]">🏠 Bilgo ChatBot</span>
        </Link>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-gray-500 sm:hidden md:flex lg:flex"
      >
        developed by Muhammad Hassan
      </motion.span>
    </motion.header>
  );
};

export default Header;
