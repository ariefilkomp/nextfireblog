import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";



const Transition = ({ children }) => {
    const { asPath } = useRouter();

    const variants = {
        out: {
          opacity: 0,
          y: 40,
          transition: {
            duration: 0.2
          }
        },
        in: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.2,
              delay: 0.3
            }
          }
      };

    return (
        <div className="effect-1">
            <AnimatePresence
                initial={false}
                mode="wait"
            >
                <motion.div
                    key={asPath}
                    variants={variants}
                    animate="in"
                    initial="out"
                    exit="out"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
  };
  
export default Transition;