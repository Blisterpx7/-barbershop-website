import { useEffect, useState } from 'react';

const GradientBackground = () => {
  const [gradients, setGradients] = useState([]);

  useEffect(() => {
    // Create animated gradient orbs
    const newGradients = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 200 + Math.random() * 300,
      delay: Math.random() * 2000,
      duration: 8000 + Math.random() * 4000,
      colors: [
        'from-amber-500/10 via-orange-500/10 to-red-500/10',
        'from-purple-500/10 via-pink-500/10 to-red-500/10',
        'from-blue-500/10 via-cyan-500/10 to-teal-500/10',
        'from-green-500/10 via-emerald-500/10 to-teal-500/10',
        'from-yellow-500/10 via-orange-500/10 to-red-500/10',
        'from-indigo-500/10 via-purple-500/10 to-pink-500/10'
      ][i]
    }));
    setGradients(newGradients);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {gradients.map((gradient) => (
        <div
          key={gradient.id}
          className={`absolute rounded-full bg-gradient-to-r ${gradient.colors} animate-pulse`}
          style={{
            left: `${gradient.x}%`,
            top: `${gradient.y}%`,
            width: `${gradient.size}px`,
            height: `${gradient.size}px`,
            animationDelay: `${gradient.delay}ms`,
            animationDuration: `${gradient.duration}ms`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );
};

export default GradientBackground;
