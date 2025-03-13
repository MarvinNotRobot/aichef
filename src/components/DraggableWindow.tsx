import React, { useState, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DraggableWindowProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
  defaultPosition?: Position;
}

export function DraggableWindow({ 
  isOpen, 
  onToggle, 
  title, 
  children,
  defaultPosition = { x: -8, y: -8 }
}: DraggableWindowProps) {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Get window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Get draggable element dimensions
      const element = windowRef.current;
      if (!element) return;
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;

      // Calculate bounds
      const maxX = windowWidth - elementWidth;
      const maxY = windowHeight - elementHeight;

      // Constrain position within viewport
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) {
      return;
    }

    setIsDragging(true);
    const element = windowRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const style: React.CSSProperties = {
    transform: isOpen ? 'translateY(0)' : 'translateY(120%)',
    left: `${position.x}px`,
    bottom: `${position.y}px`,
    position: 'fixed',
    transition: isDragging ? 'none' : 'transform 0.3s ease-in-out',
    cursor: isDragging ? 'grabbing' : 'grab',
    height: '300px' // Reduced height from 600px to 300px
  };

  return (
    <div
      ref={windowRef}
      className="w-96 bg-white rounded-lg shadow-2xl flex flex-col"
      style={style}
    >
      <div 
        className="p-4 bg-indigo-600 rounded-t-lg flex justify-between items-center select-none"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-white font-medium">{title}</h3>
        <button
          onClick={onToggle}
          className="text-white hover:text-indigo-100"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}