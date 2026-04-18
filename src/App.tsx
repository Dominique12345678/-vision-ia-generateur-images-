/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Download, Loader2, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Initialisation de l'IA (la clé est injectée par l'environnement)
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  
  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          }
        }
      });

      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        const imagePart = parts.find(part => part.inlineData);
        
        if (imagePart && imagePart.inlineData) {
          const base64Data = imagePart.inlineData.data;
          setGeneratedImage(`data:image/png;base64,${base64Data}`);
        } else {
          throw new Error("Aucune image n'a été générée dans la réponse.");
        }
      } else {
        throw new Error("Le modèle n'a pas renvoyé de résultat.");
      }
    } catch (err: any) {
      console.error("Erreur de génération:", err);
      setError("Une erreur est survenue lors de la génération de l'image. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `image-generee-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!showGenerator ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-6"
          >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400">
                    Propulsé par Gemini 2.5
                  </span>
                </div>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                  Transformez vos mots en Vision
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                  Générez des images haute fidélité instantanément. Une interface épurée pour donner vie à vos idées les plus audacieuses.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <button
                  onClick={() => setShowGenerator(true)}
                  className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-2xl shadow-emerald-500/20"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Commencer la création
                </button>
                <div className="flex -space-x-3 mt-4 sm:mt-0">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] bg-zinc-800 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${i + 123}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <div className="pl-4 text-xs text-zinc-500 font-medium">
                    +1.2k créations aujourd'hui
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Visual Elements */}
            <div className="absolute bottom-12 left-12 hidden lg:block">
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600 uppercase tracking-widest vertical-rl">
                <div className="w-px h-12 bg-zinc-800 mb-4" />
                Découvrez le futur
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col min-h-screen"
          >
            {/* Header */}
            <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
              <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <button 
                  onClick={() => setShowGenerator(false)}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <h1 className="text-lg font-semibold tracking-tight">Vision IA</h1>
                </button>
                <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest hidden sm:block">
                  Studio Créatif
                </div>
              </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full">
              <div className="grid lg:grid-cols-[1fr,400px] gap-12 items-start">
                
                {/* Left Column: Preview */}
                <section className="space-y-6">
                  <div className="aspect-square w-full bg-zinc-900/30 rounded-3xl border border-white/5 overflow-hidden relative group shadow-2xl backdrop-blur-sm">
                    <AnimatePresence mode="wait">
                      {generatedImage ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full"
                        >
                          <img 
                            src={generatedImage} 
                            alt="Image générée" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button 
                              onClick={downloadImage}
                              className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl"
                              title="Télécharger l'image"
                            >
                              <Download className="w-7 h-7" />
                            </button>
                          </div>
                        </motion.div>
                      ) : isGenerating ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <Sparkles className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                          </div>
                          <p className="text-zinc-400 text-sm font-medium animate-pulse tracking-wide">
                            Synthétisation de l'image...
                          </p>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-600">
                          <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 opacity-30" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-zinc-400">Prêt pour la création</p>
                            <p className="text-xs opacity-50 max-w-[200px]">Votre chef-d'œuvre apparaîtra ici</p>
                          </div>
                        </div>
                      )}
                    </AnimatePresence>

                    {error && (
                      <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-400/10 border border-red-500/20 rounded-2xl backdrop-blur-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">{error}</p>
                      </div>
                    )}
                  </div>

                  {generatedImage && (
                    <div className="flex justify-center">
                      <button 
                        onClick={downloadImage}
                        className="group flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-sm font-semibold border border-white/10"
                      >
                        <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        Télécharger en HD
                      </button>
                    </div>
                  )}
                </section>

                {/* Right Column: Controls */}
                <aside className="space-y-8 bg-zinc-900/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
                  <form onSubmit={generateImage} className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          Instruction
                        </label>
                        <span className="text-[10px] text-emerald-500/50 font-mono">IA PRÊTE</span>
                      </div>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Une métropole flottante au-dessus des nuages, art numérique hyper-détaillé..."
                        className="w-full h-48 bg-black/40 border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-zinc-800 leading-relaxed font-sans"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Rapport d'aspect
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['1:1', '16:9', '9:16'] as const).map((ratio) => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setAspectRatio(ratio)}
                            className={`py-3 text-[10px] font-bold rounded-xl border transition-all ${
                              aspectRatio === ratio 
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                                : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 text-sm uppercase tracking-wider"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          Progression...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Générer Vision
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                      <AlertCircle className="w-3 h-3" />
                      Recommandation
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed italic">
                      "Pour des résultats photoréalistes, incluez des termes comme 'éclairage volumétrique' ou '8k resolution' dans votre prompt."
                    </p>
                  </div>
                </aside>
              </div>
            </main>

            {/* Footer */}
            <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5 mt-auto w-full">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center border border-white/5">
                    <Sparkles className="w-3 h-3 text-zinc-500" />
                  </div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                    Vision IA &copy; 2026 / Architecture Système
                  </p>
                </div>
                <div className="flex gap-8">
                  <a href="#" className="text-[10px] text-zinc-600 hover:text-emerald-400 transition-colors uppercase tracking-widest font-mono">Confidentialité</a>
                  <a href="#" className="text-[10px] text-zinc-600 hover:text-emerald-400 transition-colors uppercase tracking-widest font-mono">Conditions</a>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
