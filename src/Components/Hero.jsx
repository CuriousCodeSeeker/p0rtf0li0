import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function HeroSection() {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Pre-loading system for smooth rendering
    const preloadScene = async () => {
      try {
        setLoadingProgress(10);
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
          canvas: canvasRef.current, 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.position.z = 8;
        
        setLoadingProgress(20);

    const createHexagon = (radius) => {
      const shape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) {
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      }
      shape.closePath();
      return shape;
    };

      const hexagons = [];
      const hexRadius = 0.5;
      const hexSpacing = hexRadius * 1.75;
      // Reduced grid size for better performance
      const gridRows = 6;
      const gridCols = 8;

      setLoadingProgress(30);

      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
        const hexShape = createHexagon(hexRadius);
        const hexGeometry = new THREE.ShapeGeometry(hexShape);
        const hexMaterial = new THREE.MeshBasicMaterial({
          color: 0x4a5568,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        const hexMesh = new THREE.Mesh(hexGeometry, hexMaterial);

        const xOffset = col * hexSpacing;
        const yOffset = row * hexSpacing * 0.866;
        const rowOffset = (row % 2) * (hexSpacing / 2);
        
        hexMesh.position.set(
          xOffset + rowOffset - (gridCols * hexSpacing) / 2,
          yOffset - (gridRows * hexSpacing * 0.866) / 2,
          -5
        );

        const borderGeometry = new THREE.EdgesGeometry(hexGeometry);
        const borderMaterial = new THREE.LineBasicMaterial({
          color: 0x6366f1,
          transparent: true,
          opacity: 0.5
        });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        hexMesh.add(border);

        hexagons.push({
          mesh: hexMesh,
          border: border,
          initialPos: { x: hexMesh.position.x, y: hexMesh.position.y, z: hexMesh.position.z },
          row: row,
          col: col,
          distanceFromCenter: Math.sqrt(
            Math.pow(col - gridCols / 2, 2) + Math.pow(row - gridRows / 2, 2)
          )
        });
        
          scene.add(hexMesh);
        }
      }
      
      setLoadingProgress(50);

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
      for (let i = 0; i < 30; i++) {
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
      
      setLoadingProgress(60);

      const gridHelper = new THREE.GridHelper(30, 30, 0x6366f1, 0x1e293b);
      gridHelper.position.y = -5;
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.3;
      scene.add(gridHelper);

      setLoadingProgress(70);

      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 400;
      const posArray = new Float32Array(particlesCount * 3);
      const colorArray = new Float32Array(particlesCount * 3);

      // Optimized particle generation with memoized colors
      for (let i = 0; i < particlesCount; i++) {
        posArray[i * 3] = (Math.random() - 0.5) * 50;
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 50;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 30;
        
        const colorChoice = Math.floor(Math.random() * particleColors.length);
        const color = particleColors[colorChoice];
        colorArray[i * 3] = color[0];
        colorArray[i * 3 + 1] = color[1];
        colorArray[i * 3 + 2] = color[2];
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
      
      // Optimized particle material
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false, // Optimize for transparency
        sizeAttenuation: true
      });

      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);
      
      setLoadingProgress(80);

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
      
      setLoadingProgress(90);

      let time = 0;
      let lastTime = 0;
      const targetFPS = 60;
      const frameInterval = 1000 / targetFPS;
      
      // Pre-calculate hexagon properties for better performance
      const hexagonProperties = hexagons.map((hexObj, index) => ({
        distanceFactor: hexObj.distanceFromCenter / 8,
        scatterIntensity: 12 + Math.sin(hexObj.row * 0.5 + hexObj.col * 0.3) * 2,
        spiralIndex: (index / hexagons.length) * 2 * Math.PI * 2,
        initialPos: hexObj.initialPos
      }));
      
      setLoadingProgress(95);
      
      // Pre-render the scene to warm up the GPU
      renderer.render(scene, camera);
      
        setLoadingProgress(100);
        setIsPreloaded(true);

        // Optimized animation loop - avoid per-frame React state updates
        const animate = useCallback((currentTime) => {
          if (currentTime - lastTime >= frameInterval) {
            time += 0.01;

      const scrollProgress = Math.min(scrollY / window.innerHeight, 1);
      const scrollEase = 1 - Math.pow(1 - scrollProgress, 3);
      
      // Optimized hexagon animation with reduced calculations
      
      // Pre-calculate phase values once
      const scatterPhase = Math.min(scrollProgress / 0.3, 1);
      const spiralPhase = Math.max(0, Math.min(1, (scrollProgress - 0.3) / 0.5));
      const exitPhase = Math.max(0, Math.min(1, (scrollProgress - 0.8) / 0.2));
      
      const scatterEase = 1 - Math.pow(1 - scatterPhase, 3);
      const spiralEase = 1 - Math.pow(1 - spiralPhase, 2);
      const exitEase = 1 - Math.pow(1 - exitPhase, 4);
      
      // Batch update hexagons for better performance
      hexagons.forEach((hexObj, index) => {
        const hex = hexObj.mesh;
        const props = hexagonProperties[index];
        
        if (scrollProgress < 0.3) {
          // Phase 1: Scatter from center (optimized)
          const dirX = props.initialPos.x;
          const dirY = props.initialPos.y;
          const distance = Math.sqrt(dirX * dirX + dirY * dirY);
          const normalX = distance > 0 ? dirX / distance : 0;
          const normalY = distance > 0 ? dirY / distance : 0;
          
          const targetX = props.initialPos.x + normalX * props.scatterIntensity * scatterEase;
          const targetY = props.initialPos.y + normalY * props.scatterIntensity * scatterEase * 0.8;
          const targetZ = props.initialPos.z - scatterEase * 15;
          
          // Direct position setting for better performance
          hex.position.x += (targetX - hex.position.x) * 0.1;
          hex.position.y += (targetY - hex.position.y) * 0.1;
          hex.position.z += (targetZ - hex.position.z) * 0.1;
          
        } else if (scrollProgress < 0.8) {
          // Phase 2: Spiral trail (optimized)
          const spiralRadius = 3 + spiralEase * 8;
          const spiralHeight = -20 + spiralEase * 40;
          const spiralAngle = props.spiralIndex + time * 0.5 + spiralEase * Math.PI * 4;
          
          const spiralX = Math.cos(spiralAngle) * spiralRadius;
          const spiralY = Math.sin(spiralAngle) * spiralRadius * 0.3;
          const spiralZ = spiralHeight + Math.sin(spiralAngle * 0.5) * 5;
          
          hex.position.x += (spiralX - hex.position.x) * 0.08;
          hex.position.y += (spiralY - hex.position.y) * 0.08;
          hex.position.z += (spiralZ - hex.position.z) * 0.08;
          hex.rotation.z += (spiralAngle - hex.rotation.z) * 0.05;
          
        } else {
          // Phase 3: Exit animation (optimized)
          const exitRadius = 11 + exitEase * 20;
          const exitAngle = props.spiralIndex * 2 + time * 0.8 + exitEase * Math.PI * 6;
          const exitHeight = 20 + exitEase * 30;
          
          const exitX = Math.cos(exitAngle) * exitRadius;
          const exitY = Math.sin(exitAngle) * exitRadius * 0.4;
          const exitZ = exitHeight + Math.sin(exitAngle * 0.3) * 8;
          
          hex.position.x += (exitX - hex.position.x) * 0.12;
          hex.position.y += (exitY - hex.position.y) * 0.12;
          hex.position.z += (exitZ - hex.position.z) * 0.12;
          
          // Batch opacity updates
          const targetOpacity = 0.3 * (1 - exitEase * 1.5);
          hex.material.opacity += (targetOpacity - hex.material.opacity) * 0.1;
          hexObj.border.material.opacity += (targetOpacity * 1.5 - hexObj.border.material.opacity) * 0.1;
        }
        
        // Optimized scaling
        const baseScale = 1 + (scrollProgress * 0.5);
        const bounceScale = 1 + Math.sin(time * 2 + index * 0.1) * 0.1;
        hex.scale.setScalar(baseScale * bounceScale);
      });

      // Optimized code lines animation - only animate when visible
      if (scrollProgress < 0.8) {
        codeLines.forEach((line, i) => {
          line.rotation.x += 0.005 * (i % 2 === 0 ? 1 : -1);
          line.rotation.y += 0.003;
          line.position.y += Math.sin(time + i) * 0.005;
          
          const lineStagger = (i / codeLines.length) * 0.5;
          const lineProgress = Math.max(0, Math.min(1, scrollProgress - lineStagger));
          const lineEase = 1 - Math.pow(1 - lineProgress, 2);
          
          line.position.y += lineEase * (i % 2 === 0 ? 10 : -10);
          line.position.x += lineEase * (i % 3 === 0 ? 5 : -5);
          line.rotation.z += lineEase * Math.PI;
          
          line.material.opacity = 0.6 * (1 - lineEase * 1.2);
        });
      }

      gridHelper.position.y = -5 - scrollEase * 8;
      gridHelper.rotation.y = scrollEase * Math.PI * 0.5;
      gridHelper.material.opacity = 0.3 * (1 - scrollEase * 1.2);

      // Optimized particle animation - only update when needed
      if (scrollProgress < 0.9) {
        particlesMesh.rotation.y += 0.0005 + scrollEase * 0.01;
        particlesMesh.rotation.x = scrollEase * Math.PI * 0.3;
        particlesMesh.position.z = -scrollEase * 12;
        particlesMesh.position.y = -scrollEase * 5;
        
        // Only update particle positions every few frames for better performance
        if (Math.floor(time * 10) % 3 === 0) {
          const positions = particlesMesh.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            const angle = time * 0.5 + i * 0.01;
            const radius = 0.1 * scrollEase;
            positions[i] += Math.cos(angle) * radius * 0.01;
            positions[i + 1] += Math.sin(angle) * radius * 0.01;
          }
          particlesMesh.geometry.attributes.position.needsUpdate = true;
        }
        
        particlesMaterial.opacity = 0.7 * (1 - scrollEase * 0.9);
      }

      const cameraEase = 1 - Math.pow(1 - scrollProgress, 4);
      camera.position.z = 8 + cameraEase * 12;
      
      const targetX = mousePosition.x * 2;
      const targetY = mousePosition.y * -2;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      const lightEase = 1 - Math.pow(1 - scrollProgress, 2);
      pointLight1.intensity = 4 * (1 - lightEase * 0.8);
      pointLight2.intensity = 4 * (1 - lightEase * 0.8);
      pointLight3.intensity = 3 * (1 - lightEase * 0.9);
      
      pointLight1.position.x = 10 + Math.sin(time) * 2;
      pointLight2.position.x = -10 + Math.cos(time) * 2;

            renderer.render(scene, camera);
            lastTime = currentTime;
          }
          requestAnimationFrame(animate);
        }, [scrollY, mousePosition, time, scene, camera, renderer]);

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
      } catch (error) {
        console.error('Error during preloading:', error);
        setIsPreloaded(true); // Fallback to show content even if preloading fails
      }
    };
    
    // Start preloading with timeout fallback
    preloadScene();
    
    // Fallback timeout to ensure loading doesn't get stuck
    const timeoutId = setTimeout(() => {
      if (!isPreloaded) {
        console.warn('Preloading timeout - showing content anyway');
        setIsPreloaded(true);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [mousePosition, scrollY, isActivated]);

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1
    });
  };

  // Removed click activation - hexagons now only scatter on scroll

  const scrollProgress = Math.min(scrollY / window.innerHeight, 1);
  const contentEase = 1 - Math.pow(1 - scrollProgress, 3);
  const contentOpacity = Math.max(0, 1 - contentEase * 1.5);
  const contentScale = Math.max(0.8, 1 - contentEase * 0.3);
  const contentTranslate = contentEase * 150;
  const contentTransform = `translateY(${contentTranslate}px) scale(${contentScale})`;

  return (
    <div>
      {/* Loading Screen */}
      {!isPreloaded && (
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Loading Experience</h2>
              <p className="text-gray-300">Preparing 3D magic...</p>
            </div>
            <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">{Math.round(loadingProgress)}%</p>
          </div>
        </div>
      )}
      
      <div 
        className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950" 
        onMouseMove={handleMouseMove}
        style={{ opacity: isPreloaded ? 1 : 0, transition: 'opacity 0.5s ease-in' }}
      >
        <canvas 
          ref={canvasRef} 
          className="fixed top-0 left-0 w-full h-full transition-opacity duration-500 ease-out" 
          style={{ 
            opacity: Math.max(0.1, 1 - scrollProgress * 0.8),
            transform: `translateY(${scrollProgress * -20}px) scale(${1 + scrollProgress * 0.1})`
          }} 
        />
        
        <div 
          className="fixed inset-0 bg-gradient-radial from-transparent via-transparent to-slate-950/80 pointer-events-none transition-opacity duration-500"
          style={{ opacity: 1 - scrollProgress * 0.3 }}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div 
            className="space-y-6 max-w-5xl"
            style={{ 
              opacity: contentOpacity,
              transform: contentTransform,
              transition: 'none'
            }}
          >
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
            
            {scrollY < 50 && (
              <div className="mb-6 animate-pulse">
                <p className="text-purple-400 text-sm font-medium">
                  📜 Scroll down to see the magic
                </p>
              </div>
            )}
            
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

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-8 border-t border-white/10">
              <div>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">50+</div>
                <div className="text-gray-400 text-sm mt-1">3D Projects</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">100K+</div>
                <div className="text-gray-400 text-sm mt-1">Lines of Code</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">99%</div>
                <div className="text-gray-400 text-sm mt-1">Satisfaction</div>
              </div>
            </div>
          </div>

          <div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce"
            style={{ opacity: contentOpacity }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-white/60 text-sm font-medium">Scroll to explore</span>
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Smooth transition section */}
        <div 
          className="relative z-10 min-h-screen bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 flex items-center justify-center"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 2),
            transform: `translateY(${scrollProgress * 50}px)`
          }}
        >
          <div className="text-center text-white px-4 max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Beyond Flat Design
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Every pixel, every polygon, every interaction is crafted to create memorable experiences
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-xl font-bold mb-2">Visual Excellence</h3>
                <p className="text-gray-400 text-sm">Stunning 3D graphics that push boundaries</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-xl font-bold mb-2">Performance</h3>
                <p className="text-gray-400 text-sm">Optimized for smooth 60fps experiences</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                <p className="text-gray-400 text-sm">Cutting-edge WebGL and Three.js techniques</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seamless transition overlay with spiral preview */}
        <div 
          className="fixed inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950 pointer-events-none z-20"
          style={{
            opacity: Math.min(1, scrollProgress * 1.5),
            transition: 'opacity 0.8s ease-out'
          }}
        />
        
        {/* Spiral preview overlay for smooth transition */}
        <div 
          className="fixed inset-0 pointer-events-none z-30"
          style={{
            opacity: Math.max(0, Math.min(1, (scrollProgress - 0.6) * 2.5)),
            background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(99, 102, 241, 0.1) 30%, rgba(139, 92, 246, 0.1) 60%, transparent 100%)`,
            transform: `rotate(${scrollProgress * 180}deg) scale(${1 + scrollProgress * 0.5})`,
            transition: 'all 1s ease-out'
          }}
        />
      </div>
    </div>
  );
}