import { useEffect, useState } from 'react';
import { Scissors, Sparkles, Star, Heart, Crown } from 'lucide-react';

const FloatingElements = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    // Create floating elements
    const newElements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2000,
      duration: 3000 + Math.random() * 2000,
      icon: [Scissors, Sparkles, Star, Heart, Crown][Math.floor(Math.random() * 5)],
      size: 12 + Math.random() * 8
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => {
        const Icon = element.icon;
        return (
          <div
            key={element.id}
            className="absolute animate-float"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}ms`,
              animationDuration: `${element.duration}ms`,
              width: `${element.size}px`,
              height: `${element.size}px`
            }}
          >
            <Icon 
              className="text-amber-400/20 hover:text-amber-300/40 transition-colors duration-300" 
              size={element.size}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FloatingElements;
