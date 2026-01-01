'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

function RotatingCube() {
    const meshRef = useRef<Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.5;
            meshRef.current.rotation.y += delta * 0.7;
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
                color="#667eea"
                metalness={0.8}
                roughness={0.2}
                emissive="#764ba2"
                emissiveIntensity={0.5}
            />
        </mesh>
    );
}

export const FloatingCube: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={className} style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
                <RotatingCube />
            </Canvas>
        </div>
    );
};
