"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, MessageSquare, Zap, Shield, Brain, FileText, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { RabbitVideoLoader } from "./rabbit-video-loader"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function RabbitHomepage() {
  const router = useRouter()
  // Removed custom cursor and loader logic
  // VISUAL TEST CHECKPOINT: set to false to revert the stronger orbs + glass effect
  const VISUAL_TEST = true

  // Removed mouse tracking and loader timer

  return (
    <>
      <div className="min-h-screen bg-[#F6F5F2] font-mono overflow-y-auto overflow-x-hidden relative">
        {/* Static background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10" />

          {/* Static background orbs - reduced transparency */}
          <div
            className="absolute rounded-full"
            style={{
              width: VISUAL_TEST ? 280 : 150,
              height: VISUAL_TEST ? 280 : 150,
              background: VISUAL_TEST
                ? "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.40), rgba(0,0,0,0.12) 60%, transparent)"
                : "linear-gradient(45deg, #000000, #333333)",
              top: "10%",
              left: "20%",
              filter: VISUAL_TEST ? "blur(60px)" : undefined,
              opacity: VISUAL_TEST ? 1 : undefined,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: VISUAL_TEST ? 240 : 100,
              height: VISUAL_TEST ? 240 : 100,
              background: VISUAL_TEST
                ? "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.35), rgba(0,0,0,0.10) 60%, transparent)"
                : "linear-gradient(45deg, #000000, #333333)",
              top: "60%",
              right: "15%",
              filter: VISUAL_TEST ? "blur(55px)" : undefined,
              opacity: VISUAL_TEST ? 1 : undefined,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: VISUAL_TEST ? 260 : 120,
              height: VISUAL_TEST ? 260 : 120,
              background: VISUAL_TEST
                ? "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.32), rgba(0,0,0,0.08) 60%, transparent)"
                : "linear-gradient(45deg, #000000, #333333)",
              bottom: "20%",
              left: "10%",
              filter: VISUAL_TEST ? "blur(60px)" : undefined,
              opacity: VISUAL_TEST ? 1 : undefined,
            }}
          />

          {/* Static grid - slightly lighter during test so orbs read better */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: VISUAL_TEST
                ? "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)"
                : "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Glass overlay between background and content (testing) */}
        {VISUAL_TEST && (
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 5,
              backdropFilter: "blur(3px) saturate(120%)",
              WebkitBackdropFilter: "blur(3px) saturate(120%)",
              background: "rgba(255,255,255,0.08)",
            }}
          />
        )}

  {/* Removed custom cursor overlay */}

        {/* Hero Section - Increased spacing */}
  <section className="min-h-screen flex items-center justify-center px-6 py-20 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 text-black/80 text-sm mb-12 tracking-wide backdrop-blur-sm border border-black/10">
              <div className="w-2 h-2 bg-black rounded-full mr-3" />
              The Future of Document Intelligence
            </div>

            {/* Hero Title with Rabbit Lottie positioned exactly where the red dot is */}
            <div className="mb-16 relative">
              <div className="flex flex-col items-center justify-center">
                {/* Rabbit text */}
                <div className="mb-4">
                  <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-black leading-[0.85]">Rabbit</h1>
                </div>

                {/* PDF text with Lottie positioned exactly where the red dot is */}
                <div className="relative">
                  <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-black leading-[0.85]">PDF</h1>
                  {/* Rabbit Lottie positioned exactly where the red dot is in the image */}
                  <div className="absolute -right-12 md:-right-16 lg:-right-20 top-0 md:-top-2 lg:-top-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                      <DotLottieReact
                        src="https://lottie.host/41d0971c-d1c6-4f08-a29a-aefc83f45abb/PERTkoTdD2.lottie"
                        loop
                        autoplay
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-2xl md:text-3xl text-black/80 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              Transform any document into an intelligent conversation partner.{" "}
              <span className="text-black font-medium">Upload, analyze, and discover insights instantly.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-black text-white px-12 py-5 text-xl font-medium hover:bg-black/90 transition-all duration-300 group"
              >
                <span className="flex items-center">
                  Experience the Magic
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button className="border border-black/30 text-black px-12 py-5 text-xl font-medium hover:border-black/50 hover:bg-white/80 transition-all duration-300 backdrop-blur-sm">
                <span className="flex items-center">
                  <Upload className="w-6 h-6 mr-3" />
                  Try Demo
                </span>
              </button>
            </div>

            {/* AI Processing Demo without Rabbit Lottie */}
            <AIProcessingDemo />
          </div>
        </section>

        {/* Features Section - Increased spacing */}
        <section className="py-40 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-6xl md:text-7xl font-bold text-black mb-8">Revolutionary Intelligence</h2>
              <p className="text-2xl text-black/80 max-w-3xl mx-auto leading-relaxed">
                Experience document analysis like never before with cutting-edge AI technology.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <MessageSquare className="w-6 h-6" />,
                  title: "Natural Conversations",
                  description: "Ask questions in plain English and get intelligent, contextual responses instantly.",
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Lightning Analysis",
                  description:
                    "Process documents in under 2 seconds with 99.9% accuracy using advanced neural networks.",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Quantum Security",
                  description:
                    "Military-grade encryption with zero-knowledge architecture keeps your data absolutely private.",
                },
              ].map((feature, index) => (
                <div key={index} className="group cursor-pointer h-full">
                  <div className="bg-white/85 backdrop-blur-xl p-8 border border-black/10 hover:border-black/30 transition-all duration-500 hover:shadow-lg h-full">
                    <div className="w-14 h-14 bg-black text-white flex items-center justify-center mb-6 rounded-xl">
                      {feature.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-black mb-4">{feature.title}</h3>
                    <p className="text-black/80 leading-relaxed text-lg">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Showcase - Increased spacing */}
        <section className="py-40 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-6xl md:text-7xl font-bold text-black mb-8">See It In Action</h2>
              <p className="text-2xl text-black/80 max-w-3xl mx-auto">
                Watch how RabbitPDF transforms complex documents into interactive conversations.
              </p>
            </div>

            {/* Advanced AI Processing Demo without Rabbit Lottie */}
            <AdvancedProcessingDemo />
          </div>
        </section>

        {/* Technology Stats - Increased spacing */}
        <section className="py-40 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-6xl md:text-7xl font-bold text-black mb-8">Powered by Innovation</h2>
              <p className="text-2xl text-black/80 max-w-3xl mx-auto">
                Built on cutting-edge AI research and breakthrough technologies.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Neural Networks", value: "99.9%", subtitle: "Accuracy Rate" },
                { title: "Processing Speed", value: "2.3s", subtitle: "Average Response" },
                { title: "Languages", value: "50+", subtitle: "Supported" },
                { title: "Security", value: "256-bit", subtitle: "Encryption" },
              ].map((stat, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="bg-white/85 backdrop-blur-xl p-6 border border-black/10 text-center h-full hover:border-black/30 transition-all duration-300 hover:shadow-lg">
                    <div className="text-4xl font-bold text-black mb-2">{stat.value}</div>
                    <div className="text-lg font-semibold text-black mb-1">{stat.title}</div>
                    <div className="text-sm text-black/70">{stat.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Increased spacing */}
        <section className="py-40 px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-6xl md:text-7xl font-bold text-black mb-12">Ready to Transform?</h2>

            <p className="text-2xl text-black/80 mb-16 max-w-3xl mx-auto leading-relaxed">
              Join the future of document intelligence. Experience the magic of AI-powered conversations.
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="bg-black text-white px-16 py-6 text-2xl font-medium hover:bg-black/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center">
                Launch RabbitPDF
                <ArrowRight className="w-6 h-6 ml-4" />
              </span>
            </button>

            <div className="mt-12 text-lg text-black/70">Free forever • No credit card required • Instant access</div>
          </div>
        </section>

        {/* Footer - Increased spacing */}
        <footer className="py-20 px-6 border-t border-black/10 relative z-10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-black/70 text-sm">© 2024 RabbitPDF. Redefining Document Intelligence.</div>
          </div>
        </footer>
      </div>
    </>
  )
}

// AI Processing Demo Component without Rabbit Lottie
function AIProcessingDemo() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 3)
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="relative bg-white/90 backdrop-blur-xl border border-black/10 rounded-2xl p-8 shadow-lg">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <motion.div
              className="flex items-center space-x-3 p-4 bg-[#F6F5F2]/80 rounded-xl border border-black/10"
              animate={{ scale: stage === 0 ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <FileText className="w-6 h-6 text-black" />
              <span className="text-black">Research Paper.pdf</span>
              {stage === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className="p-4 bg-black/15 rounded-xl border border-black/25"
              animate={{ scale: stage === 1 ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-black text-sm">"What are the key findings in this research?"</p>
              {stage === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center space-x-2"
                >
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-black rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-black/70">AI is thinking...</span>
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {stage === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 bg-white rounded-xl border border-black/10 shadow-sm"
                >
                  <div className="flex items-start space-x-3">
                    <motion.div
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      <Brain className="w-5 h-5 text-black mt-1" />
                    </motion.div>
                    <div className="text-sm text-black">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-medium mb-1"
                      >
                        AI Analysis Complete
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-black/80"
                      >
                        Found 3 key findings with 94% confidence...
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {stage < 2 && (
              <motion.div
                className="p-4 bg-gray-200 rounded-xl border border-gray-300"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-400 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-400 rounded w-3/4" />
                    <div className="h-2 bg-gray-300 rounded w-1/2" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Advanced Processing Demo Component without Rabbit Lottie
function AdvancedProcessingDemo() {
  const [processingStage, setProcessingStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setProcessingStage((prev) => (prev + 1) % 4)
    }, 4000)

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2))
    }, 80)

    return () => {
      clearInterval(stageTimer)
      clearInterval(progressTimer)
    }
  }, [])

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="bg-black rounded-2xl p-8 shadow-xl overflow-hidden relative">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {/* Processing Stage */}
            <motion.div
              className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30"
              animate={{
                borderColor: processingStage === 0 ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.3)",
                backgroundColor: processingStage === 0 ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.2)",
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    scale: processingStage === 0 ? [1, 1.2, 1] : 1,
                    opacity: processingStage === 0 ? [1, 0.8, 1] : 0.8,
                  }}
                  transition={{ duration: 1, repeat: processingStage === 0 ? Number.POSITIVE_INFINITY : 0 }}
                />
                <span className="text-white/90 text-sm">
                  {processingStage === 0 ? "Processing Document..." : "Document Processed"}
                </span>
                {processingStage === 0 && (
                  <motion.div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </motion.div>
                )}
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    animate={{ width: processingStage === 0 ? `${progress}%` : "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <motion.p
                  className="text-white/80 text-xs"
                  animate={{ opacity: processingStage === 0 ? [1, 0.6, 1] : 1 }}
                  transition={{ duration: 1.5, repeat: processingStage === 0 ? Number.POSITIVE_INFINITY : 0 }}
                >
                  {processingStage === 0 ? `Analyzing 247 pages... ${Math.round(progress)}%` : "Analysis complete"}
                </motion.p>
              </div>
            </motion.div>

            {/* AI Insights Stage */}
            <motion.div
              className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30"
              animate={{
                borderColor: processingStage >= 1 ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.3)",
                backgroundColor: processingStage >= 1 ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.2)",
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  animate={{
                    y: processingStage >= 1 ? [-3, 3, -3] : 0,
                    scale: processingStage === 1 ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    y: {
                      duration: 2.5,
                      repeat: processingStage >= 1 ? Number.POSITIVE_INFINITY : 0,
                      ease: "easeInOut",
                    },
                    scale: {
                      duration: 1.5,
                      repeat: processingStage === 1 ? Number.POSITIVE_INFINITY : 0,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <Brain className="w-6 h-6 text-white mt-1" />
                </motion.div>
                <div>
                  <motion.p
                    className="text-white font-medium mb-2"
                    animate={{ opacity: processingStage >= 1 ? 1 : 0.6 }}
                  >
                    {processingStage >= 2 ? "AI Insights Ready" : "Generating Insights..."}
                  </motion.p>
                  <AnimatePresence mode="wait">
                    {processingStage >= 2 ? (
                      <motion.p
                        key="complete"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white/80 text-sm"
                      >
                        Extracted 15 key concepts, 8 data points, and 3 actionable recommendations.
                      </motion.p>
                    ) : processingStage === 1 ? (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2"
                      >
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-white rounded-full"
                              animate={{ y: [0, -6, 0] }}
                              transition={{
                                duration: 0.8,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-white/80 text-sm">Analyzing patterns...</span>
                      </motion.div>
                    ) : (
                      <motion.p key="waiting" className="text-white/50 text-sm">
                        Waiting for document processing...
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              animate={{
                scale: processingStage >= 3 ? 1 : 0.95,
                opacity: processingStage >= 3 ? 1 : 0.8,
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-black" />
                  <span className="text-black font-medium">Financial Report Q3.pdf</span>
                </div>

                <div className="bg-[#F6F5F2] rounded-xl p-4">
                  <p className="text-black text-sm mb-2">"What was the revenue growth this quarter?"</p>
                </div>

                <AnimatePresence mode="wait">
                  {processingStage >= 3 ? (
                    <motion.div
                      key="answer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/15 rounded-xl p-4 border border-black/25"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-black text-sm font-medium mb-1"
                      >
                        Revenue increased by 23.4% QoQ
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-black/70 text-xs"
                      >
                        Found on pages 12, 15, and 28
                      </motion.p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="loading"
                      className="bg-gray-200 rounded-xl p-4 border border-gray-300"
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-400 rounded w-3/4" />
                        <div className="h-2 bg-gray-300 rounded w-1/2" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Processing indicator overlay without rabbit Lottie */}
            {processingStage < 3 && (
              <motion.div
                className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm">Processing...</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
