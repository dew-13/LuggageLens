import React, { useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';

function Planet() {
    const earthMap = useLoader(TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');

    return (
        <group>
            {/* Textured Earth Sphere */}
            <mesh rotation={[0, -Math.PI / 2, 0]}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    map={earthMap}
                    color="#cccccc"
                    metalness={0.4}
                    roughness={0.7}
                />
            </mesh>

            {/* Grid Overlay */}
            <mesh rotation={[0, -Math.PI / 2, 0]}>
                <sphereGeometry args={[2.01, 24, 24]} />
                <meshBasicMaterial color="#555555" wireframe transparent opacity={0.2} />
            </mesh>

            {/* Glowing Atmosphere/Rim */}
            <mesh scale={[1.1, 1.1, 1.1]}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="#333333" transparent opacity={0.1} side={THREE.BackSide} />
            </mesh>
        </group>
    );
}

function SearchIcon3D() {
    const groupRef = useRef();

    useEffect(() => {
        if (groupRef.current) {
            // Orient the icon to face the globe center
            groupRef.current.lookAt(0, 0, 0);
        }
    }, []);

    return (
        <group ref={groupRef} position={[2.2, 0.5, 1.2]}>
            {/* Float adds gentle hovering motion relative to the LookAt orientation */}
            <Float speed={4} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[0, 0.2]}>
                <group rotation={[0, 0, Math.PI / 4]}> {/* 45deg tilt for the handle */}
                    {/* Rim */}
                    <mesh>
                        <torusGeometry args={[0.8, 0.08, 16, 32]} />
                        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
                    </mesh>

                    {/* Glass Lens */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.78, 0.78, 0.05, 32]} />
                        <meshPhysicalMaterial
                            color="#ffffff" // Slight blue tint for glass
                            metalness={0.1}
                            roughness={0}
                            transmission={0.6}
                            transparent
                            opacity={0.3}
                        />
                    </mesh>

                    {/* Handle */}
                    <mesh position={[0, -1.1, 0]}>
                        <cylinderGeometry args={[0.08, 0.06, 1.0, 16]} />
                        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
                    </mesh>
                </group>
            </Float>
        </group>
    );
}

function RotatingScene() {
    return (
        <group>
            <Planet />
            <SearchIcon3D />
        </group>
    )
}

export default function GlobeHero3D() {
    return (
        <div className="w-full h-full min-h-[400px] cursor-move">
            <Canvas camera={{ position: [0, 0, 12], fov: 45 }} gl={{ alpha: true }}>

                {/* Lighting Setup */}
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4c4c4c" />
                <spotLight position={[0, 5, 5]} angle={0.5} penumbra={1} intensity={1} castShadow />

                <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
                    <RotatingScene />
                </Float>

                <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade />

                {/* User interaction: Zoom enabled, Auto-rotate disabled */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    autoRotate={false}
                    minDistance={8}
                    maxDistance={20}
                    target={[0, 0, 0]}
                />
            </Canvas>
        </div>
    );
}
