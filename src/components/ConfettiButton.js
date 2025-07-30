'use client';
import { useState, forwardRef, useImperativeHandle } from 'react';

const ConfettiButton = forwardRef((props, ref) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const createConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  useImperativeHandle(ref, () => ({
    click: createConfetti
  }));

  return (
    <>
      <button
        onClick={createConfetti}
        className="fixed bottom-20 right-4 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 z-40"
        title="Click for confetti!"
      >
        🎉
      </button>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-30">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#f472b6', '#ec4899', '#fbbf24', '#34d399', '#60a5fa'][i % 5],
                animation: `confetti-fall ${2 + Math.random() * 2}s linear`,
                animationDelay: `${Math.random() * 1}s`,
              }}
            />
          ))}
          
          <style jsx>{`
            @keyframes confetti-fall {
              0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
});

ConfettiButton.displayName = 'ConfettiButton';

export default ConfettiButton;
