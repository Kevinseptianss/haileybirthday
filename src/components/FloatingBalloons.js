'use client';
import { useState, useEffect } from 'react';

export default function FloatingBalloons() {
  const [balloons, setBalloons] = useState([]);

  useEffect(() => {
    const colors = ['#f472b6', '#ec4899', '#db2777', '#be185d', '#fce7f3'];
    const newBalloons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
    }));
    setBalloons(newBalloons);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          className="absolute w-8 h-10 opacity-70"
          style={{
            left: `${balloon.left}%`,
            animation: `float-up ${balloon.duration}s infinite linear`,
            animationDelay: `${balloon.delay}s`,
          }}
        >
          <div
            className="w-full h-full rounded-full shadow-lg"
            style={{ backgroundColor: balloon.color }}
          ></div>
          <div
            className="w-px h-16 bg-gray-400 mx-auto"
            style={{ marginTop: '2px' }}
          ></div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
