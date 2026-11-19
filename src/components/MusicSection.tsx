import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Music, Play, X } from "lucide-react";
import { loadSongs, trackActivity } from "../lib/storage";
import { Song } from "../types";

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function MusicSection() {
  const [songsList, setSongsList] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);

  const fetchSongs = () => {
    loadSongs().then(setSongsList);
  };

  useEffect(() => {
    fetchSongs();

    const handleSync = () => {
      fetchSongs();
    };

    window.addEventListener("portfolio-data-updated", handleSync);
    return () => {
      window.removeEventListener("portfolio-data-updated", handleSync);
    };
  }, []);

  const handleTrackSongPlay = (song: Song) => {
    trackActivity("live_click", `YouTube recommendation tune play: ${song.title} by ${song.artist}`);
    setActiveSong(song);
  };

  return (
    <section
      id="music"
      className="relative w-full py-[160px] bg-[#0B0B12] overflow-hidden border-b border-white/5"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Horizontal Swiper/Grid Container */}
        <div className="w-full overflow-x-auto pb-8 scrollbar-hide flex gap-6 snap-x snap-mandatory">
          <div className="flex gap-6 mx-auto">
            {songsList.map((song, index) => (
              <motion.button
                key={song.id}
                onClick={() => handleTrackSongPlay(song)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="snap-center shrink-0 w-[240px] md:w-[280px] group cursor-pointer block text-left"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square rounded-[20px] overflow-hidden shadow-lg border border-white/5 bg-[#171721] transition-transform duration-500 group-hover:scale-[1.03]">
                  <img
                    src={song.coverUrl}
                    alt={`${song.title} by ${song.artist}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400";
                    }}
                  />
                  
                  {/* Glassmorphic Play Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-4">
                    <div className="w-14 h-14 rounded-full bg-[#F4EEE8] text-black flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-500">
                      <Play className="w-6 h-6 fill-black ml-1" />
                    </div>
                    
                    <span className="text-[#F4EEE8] font-bold text-center mt-4 text-base tracking-wide line-clamp-1 px-2">
                      {song.title}
                    </span>
                    <span className="text-[#A3A3AA] text-xs text-center mt-1 font-light tracking-wide">
                      {song.artist}
                    </span>
                  </div>
                </div>

                {/* Subtitle Details below cover for quick view */}
                <div className="mt-4 px-2 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="truncate">
                    <h4 className="text-[#F4EEE8] font-semibold text-sm truncate">{song.title}</h4>
                    <p className="text-[#A3A3AA] text-xs font-light truncate mt-0.5">{song.artist}</p>
                  </div>
                  <Music className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Center Subtitle underneath horizontal row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-12 px-4"
        >
          <p className="text-[#A8A8B0] text-xs md:text-sm font-semibold tracking-[0.25em] uppercase max-w-2xl mx-auto leading-relaxed">
            A FEW SONGS I CAN RECOMMEND IF YOU'RE LOOKING FOR SOME FRESH TUNES :)
          </p>
        </motion.div>
      </div>

      {/* YouTube Modal Overlay */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeSong && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
                onClick={() => setActiveSong(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-4xl bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#16161c]">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeSong.coverUrl}
                        alt="cover"
                        className="w-10 h-10 rounded-md object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400";
                        }}
                      />
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-wide">
                          {activeSong.title}
                        </h3>
                        <p className="text-white/60 text-xs">{activeSong.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveSong(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="relative w-full aspect-video bg-black">
                    {getYoutubeId(activeSong.youtubeUrl) ? (
                      <iframe
                        className="w-full h-full absolute inset-0"
                        src={`https://www.youtube.com/embed/${getYoutubeId(
                          activeSong.youtubeUrl,
                        )}?autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
                        Invalid YouTube URL
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}
