import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function HeroSection() {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Use a single scene, camera, and renderer for efficiency
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 8;

    // Create 3D code lines floating around
    const createCodeLine = () => {
      const geometry = new THREE.BoxGeometry(Math.random() * 0.5 + 0.3, 0.02, 0.02);
      const colors = [0x6366f1, 0x8b5cf6, 0xec4899, 0x06b6d4];
      const material = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 0.6
      });
      return new THREE.Mesh(geometry, material);
    };

    const codeLines = [];
    for (let i = 0; i < 50; i++) {
      const line = createCodeLine();
      line.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      );
      line.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      codeLines.push(line);
      scene.add(line);
    }

    // Grid floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x6366f1, 0x1e293b);
    gridHelper.position.y = -5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    scene.add(gridHelper);

    // Particles for depth
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 50;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 50;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 30;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.25) {
        colorArray[i * 3] = 0.39; colorArray[i * 3 + 1] = 0.4; colorArray[i * 3 + 2] = 0.95;
      } else if (colorChoice < 0.5) {
        colorArray[i * 3] = 0.55; colorArray[i * 3 + 1] = 0.36; colorArray[i * 3 + 2] = 0.96;
      } else if (colorChoice < 0.75) {
        colorArray[i * 3] = 0.93; colorArray[i * 3 + 1] = 0.31; colorArray[i * 3 + 2] = 0.6;
      } else {
        colorArray[i * 3] = 0.02; colorArray[i * 3 + 1] = 0.71; colorArray[i * 3 + 2] = 0.84;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 4, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 4, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x8b5cf6, 3, 80);
    pointLight3.position.set(0, 5, 5);
    scene.add(pointLight3);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Animate code lines
      codeLines.forEach((line, i) => {
        line.rotation.x += 0.005 * (i % 2 === 0 ? 1 : -1);
        line.rotation.y += 0.003;
        line.position.y += Math.sin(time + i) * 0.005;
      });

      // Animate grid
      gridHelper.rotation.y = time * 0.05;

      // Animate particles
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x = Math.sin(time * 0.2) * 0.1;

      // Create swirl effect on particles
      const positions = particlesMesh.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const angle = time * 0.5 + i * 0.01;
        const radius = 0.1;
        positions[i] += Math.cos(angle) * radius * 0.01;
        positions[i + 1] += Math.sin(angle) * radius * 0.01;
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;

      // Camera movement based on mouse
      const targetX = mousePosition.x * 2;
      const targetY = mousePosition.y * -1.5;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Lights
      pointLight1.position.x = 10 + Math.sin(time) * 2;
      pointLight2.position.x = -10 + Math.cos(time) * 2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [mousePosition]);

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950" onMouseMove={handleMouseMove}>
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full" 
      />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-950/80 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 text-center">
        <div className="space-y-6 max-w-5xl">
          <div className="mb-6 flex items-center justify-center gap-4 flex-wrap">
            <span className="px-4 py-2 bg-indigo-500/20 backdrop-blur-sm text-indigo-300 text-sm font-semibold rounded-full border border-indigo-500/30">
              3D Web Developer
            </span>
            <span className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm text-purple-300 text-sm font-semibold rounded-full border border-purple-500/30">
              Three.js Expert
            </span>
            <span className="px-4 py-2 bg-pink-500/20 backdrop-blur-sm text-pink-300 text-sm font-semibold rounded-full border border-pink-500/30">
              Creative Developer
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-tight">
            Crafting Immersive
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              3D Web Experiences
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Transforming ideas into stunning interactive 3D websites that captivate and engage users through cutting-edge WebGL and Three.js technology
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <button className="group px-10 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden text-lg">
              <span className="relative z-10 flex items-center gap-2">
                View 3D Projects
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
            <button className="px-10 py-5 bg-white/5 backdrop-blur-md text-white font-bold rounded-full border-2 border-white/20 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 text-lg">
              Let's Collaborate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}