import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const Particles = () => {
    const ref = useRef();
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y -= delta * 0.05;
            ref.current.rotation.x -= delta * 0.02;
        }
    });
    return (
        <group ref={ref}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
};

const FloatingGrid = () => {
    return (
        <group rotation={[Math.PI / 3.5, 0, 0]} position={[0, -10, 0]}>
            <gridHelper args={[100, 100, 0xffffff, 0x222222]} />
        </group>
    );
};

const Luggage = () => {
    const groupRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const { x, y } = state.pointer; // Mouse position (-1 to 1)

        if (groupRef.current) {
            // Lerp rotation based on mouse position for interactivity
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, y * 0.3 + Math.sin(time * 0.5) * 0.1, 0.1);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.5 + time * 0.2, 0.1);

            // Subtle floating movement
            groupRef.current.position.y = Math.sin(time / 2) * 0.3;
            // Move slightly towards mouse
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, x * 1.5, 0.05);
        }
    });

    const materialProps = {
        color: "#ffffff",
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.8,
        wireframe: true // Tech look
    };

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={groupRef} position={[0, 0, -2]} scale={1.2}>
                {/* Main Body */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[2.2, 3, 1]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>

                {/* Handle (Top) */}
                <mesh position={[0, 1.7, 0]}>
                    <boxGeometry args={[0.8, 0.4, 0.1]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
                <mesh position={[-0.35, 1.6, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.4]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
                <mesh position={[0.35, 1.6, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.4]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>

                {/* Wheels */}
                <mesh position={[-0.8, -1.6, 0.3]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
                <mesh position={[0.8, -1.6, 0.3]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
                <mesh position={[-0.8, -1.6, -0.3]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
                <mesh position={[0.8, -1.6, -0.3]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>

                {/* Design Accents / Stripes */}
                <mesh position={[0, 0, 0.51]} rotation={[0, 0, 0]}>
                    <planeGeometry args={[1.8, 2.5]} />
                    <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
                </mesh>
                <mesh position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[1.8, 2.5]} />
                    <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
                </mesh>
            </group>
        </Float>
    );
};

const ThreeBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] bg-black">
            <Canvas eventSource={document.getElementById('root')} className="pointer-events-none">
                <PerspectiveCamera makeDefault position={[0, 0, 15]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" /> {/* Backlight */}

                <Particles />
                <FloatingGrid />
                <Luggage />

                <fog attach="fog" args={['#000000', 5, 40]} />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black pointer-events-none" />
        </div>
    );
};

export default ThreeBackground;
