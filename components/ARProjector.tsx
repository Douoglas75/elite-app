
import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { useAppContext } from '../contexts/AppContext';

const ARProjector: React.FC = () => {
    const { projectingMedia, setProjectingMedia } = useAppContext();
    const [status, setStatus] = useState<'checking' | 'supported' | 'unsupported' | 'active' | 'error'>('checking');
    const [instruction, setInstruction] = useState('Analyse de l\'environnement...');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const checkARSupport = async () => {
            if ('xr' in navigator) {
                try {
                    const isSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
                    setStatus(isSupported ? 'supported' : 'unsupported');
                } catch {
                    setStatus('unsupported');
                }
            } else {
                setStatus('unsupported');
            }
        };
        checkARSupport();
    }, []);

    const startAR = async () => {
        try {
            // In a real WebXR implementation, we would request an 'immersive-ar' session.
            // For this preparation, we simulate the camera access and UI flow.
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStatus('active');
                setInstruction('Scannez un mur vertical...');
                
                // Simulate plane detection after 3 seconds
                setTimeout(() => setInstruction('Mur détecté. Touchez pour projeter.'), 3000);
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (!projectingMedia) return null;

    return (
        <div className="fixed inset-0 z-[5000] bg-black flex flex-col animate-fade-in">
            {status !== 'active' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center">
                        <Icon name="sparkles" className="w-10 h-10 text-cyan-400 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Projecteur AR Elite</h2>
                    <p className="text-gray-400 text-sm max-w-xs">
                        Utilisez ARCore pour projeter cette image de référence directement sur votre mur à échelle réelle.
                    </p>
                    
                    {status === 'supported' && (
                        <button 
                            onClick={startAR}
                            className="w-full max-w-xs bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-cyan-600/20 transition-all uppercase tracking-widest text-xs"
                        >
                            Démarrer l'AR
                        </button>
                    )}

                    {status === 'unsupported' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold">
                            Désolé, votre appareil ne supporte pas WebXR / ARCore.
                        </div>
                    )}

                    <button 
                        onClick={() => setProjectingMedia(null)}
                        className="text-gray-500 font-bold text-xs uppercase tracking-widest"
                    >
                        Annuler
                    </button>
                </div>
            ) : (
                <div className="relative flex-1 bg-black overflow-hidden">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Reticle / Interface Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-48 h-64 border-2 border-dashed border-cyan-400/50 rounded-lg flex flex-col items-center justify-center bg-cyan-400/5">
                            <Icon name="signature" className="w-8 h-8 text-cyan-400/30" />
                        </div>
                        <div className="mt-8 px-6 py-3 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                            {instruction}
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-10 inset-x-0 px-8 flex justify-between items-center">
                         <button 
                            onClick={() => setProjectingMedia(null)}
                            className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10"
                        >
                            <Icon name="close" className="w-6 h-6" />
                        </button>

                        <button 
                            className="w-20 h-20 bg-white rounded-full p-1 shadow-2xl"
                            onClick={() => setInstruction('Image ancrée sur le mur.')}
                        >
                            <div className="w-full h-full rounded-full border-4 border-black/10 flex items-center justify-center">
                                <div className="w-4 h-4 bg-cyan-600 rounded-sm"></div>
                            </div>
                        </button>

                        <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
                            <img src={projectingMedia.url} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ARProjector;
