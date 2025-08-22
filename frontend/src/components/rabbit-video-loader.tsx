"use client"

import { motion } from "framer-motion"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function RabbitVideoLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-[#F6F5F2] flex items-center justify-center"
    >
      <div className="text-center">
        {/* Rabbit Lottie with fallback */}
        <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          <DotLottieReact
            src="https://lottie.host/41d0971c-d1c6-4f08-a29a-aefc83f45abb/PERTkoTdD2.lottie"
            loop
            autoplay
          />
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold text-black">RabbitPDF</h2>
          <p className="text-black/80 text-lg">Loading your document intelligence...</p>

          {/* Loading Bar */}
          <div className="w-64 h-1 bg-black/20 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-black rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
