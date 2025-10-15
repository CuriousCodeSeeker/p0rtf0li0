import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function About() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [sectionScroll, setSectionScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = rect.top;
        const windowHeight = window.innerHeight;
        
        // Calculate section progress (0 to 1)
        const progress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / windowHeight));
        setSectionScroll(progress);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create DNA helix-like structure
    const helixPoints = [];
    const helixCount = 100;
    const colors = [0x6366f1, 0x8b5cf6, 0xec4899, 0x06b6d4, 0xf59e0b];

    for (let i = 0; i < helixCount; i++) {
      const t = i / helixCount;
      const angle = t * Math.PI * 8;
      const radius = 3;
      
      const geometry = new THREE.SphereGeometry(0.15, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i % colors.length],
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.set(
        Math.cos(angle) * radius,
        (t - 0.5) * 15,
        Math.sin(angle) * radius
      );
      
      sphere.userData = { 
        index: i,
        initialY: sphere.position.y,
        color: colors[i % colors.length]
      };
      
      helixPoints.push(sphere);
      scene.add(sphere);
    }

    // Create connecting lines between helix points
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.3
    });

    const lines = [];
    for (let i = 0; i < helixPoints.length - 1; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        helixPoints[i].position,
        helixPoints[i + 1].position
      ]);
      const line = new THREE.Line(geometry, lineMaterial.clone());
      lines.push({ line, startIdx: i, endIdx: i + 1 });
      scene.add(line);
    }

    // Create orbital rings
    const orbitals = [];
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusGeometry(5 + i * 2, 0.08, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: colors[i],
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      const orbital = new THREE.Mesh(geometry, material);
      orbital.rotation.x = Math.PI / 2 + i * 0.3;
      orbital.rotation.y = i * 0.5;
      
      orbital.userData = {
        rotationSpeed: 0.002 + i * 0.001,
        pulseOffset: i * Math.PI / 3
      };
      
      orbitals.push(orbital);
      scene.add(orbital);
    }

    // Enhanced particles with trails
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    const sizeArray = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 50;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 50;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 30;
      
      const colorChoice = Math.floor(Math.random() * colors.length);
      const color = new THREE.Color(colors[colorChoice]);
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
      
      sizeArray[i] = Math.random() * 0.5 + 0.3;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 4, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 4, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x8b5cf6, 3, 80);
    pointLight3.position.set(0, 0, 15);
    scene.add(pointLight3);

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Animate helix - wave motion
      helixPoints.forEach((sphere, i) => {
        const wave = Math.sin(time * 2 + i * 0.2) * 0.3;
        sphere.position.y = sphere.userData.initialY + wave;
        
        // Pulsing scale
        const pulse = 1 + Math.sin(time * 3 + i * 0.1) * 0.2;
        sphere.scale.set(pulse, pulse, pulse);
        
        // Glowing effect
        sphere.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + i * 0.15) * 0.3;
        
        // Rotate around center
        const currentAngle = Math.atan2(sphere.position.z, sphere.position.x);
        const radius = Math.sqrt(sphere.position.x ** 2 + sphere.position.z ** 2);
        const newAngle = currentAngle + 0.005;
        sphere.position.x = Math.cos(newAngle) * radius;
        sphere.position.z = Math.sin(newAngle) * radius;
      });

      // Update connecting lines
      lines.forEach(({ line, startIdx, endIdx }) => {
        const points = [
          helixPoints[startIdx].position,
          helixPoints[endIdx].position
        ];
        line.geometry.setFromPoints(points);
        line.material.opacity = 0.3 + Math.sin(time * 2 + startIdx * 0.1) * 0.2;
      });

      // Animate orbitals
      orbitals.forEach((orbital, i) => {
        orbital.rotation.z += orbital.userData.rotationSpeed;
        orbital.rotation.x += orbital.userData.rotationSpeed * 0.5;
        
        // Pulsing effect
        const pulse = 1 + Math.sin(time * 2 + orbital.userData.pulseOffset) * 0.1;
        orbital.scale.set(pulse, pulse, pulse);
        
        orbital.material.opacity = 0.2 + Math.sin(time + orbital.userData.pulseOffset) * 0.1;
      });

      // Animate particles with flow
      const positions = particlesMesh.geometry.attributes.position.array;
      const sizes = particlesMesh.geometry.attributes.size.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Spiral motion
        positions[i] += Math.sin(time + i * 0.01) * 0.02;
        positions[i + 1] += Math.cos(time + i * 0.01) * 0.02;
        positions[i + 2] += Math.sin(time * 0.5 + i * 0.02) * 0.01;
        
        // Wrap around
        if (positions[i] > 25) positions[i] = -25;
        if (positions[i] < -25) positions[i] = 25;
        if (positions[i + 1] > 25) positions[i + 1] = -25;
        if (positions[i + 1] < -25) positions[i + 1] = 25;
        
        // Pulsing size
        const sizeIndex = i / 3;
        sizes[sizeIndex] = (0.3 + Math.sin(time * 2 + sizeIndex * 0.1) * 0.2);
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;
      particlesMesh.geometry.attributes.size.needsUpdate = true;
      
      particlesMesh.rotation.y += 0.0005;

      // Camera follows mouse with momentum
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * -2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Lights circular motion
      pointLight1.position.x = 10 + Math.sin(time * 0.5) * 5;
      pointLight1.position.z = 10 + Math.cos(time * 0.5) * 5;
      
      pointLight2.position.x = -10 + Math.cos(time * 0.7) * 5;
      pointLight2.position.z = -10 + Math.sin(time * 0.7) * 5;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
    };
  }, []);

  const getTransform = (delay) => {
    const progress = Math.max(0, sectionScroll - delay);
    return {
      opacity: Math.min(1, progress * 2),
      transform: `translateY(${Math.max(0, (1 - progress) * 100)}px) scale(${0.8 + progress * 0.2})`,
      transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ 
          opacity: Math.min(1, sectionScroll * 1.2),
          transition: 'opacity 0.6s ease-out'
        }}
      />
      
      {/* Animated gradient overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + sectionScroll * 20}% ${50 + sectionScroll * 10}%, rgba(99, 102, 241, 0.1), transparent 50%)`,
          transition: 'all 1s ease-out'
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-32">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Main heading with animated underline */}
          <div className="text-center mb-24" style={getTransform(0)}>
            <div className="inline-block mb-6 relative">
              <h2 className="text-6xl md:text-8xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  About Me
                </span>
              </h2>
              <div 
                className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mx-auto"
                style={{
                  width: `${sectionScroll * 100}%`,
                  transition: 'width 1s ease-out'
                }}
              />
            </div>
            <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              Crafting digital experiences where <span className="text-purple-400 font-semibold">art meets technology</span>
            </p>
          </div>

          {/* Large feature cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div 
              className="group relative p-10 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/10 hover:border-indigo-500/50 transition-all duration-700 overflow-hidden"
              style={getTransform(0.1)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/20 group-hover:to-purple-500/10 transition-all duration-700" />
              <div className="relative z-10">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  ✨
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">Creative Vision</h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  I transform complex ideas into intuitive, beautiful interfaces. Every project is a canvas 
                  where innovation meets user-centric design, creating experiences that resonate and inspire.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full border border-indigo-500/30">UI/UX Design</span>
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">3D Graphics</span>
                  <span className="px-4 py-2 bg-pink-500/20 text-pink-300 text-sm font-medium rounded-full border border-pink-500/30">Animation</span>
                </div>
              </div>
            </div>

            <div 
              className="group relative p-10 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-700 overflow-hidden"
              style={getTransform(0.2)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/10 transition-all duration-700" />
              <div className="relative z-10">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  🚀
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">Technical Excellence</h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  Leveraging cutting-edge technologies like Three.js, WebGL, and modern frameworks to build 
                  performant, scalable solutions that push the boundaries of what's possible on the web.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">Three.js</span>
                  <span className="px-4 py-2 bg-pink-500/20 text-pink-300 text-sm font-medium rounded-full border border-pink-500/30">React</span>
                  <span className="px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm font-medium rounded-full border border-cyan-500/30">WebGL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats with animated counters */}
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
            style={getTransform(0.3)}
          >
            {[
              { value: '2+', label: 'Years', gradient: 'from-indigo-400 to-purple-400' },
              { value: '25+', label: 'Projects', gradient: 'from-purple-400 to-pink-400' },
              { value: '20+', label: 'Clients', gradient: 'from-pink-400 to-cyan-400' },
              { value: '100%', label: 'Passion', gradient: 'from-cyan-400 to-indigo-400' }
            ].map((stat, i) => (
              <div 
                key={i}
                className="group relative p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden"
                style={{
                  transform: `translateY(${Math.max(0, (1 - sectionScroll) * 50)}px)`,
                  opacity: sectionScroll,
                  transitionDelay: `${i * 0.1}s`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
                <div className="relative z-10 text-center">
                  <div className={`text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient}`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Philosophy section */}
          <div 
            className="relative p-12 bg-gradient-to-br from-white/5 via-white/0 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 mb-20"
            style={getTransform(0.4)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <h3 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                My Philosophy
              </h3>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                "Great design is invisible. It's not about flashy effects or complex animations—it's about creating 
                seamless experiences that feel natural, intuitive, and delightful. Every line of code, every pixel, 
                every interaction is an opportunity to exceed expectations and create something truly memorable."
              </p>
              <div className="inline-block">
                <button className="group px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-105">
                  <span className="flex items-center gap-2">
                    Let's Work Together
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}