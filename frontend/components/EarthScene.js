'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Points, PointMaterial, Ring } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Floating particles (stars → data points) ─── */
function StarField({ scrollProgress }) {
    const ref = useRef();
    const count = 4000;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 24;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 24;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y += 0.0005;
            ref.current.rotation.x += 0.0002;
            // Subtle pulsing brightness
            const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
            ref.current.material.opacity = pulse;
        }
    });

    const color = scrollProgress > 0.5 ? '#22d3ee' : '#67e8f9';

    return (
        <Points ref={ref} positions={positions} stride={3}>
            <PointMaterial
                transparent
                color={color}
                size={0.04}
                sizeAttenuation
                depthWrite={false}
                opacity={0.8}
            />
        </Points>
    );
}

/* ─── Outer Bloom Glow Ring ─── */
function BloomRing({ scrollProgress }) {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y += 0.002;
            // Breathing glow
            const breathe = 0.06 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
            ref.current.material.opacity = breathe + scrollProgress * 0.03;
        }
    });

    return (
        <Sphere ref={ref} args={[1.85, 32, 32]}>
            <meshBasicMaterial
                color={new THREE.Color('#22d3ee')}
                transparent
                opacity={0.08}
                side={THREE.BackSide}
            />
        </Sphere>
    );
}

/* ─── Orbital Rings ─── */
function OrbitalRings({ scrollProgress }) {
    const ring1Ref = useRef();
    const ring2Ref = useRef();
    const ring3Ref = useRef();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (ring1Ref.current) {
            ring1Ref.current.rotation.z = t * 0.15;
            ring1Ref.current.rotation.x = Math.PI / 3;
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.z = -t * 0.12;
            ring2Ref.current.rotation.x = Math.PI / 2.2;
            ring2Ref.current.rotation.y = Math.PI / 5;
        }
        if (ring3Ref.current) {
            ring3Ref.current.rotation.z = t * 0.1;
            ring3Ref.current.rotation.x = Math.PI / 1.8;
            ring3Ref.current.rotation.y = -Math.PI / 4;
        }
    });

    const ringOpacity = 0.15 + scrollProgress * 0.1;

    return (
        <group>
            <mesh ref={ring1Ref}>
                <ringGeometry args={[1.9, 1.92, 128]} />
                <meshBasicMaterial
                    color="#22d3ee"
                    transparent
                    opacity={ringOpacity}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh ref={ring2Ref}>
                <ringGeometry args={[2.1, 2.12, 128]} />
                <meshBasicMaterial
                    color="#14b8a6"
                    transparent
                    opacity={ringOpacity * 0.7}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh ref={ring3Ref}>
                <ringGeometry args={[2.3, 2.31, 128]} />
                <meshBasicMaterial
                    color="#06b6d4"
                    transparent
                    opacity={ringOpacity * 0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

/* ─── Floating Data Particles orbiting the globe ─── */
function OrbitingParticles() {
    const ref = useRef();
    const count = 60;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 1.7 + Math.random() * 0.5;
            const yOffset = (Math.random() - 0.5) * 1.5;
            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = yOffset;
            pos[i * 3 + 2] = Math.sin(angle) * radius;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.3;
            ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3}>
            <PointMaterial
                transparent
                color="#67e8f9"
                size={0.06}
                sizeAttenuation
                depthWrite={false}
                opacity={0.9}
            />
        </Points>
    );
}

/* ─── The Earth Globe ─── */
function Globe({ scrollProgress }) {
    const meshRef = useRef();
    const wireRef = useRef();
    const nodesRef = useRef();
    const connectionsRef = useRef();
    const atmosphereRef = useRef();

    // Generate AI node positions on sphere surface
    const nodeData = useMemo(() => {
        const nodes = [];
        const nodeCount = 120;
        for (let i = 0; i < nodeCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / nodeCount);
            const theta = Math.sqrt(nodeCount * Math.PI) * phi;
            const r = 1.54;
            nodes.push(
                new THREE.Vector3(
                    r * Math.cos(theta) * Math.sin(phi),
                    r * Math.sin(theta) * Math.sin(phi),
                    r * Math.cos(phi)
                )
            );
        }
        return nodes;
    }, []);

    // Node positions as float array
    const nodePositions = useMemo(() => {
        const pos = new Float32Array(nodeData.length * 3);
        nodeData.forEach((v, i) => {
            pos[i * 3] = v.x;
            pos[i * 3 + 1] = v.y;
            pos[i * 3 + 2] = v.z;
        });
        return pos;
    }, [nodeData]);

    // Connection lines between nearby nodes
    const connectionPositions = useMemo(() => {
        const lines = [];
        for (let i = 0; i < nodeData.length; i++) {
            for (let j = i + 1; j < nodeData.length; j++) {
                if (nodeData[i].distanceTo(nodeData[j]) < 0.9) {
                    lines.push(
                        nodeData[i].x, nodeData[i].y, nodeData[i].z,
                        nodeData[j].x, nodeData[j].y, nodeData[j].z
                    );
                }
            }
        }
        return new Float32Array(lines);
    }, [nodeData]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const rotSpeed = 0.003;
        if (meshRef.current) {
            meshRef.current.rotation.y += rotSpeed;
        }
        if (wireRef.current) {
            wireRef.current.rotation.y += rotSpeed;
        }
        if (nodesRef.current) {
            nodesRef.current.rotation.y += rotSpeed;
        }
        if (connectionsRef.current) {
            connectionsRef.current.rotation.y += rotSpeed;
        }
        if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y += rotSpeed;
            // Breathing atmosphere
            const breathe = 1 + Math.sin(t * 0.5) * 0.015;
            atmosphereRef.current.scale.set(breathe, breathe, breathe);
        }
    });

    // Color shifts: Vibrant cyan → Deep teal network
    const earthColor = new THREE.Color().lerpColors(
        new THREE.Color('#0c4a6e'),
        new THREE.Color('#0a2f3f'),
        scrollProgress
    );

    const wireColor = new THREE.Color().lerpColors(
        new THREE.Color('#22d3ee'),
        new THREE.Color('#14b8a6'),
        scrollProgress
    );

    const atmosphereColor = new THREE.Color().lerpColors(
        new THREE.Color('#22d3ee'),
        new THREE.Color('#06b6d4'),
        scrollProgress
    );

    // Globe opacity fades as wireframe takes over
    const globeOpacity = 0.9 - scrollProgress * 0.5;
    const wireOpacity = 0.08 + scrollProgress * 0.35;

    return (
        <group>
            {/* Main solid globe */}
            <Sphere ref={meshRef} args={[1.5, 64, 64]}>
                <meshPhongMaterial
                    color={earthColor}
                    emissive={new THREE.Color('#22d3ee')}
                    emissiveIntensity={0.15 + scrollProgress * 0.2}
                    transparent
                    opacity={globeOpacity}
                    shininess={120}
                />
            </Sphere>

            {/* Wireframe overlay — always visible, grows brighter */}
            <Sphere ref={wireRef} args={[1.51, 48, 48]}>
                <meshBasicMaterial
                    color={wireColor}
                    transparent
                    opacity={wireOpacity}
                    wireframe
                    wireframeLinewidth={1}
                />
            </Sphere>

            {/* Inner glow core — vibrant from start */}
            <Sphere args={[1.2, 32, 32]}>
                <meshBasicMaterial
                    color={new THREE.Color('#22d3ee')}
                    transparent
                    opacity={0.1}
                />
            </Sphere>

            {/* Atmosphere glow — visible from start */}
            <Sphere ref={atmosphereRef} args={[1.65, 32, 32]}>
                <meshBasicMaterial
                    color={atmosphereColor}
                    transparent
                    opacity={0.18 + scrollProgress * 0.1}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* AI Nodes — visible from start, grow on scroll */}
            <Points ref={nodesRef} positions={nodePositions} stride={3}>
                <PointMaterial
                    transparent
                    color="#67e8f9"
                    size={0.04 + scrollProgress * 0.06}
                    sizeAttenuation
                    depthWrite={false}
                    opacity={0.3 + scrollProgress * 0.7}
                />
            </Points>

            {/* Connection lines — visible from start, grow on scroll */}
            <lineSegments ref={connectionsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={connectionPositions.length / 3}
                        array={connectionPositions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color={wireColor}
                    transparent
                    opacity={0.08 + scrollProgress * 0.4}
                    linewidth={1}
                />
            </lineSegments>
        </group>
    );
}

/* ─── Mouse-reactive container ─── */
function SceneContent({ scrollProgress }) {
    const groupRef = useRef();
    const { viewport } = useThree();

    useFrame((state) => {
        if (groupRef.current) {
            // Subtle mouse follow for interactivity
            const x = (state.pointer.x * viewport.width) / 40;
            const y = (state.pointer.y * viewport.height) / 40;
            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x, y * 0.15, 0.05
            );
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y, x * 0.15, 0.05
            );
        }
    });

    return (
        <group ref={groupRef}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 3, 5]} intensity={1.2} color="#94c5d8" />
            <pointLight position={[-5, -3, -5]} intensity={0.8} color="#22d3ee" />
            <pointLight position={[3, 5, -3]} intensity={0.4} color="#14b8a6" />
            <pointLight position={[0, 0, 4]} intensity={0.3} color="#67e8f9" />

            <Globe scrollProgress={scrollProgress} />
            <BloomRing scrollProgress={scrollProgress} />
            <OrbitalRings scrollProgress={scrollProgress} />
            <OrbitingParticles />
            <StarField scrollProgress={scrollProgress} />
        </group>
    );
}

/* ─── Main Scene ─── */
export default function EarthScene({ scrollProgress = 0 }) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
        }}>
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <SceneContent scrollProgress={scrollProgress} />
            </Canvas>
        </div>
    );
}
