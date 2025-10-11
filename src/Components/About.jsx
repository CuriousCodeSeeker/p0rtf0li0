import React, { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from "react";


import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Enhanced GLSL shader with scroll-driven spiral rotation
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  // 2D noise (iq)
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(in vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  // Rotate function
  vec2 rotate(vec2 v, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
  }

  void main() {
    vec2 uv = vUv;
    vec2 st = uv * vec2(uResolution.x / uResolution.y, 1.0);
    
    // Center coordinates
    vec2 center = vec2(0.0);
    vec2 pos = st - center;
    
    // Enhanced scroll-driven spiral with escape animation
    float spiralRotation = uScrollProgress * 3.14159 * 4.0;
    float spiralTightness = 0.3 + uScrollProgress * 2.0;
    float spiralRadius = length(pos) * spiralTightness;
    float spiralAngle = atan(pos.y, pos.x) + spiralRotation;
    
    // Create dynamic spiral pattern that intensifies with scroll
    float spiral = sin(spiralAngle * 2.0 + spiralRadius * 1.5 - uTime * 3.0);
    spiral = smoothstep(0.2, 0.8, spiral);
    
    // Add spiral escape effect (spiral moves outward and rotates faster)
    float escapePhase = max(0.0, (uScrollProgress - 0.6) / 0.4);
    float escapeRotation = escapePhase * 3.14159 * 6.0;
    float escapeRadius = escapePhase * 2.0;
    
    // Rotate coordinates with escape animation
    vec2 rotatedPos = rotate(pos, uScrollProgress * 2.0 + escapeRotation);
    
    // Add escape displacement
    rotatedPos += vec2(sin(escapeRotation) * escapeRadius, cos(escapeRotation) * escapeRadius * 0.5);
    
    // Time with scroll influence
    float t = uTime * 0.1 + uScrollProgress * 2.0;
    
    // Multi-layered noise with scroll-driven rotation
    float n1 = noise(rotatedPos * 2.0 + vec2(t, 0.0));
    float n2 = noise(rotatedPos * 3.0 + vec2(0.0, t));
    float n3 = noise(rotatedPos * 4.0 + vec2(-t, t));
    
    // Mouse parallax with scroll influence
    vec2 m = (uMouse - 0.5) * 0.3 * (1.0 + uScrollProgress);
    float swirl = noise((rotatedPos + m) * 2.5 + t);
    
    // Color mixing with scroll influence
    vec3 colA = vec3(0.39, 0.40, 0.95); // indigo-400
    vec3 colB = vec3(0.55, 0.36, 0.96); // purple-400
    vec3 colC = vec3(0.93, 0.31, 0.60); // pink-400
    
    // Scroll-driven color intensity
    float colorIntensity = 0.8 + uScrollProgress * 0.4;
    
    float band1 = smoothstep(0.25, 0.75, n1);
    float band2 = smoothstep(0.3, 0.8, n2);
    float band3 = smoothstep(0.35, 0.85, n3);
    
    vec3 color = mix(colA, colB, band1);
    color = mix(color, colC, band2 * 0.6 + band3 * 0.4);
    
    // Add enhanced spiral effect with escape animation
    float spiralIntensity = spiral * (1.0 + escapePhase * 2.0);
    color = mix(color, color * 2.0, spiralIntensity * 0.4);
    
    // Dynamic vignette that expands during escape
    float vignetteRadius = 0.95 - uScrollProgress * 0.3 - escapePhase * 0.4;
    float vignette = smoothstep(vignetteRadius, 0.2, length(uv - 0.5));
    color *= vignette * (1.2 + uScrollProgress * 0.5);
    
    // Enhanced swirl glow with escape effect
    float glowIntensity = 0.08 * (1.0 + uScrollProgress * 0.8 + escapePhase * 1.5);
    color += glowIntensity * swirl;
    
    // Add scroll-driven brightness with escape fade
    float brightness = 0.8 + uScrollProgress * 0.6 - escapePhase * 0.3;
    color *= brightness;
    
    // Add escape trail effect
    if (escapePhase > 0.0) {
      float trail = sin(spiralAngle * 4.0 + uTime * 5.0) * escapePhase;
      color += vec3(0.1, 0.2, 0.4) * trail * escapePhase;
    }
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function VisualShowcaseSection() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isPreloaded, setIsPreloaded] = useState(false);
  
  // Memoized shader uniforms for better performance
  const initialUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScrollProgress: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
  }), []);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set([headingRef.current, subRef.current], { autoAlpha: 0, y: 24 });

      gsap.timeline({
        defaults: { ease: "power3.out", duration: 1.1 }
      })
      .to(headingRef.current, { autoAlpha: 1, y: 0 })
      .to(subRef.current, { autoAlpha: 1, y: 0 }, "<0.1");

      // Scroll-linked slight parallax
      gsap.to([headingRef.current, subRef.current], {
        yPercent: (i) => (i === 0 ? -6 : -10),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let scrollTicking = false;
    let mouseTicking = false;

    const handleScroll = () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
            setScrollProgress(progress);
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };

    const handleMouseMove = (e) => {
      if (!mouseTicking) {
        requestAnimationFrame(() => {
          setMousePosition({
            x: e.clientX / window.innerWidth,
            y: 1.0 - e.clientY / window.innerHeight
          });
          mouseTicking = false;
        });
        mouseTicking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const preloadAboutScene = async () => {
      try {
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Use memoized uniforms for better performance
        const uniforms = { ...initialUniforms };

        const geometry = new THREE.PlaneGeometry(2, 2);
        // Optimized shader material
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false, // Optimize for transparency
          depthTest: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        // Pre-render to warm up GPU
        renderer.render(scene, camera);
        
        setIsPreloaded(true);
      } catch (error) {
        console.error('Error during About preloading:', error);
        setIsPreloaded(true); // Fallback
      }

    let rafId = 0;
    const clock = new THREE.Clock();

    const onResize = () => {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onResize);

    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    
    // Cache uniform updates to avoid unnecessary calculations
    let lastScrollProgress = -1;
    let lastMouseX = -1;
    let lastMouseY = -1;

    // Optimized render loop - avoid per-frame React state updates
    const render = useCallback((currentTime) => {
      if (currentTime - lastTime >= frameInterval) {
        // Only update uniforms when values actually change
        const currentTimeValue = clock.getElapsedTime();
        uniforms.uTime.value = currentTimeValue;
        
        if (scrollProgress !== lastScrollProgress) {
          uniforms.uScrollProgress.value = scrollProgress;
          lastScrollProgress = scrollProgress;
        }
        
        if (mousePosition.x !== lastMouseX || mousePosition.y !== lastMouseY) {
          uniforms.uMouse.value.set(mousePosition.x, mousePosition.y);
          lastMouseX = mousePosition.x;
          lastMouseY = mousePosition.y;
        }
        
        renderer.render(scene, camera);
        lastTime = currentTime;
      }
      rafId = requestAnimationFrame(render);
    }, [scrollProgress, mousePosition, uniforms, clock, renderer, scene, camera]);
    rafId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", onResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    };
    
    preloadAboutScene();
    
    // Fallback timeout for About section
    const timeoutId = setTimeout(() => {
      if (!isPreloaded) {
        console.warn('About preloading timeout - showing content anyway');
        setIsPreloaded(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [scrollProgress, mousePosition]);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950"
      style={{ opacity: isPreloaded ? 1 : 0, transition: 'opacity 0.5s ease-in' }}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

      {/* Enhanced vignette overlay with spiral transition */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-950/80 pointer-events-none"
        style={{
          opacity: Math.max(0.3, 1 - scrollProgress * 0.8),
          transition: 'opacity 1s ease-out'
        }}
      />
      
      {/* Spiral escape effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: Math.max(0, Math.min(1, (scrollProgress - 0.7) * 3)),
          background: `conic-gradient(from ${scrollProgress * 360}deg, transparent 0%, rgba(99, 102, 241, 0.2) 30%, rgba(139, 92, 246, 0.2) 60%, transparent 100%)`,
          transform: `scale(${1 + scrollProgress * 2}) rotate(${scrollProgress * 720}deg)`,
          transition: 'all 1.5s ease-out'
        }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
        <div 
          className="max-w-3xl"
          style={{
            opacity: Math.max(0, Math.min(1, (scrollProgress - 0.2) * 2)),
            transform: `translateY(${Math.max(0, (1 - scrollProgress) * 100)}px) scale(${0.8 + scrollProgress * 0.2})`,
            transition: 'all 1s ease-out'
          }}
        >
          <h2 ref={headingRef} className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            About
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">This Portfolio</span>
          </h2>
          <p ref={subRef} className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed">
            Built with Three.js and custom GLSL shaders, this section brings a living, aurora-like background that subtly reacts to your cursor and scroll. GSAP powers smooth entrances and micro-parallax for a premium, cohesive feel with the hero.
          </p>
        </div>
      </div>
    </section>
  );
}