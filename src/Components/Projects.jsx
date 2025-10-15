import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Projects() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [sectionScroll, setSectionScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        
        // Calculate how much of the section is visible (0 to 1)
        const visibleAmount = Math.max(0, Math.min(1, 
          (windowHeight - sectionTop) / (windowHeight + sectionHeight * 0.5)
        ));
        setSectionScroll(visibleAmount);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create diverse geometric shapes
    const geometries = [
      new THREE.TetrahedronGeometry(0.8),
      new THREE.OctahedronGeometry(0.8),
      new THREE.IcosahedronGeometry(0.8),
      new THREE.DodecahedronGeometry(0.8),
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.ConeGeometry(0.8, 1.5, 8),
      new THREE.TorusGeometry(0.6, 0.25, 16, 100),
      new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16)
    ];

    const colors = [0x6366f1, 0x8b5cf6, 0xec4899, 0x06b6d4, 0xf59e0b, 0x10b981, 0xf43f5e];
    
    const shapes = [];
    const shapeCount = 40;

    for (let i = 0; i < shapeCount; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.9,
        shininess: 100,
        flatShading: true
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Initial position - all clustered at center
      mesh.position.set(0, 0, 0);
      
      // Calculate spread position based on golden spiral
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const angle = i * goldenAngle;
      const radius = Math.sqrt(i) * 1.5;
      
      const spreadX = Math.cos(angle) * radius * 3;
      const spreadY = Math.sin(angle) * radius * 2;
      const spreadZ = (Math.random() - 0.5) * 10;
      
      mesh.userData = {
        index: i,
        spreadPos: { x: spreadX, y: spreadY, z: spreadZ },
        initialPos: { x: 0, y: 0, z: 0 },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatOffset: Math.random() * Math.PI * 2,
        color: color
      };
      
      shapes.push(mesh);
      scene.add(mesh);
    }

    // Create energy field - connecting lines
    const lineMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    const connections = [];
    const maxDistance = 8;

    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(shapes[i].userData.spreadPos.x - shapes[j].userData.spreadPos.x, 2) +
          Math.pow(shapes[i].userData.spreadPos.y - shapes[j].userData.spreadPos.y, 2)
        );
        
        if (distance < maxDistance) {
          const geometry = new THREE.BufferGeometry();
          const material = lineMaterial.clone();
          const line = new THREE.Line(geometry, material);
          connections.push({ line, shapeA: i, shapeB: j, maxOpacity: 0.3 });
          scene.add(line);
        }
      }
    }

    // Create pulsing rings that expand
    const pulseRings = [];
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.RingGeometry(0.5, 0.7, 32);
      const material = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.userData = {
        delay: i * 0.2,
        initialScale: 0.1
      };
      pulseRings.push(ring);
      scene.add(ring);
    }

    // Enhanced particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    const sizeArray = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 60;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 60;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
      
      sizeArray[i] = Math.random() * 0.6 + 0.2;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 5, 150);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 5, 150);
    pointLight2.position.set(-15, -15, 15);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x06b6d4, 4, 120);
    pointLight3.position.set(0, 15, 10);
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

      const spreadProgress = Math.min(1, Math.max(0, sectionScroll));
      const easeProgress = 1 - Math.pow(1 - spreadProgress, 3); // Ease out cubic

      // Animate shapes spreading out
      shapes.forEach((shape, i) => {
        // Interpolate between clustered and spread positions
        const stagger = (i / shapes.length) * 0.3;
        const individualProgress = Math.max(0, Math.min(1, (spreadProgress - stagger) * 2));
        
        shape.position.x = THREE.MathUtils.lerp(
          shape.userData.initialPos.x,
          shape.userData.spreadPos.x,
          individualProgress
        );
        shape.position.y = THREE.MathUtils.lerp(
          shape.userData.initialPos.y,
          shape.userData.spreadPos.y + Math.sin(time + shape.userData.floatOffset) * 0.5,
          individualProgress
        );
        shape.position.z = THREE.MathUtils.lerp(
          shape.userData.initialPos.z,
          shape.userData.spreadPos.z,
          individualProgress
        );

        // Rotation
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;

        // Scale pulsing
        const pulse = 1 + Math.sin(time * 2 + i * 0.3) * 0.15;
        shape.scale.set(pulse, pulse, pulse);

        // Glow intensity
        shape.material.emissiveIntensity = 0.3 + Math.sin(time * 3 + i * 0.2) * 0.2;
        
        // Fade in
        shape.material.opacity = 0.9 * individualProgress;
      });

      // Update connections
      connections.forEach(({ line, shapeA, shapeB, maxOpacity }) => {
        const posA = shapes[shapeA].position;
        const posB = shapes[shapeB].position;
        
        const distance = posA.distanceTo(posB);
        const opacity = maxOpacity * (1 - distance / 15) * easeProgress;
        
        if (opacity > 0) {
          line.geometry.setFromPoints([posA, posB]);
          line.material.opacity = Math.max(0, opacity);
          
          // Color based on distance
          const color = new THREE.Color().lerpColors(
            new THREE.Color(shapes[shapeA].userData.color),
            new THREE.Color(shapes[shapeB].userData.color),
            0.5
          );
          line.material.color = color;
        }
      });

      // Animate pulse rings
      pulseRings.forEach((ring, i) => {
        const ringProgress = Math.max(0, spreadProgress - ring.userData.delay);
        
        if (ringProgress > 0) {
          const scale = ring.userData.initialScale + ringProgress * 20;
          ring.scale.set(scale, scale, 1);
          ring.material.opacity = Math.max(0, 0.5 * (1 - ringProgress));
          ring.rotation.z += 0.01;
        }
      });

      // Animate particles
      const positions = particlesMesh.geometry.attributes.position.array;
      const sizes = particlesMesh.geometry.attributes.size.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Vortex motion when clustered, free flow when spread
        const vortexStrength = 1 - easeProgress;
        const angle = Math.atan2(positions[i + 1], positions[i]);
        const radius = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2);
        
        positions[i] += Math.cos(angle + time * 0.5) * 0.03 * vortexStrength;
        positions[i + 1] += Math.sin(angle + time * 0.5) * 0.03 * vortexStrength;
        positions[i + 2] += Math.sin(time + i * 0.01) * 0.02;
        
        // Wrap around
        if (Math.abs(positions[i]) > 30) positions[i] *= -0.9;
        if (Math.abs(positions[i + 1]) > 30) positions[i + 1] *= -0.9;
        if (Math.abs(positions[i + 2]) > 20) positions[i + 2] *= -0.9;
        
        // Size variation
        sizes[i / 3] = (0.2 + Math.sin(time * 2 + i * 0.05) * 0.3) * (0.5 + easeProgress * 0.5);
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;
      particlesMesh.geometry.attributes.size.needsUpdate = true;
      
      particlesMesh.rotation.y += 0.0002;
      particlesMaterial.opacity = 0.8 * Math.min(1, spreadProgress * 1.5);

      // Camera movement
      camera.position.x += (mouse.x * 3 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y * -3 - camera.position.y) * 0.03;
      camera.position.z = 20 + easeProgress * 5;
      camera.lookAt(0, 0, 0);

      // Lights orbital motion
      pointLight1.position.x = 15 * Math.cos(time * 0.3);
      pointLight1.position.z = 15 * Math.sin(time * 0.3);
      
      pointLight2.position.x = -15 * Math.cos(time * 0.4);
      pointLight2.position.z = -15 * Math.sin(time * 0.4);
      
      pointLight3.position.x = 12 * Math.sin(time * 0.5);
      pointLight3.position.y = 15 + Math.cos(time * 0.5) * 5;

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
  }, [sectionScroll]);

  const getTransform = (delay) => {
    const progress = Math.max(0, sectionScroll - delay);
    return {
      opacity: Math.min(1, progress * 2),
      transform: `translateY(${Math.max(0, (1 - progress) * 80)}px) scale(${0.85 + progress * 0.15})`,
      transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
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
          opacity: Math.min(1, sectionScroll * 1.3),
          transition: 'opacity 0.5s ease-out'
        }}
      />
      
      {/* Dynamic gradient overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% ${30 + sectionScroll * 40}%, rgba(236, 72, 153, 0.15), transparent 60%)`,
          opacity: sectionScroll,
          transition: 'all 1.5s ease-out'
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-32">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Header */}
          <div className="text-center mb-24" style={getTransform(0)}>
            <div className="inline-block mb-8">
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                <span className="text-pink-400 font-semibold text-sm">Featured Work</span>
              </div>
            </div>
            <h2 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                My Projects
              </span>
            </h2>
            <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              Where <span className="text-pink-400 font-semibold">imagination</span> meets <span className="text-indigo-400 font-semibold">innovation</span>
            </p>
          </div>

          {/* Project cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: 'Immersive 3D Portfolio',
                category: 'Web Experience',
                tech: ['Three.js', 'React', 'GSAP'],
                gradient: 'from-pink-500/20 to-purple-500/20',
                icon: '🌐',
                delay: 0.1
              },
              {
                title: 'E-Commerce Platform',
                category: 'Full Stack',
                tech: ['Next.js', 'WebGL', 'Node.js'],
                gradient: 'from-purple-500/20 to-indigo-500/20',
                icon: '🛍️',
                delay: 0.15
              },
              {
                title: 'Interactive Data Viz',
                category: 'Data Visualization',
                tech: ['D3.js', 'Three.js', 'React'],
                gradient: 'from-indigo-500/20 to-cyan-500/20',
                icon: '📊',
                delay: 0.2
              },
              {
                title: 'AR Product Showcase',
                category: 'Augmented Reality',
                tech: ['AR.js', 'Three.js', 'WebXR'],
                gradient: 'from-cyan-500/20 to-emerald-500/20',
                icon: '🥽',
                delay: 0.25
              },
              {
                title: 'Gaming Platform',
                category: 'Interactive',
                tech: ['WebGL', 'Socket.io', 'React'],
                gradient: 'from-emerald-500/20 to-yellow-500/20',
                icon: '🎮',
                delay: 0.3
              },
              {
                title: 'Creative Agency Site',
                category: 'Brand Experience',
                tech: ['Next.js', 'GSAP', 'Tailwind'],
                gradient: 'from-yellow-500/20 to-pink-500/20',
                icon: '✨',
                delay: 0.35
              }
            ].map((project, i) => (
              <div
                key={i}
                className="group relative p-8 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-pink-500/50 transition-all duration-700 overflow-hidden cursor-pointer"
                style={getTransform(project.delay)}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-all duration-700`} />
                
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-transparent blur-xl" />
                </div>

                <div className="relative z-10">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    {project.icon}
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">
                      {project.category}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-indigo-400 transition-all duration-500">
                    {project.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full border border-white/20 group-hover:border-pink-400/50 group-hover:text-pink-300 transition-all duration-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  {/* <div className="flex items-center text-pink-400 font-semibold text-sm group-hover:gap-3 gap-2 transition-all duration-300">
                    View Project
                    <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div> */}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div 
            className="text-center relative"
            style={getTransform(0.4)}
          >
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 blur-3xl opacity-50 animate-pulse" />
              <button className="relative group px-12 py-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-110 text-lg">
                <span className="flex items-center gap-3">
                  <span>View All Projects</span>
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}