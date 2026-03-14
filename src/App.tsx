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
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Vision IA</h1>
          </div>
          <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
            Propulsé par Gemini
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr,400px] gap-12 items-start">
          
          {/* Left Column: Preview */}
          <section className="space-y-6">
            <div className="aspect-square w-full bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden relative group">
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
                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl"
                        title="Télécharger l'image"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ) : isGenerating ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="text-zinc-400 text-sm font-medium animate-pulse">
                      Création de votre chef-d'œuvre...
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-600">
                    <ImageIcon className="w-16 h-16 opacity-20" />
                    <p className="text-sm max-w-[200px] text-center">
                      Votre image apparaîtra ici après la génération
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {error && (
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-md flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="flex justify-center">
                <button 
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-sm font-medium border border-white/5"
                >
                  <Download className="w-4 h-4" />
                  Télécharger l'image
                </button>
              </div>
            )}
          </section>

          {/* Right Column: Controls */}
          <aside className="space-y-8">
            <form onSubmit={generateImage} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Description de l'image
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Un paysage futuriste avec des montagnes de cristal et un ciel violet..."
                  className="w-full h-40 bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1:1', '16:9', '9:16'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        aspectRatio === ratio 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                          : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20'
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
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Générer l'image
                  </>
                )}
              </button>
            </form>

            <div className="p-6 bg-zinc-900/30 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-semibold">Conseils</h3>
              <ul className="space-y-3 text-xs text-zinc-500 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  Soyez précis sur les couleurs, l'éclairage et le style artistique.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  Mentionnez des détails comme "haute résolution" ou "cinématique".
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  Évitez les descriptions trop vagues pour de meilleurs résultats.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-zinc-600">
            &copy; 2026 Vision IA. Tous droits réservés.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Confidentialité</a>
            <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Conditions d'utilisation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
