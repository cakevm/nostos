"use client"

import { useEffect, useState } from 'react'

export function BoatAnimation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden" />
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style jsx>{`
        @keyframes sail {
          0% {
            transform: translateX(-150px) translateY(0) rotate(-2deg);
          }
          25% {
            transform: translateX(calc(25vw + 50px)) translateY(-8px) rotate(1deg);
          }
          50% {
            transform: translateX(calc(50vw + 50px)) translateY(0) rotate(-1deg);
          }
          75% {
            transform: translateX(calc(75vw + 50px)) translateY(-5px) rotate(2deg);
          }
          100% {
            transform: translateX(calc(100vw + 150px)) translateY(0) rotate(-2deg);
          }
        }
        
        @keyframes wave1 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-20px) translateY(-10px);
          }
        }
        
        @keyframes wave2 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(20px) translateY(-8px);
          }
        }
        
        @keyframes wave3 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-15px) translateY(-12px);
          }
        }
        
        @keyframes bob {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-3px) rotate(-1deg);
          }
          50% {
            transform: translateY(0) rotate(0deg);
          }
          75% {
            transform: translateY(-2px) rotate(1deg);
          }
        }
        
        .boat-container {
          animation: sail 30s linear infinite;
        }
        
        .boat {
          animation: bob 3s ease-in-out infinite;
        }
        
        .wave-1 {
          animation: wave1 4s ease-in-out infinite;
        }
        
        .wave-2 {
          animation: wave2 4s ease-in-out infinite 0.5s;
        }
        
        .wave-3 {
          animation: wave3 4s ease-in-out infinite 1s;
        }
      `}</style>
      
      {/* Ocean waves background */}
      <div className="absolute inset-0">
        <svg
          className="absolute bottom-0 w-full h-48 opacity-20 dark:opacity-10"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            className="text-blue-400 dark:text-blue-600 wave-1"
            d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,128C672,117,768,139,864,160C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        
        <svg
          className="absolute bottom-0 w-full h-40 opacity-15 dark:opacity-10"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            className="text-blue-500 dark:text-blue-700 wave-2"
            d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,117.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        
        <svg
          className="absolute bottom-0 w-full h-32 opacity-10 dark:opacity-5"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            className="text-blue-600 dark:text-blue-800 wave-3"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,160C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
      
      {/* Sailing boat */}
      <div className="boat-container absolute bottom-20 left-0">
        <svg
          className="boat w-24 h-24"
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Boat hull */}
          <path
            d="M20 60 L80 60 L70 75 L30 75 Z"
            fill="currentColor"
            stroke="currentColor"
            className="text-amber-800 dark:text-amber-900"
            strokeWidth="1"
          />
          
          {/* Mast */}
          <line
            x1="50"
            y1="60"
            x2="50"
            y2="20"
            stroke="currentColor"
            className="text-amber-800 dark:text-amber-900"
            strokeWidth="2"
          />
          
          {/* Main sail */}
          <path
            d="M52 25 L52 55 L75 50 Z"
            fill="currentColor"
            stroke="currentColor"
            className="text-stone-200 dark:text-stone-300"
            strokeWidth="1"
            opacity="0.9"
          />
          
          {/* Secondary sail */}
          <path
            d="M48 30 L48 55 L28 52 Z"
            fill="currentColor"
            stroke="currentColor"
            className="text-stone-300 dark:text-stone-400"
            strokeWidth="1"
            opacity="0.8"
          />
          
          {/* Flag */}
          <path
            d="M50 20 L50 25 L58 22.5 Z"
            fill="currentColor"
            className="text-amber-500 dark:text-amber-600"
          />
          
          {/* Greek pattern on sail */}
          <g opacity="0.3">
            <path
              d="M55 35 L60 35 L60 37 L55 37 Z M62 35 L67 35 L67 37 L62 37 Z"
              fill="currentColor"
              className="text-amber-600 dark:text-amber-700"
            />
            <path
              d="M55 40 L60 40 L60 42 L55 42 Z M62 40 L67 40 L67 42 L62 42 Z"
              fill="currentColor"
              className="text-amber-600 dark:text-amber-700"
            />
          </g>
        </svg>
      </div>
      
      {/* Sun/Moon in background */}
      <div className="absolute top-10 right-10">
        {/* Sun for light mode */}
        <div className="block dark:hidden relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 opacity-60" />
          {/* Sun rays */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-200/30 to-amber-300/30 blur-xl" />
          </div>
          {/* Additional glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100/20 to-amber-200/20 blur-2xl" />
          </div>
        </div>
        {/* Moon for dark mode */}
        <div className="hidden dark:block relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 opacity-20" />
          {/* Moon craters */}
          <div className="absolute top-3 left-4 w-3 h-3 rounded-full bg-slate-500 opacity-10" />
          <div className="absolute top-6 right-5 w-2 h-2 rounded-full bg-slate-500 opacity-10" />
          <div className="absolute bottom-4 left-3 w-4 h-4 rounded-full bg-slate-500 opacity-10" />
        </div>
      </div>
      
      {/* Seagulls */}
      <div className="absolute top-20 left-1/4 opacity-20 dark:opacity-10">
        <svg width="30" height="20" viewBox="0 0 30 20">
          <path d="M5,10 Q10,5 15,10" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth="1.5" fill="none" />
          <path d="M18,8 Q23,3 28,8" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </div>
  )
}