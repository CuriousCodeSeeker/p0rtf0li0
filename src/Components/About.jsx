import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function VisualShowcaseSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Generate multiple small cubes
    const cubes = [];
    const cubeCount = 20;
    const colors = [0x6366f1, 0x8b5cf6, 0xec4899, 0x06b6d4];

    for (let i = 0; i < cubeCount; i++) {
      const size = Math.random() * 0.5 + 0.3; // smaller cubes
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        metalness: 0.6,
        roughness: 0.2,
      });
      const cube = new THREE.Mesh(geometry, material);

      // Random positions
      cube.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10
      );

      scene.add(cube);
      cubes.push(cube);
    }

    // Raycaster for hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredCube = null;

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);

      // Reset hoveredCube each frame
      let currentlyHovered = null;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cubes);

      if (intersects.length > 0) {
        currentlyHovered = intersects[0].object;
      }

      // If we had a previously hovered cube but now it's not hovered → reset scale
      if (hoveredCube && hoveredCube !== currentlyHovered) {
        hoveredCube.scale.set(1, 1, 1);
      }

      // If hovering a cube → spin it
      if (currentlyHovered) {
        currentlyHovered.rotation.x += 0.05;
        currentlyHovered.rotation.y += 0.05;
        currentlyHovered.scale.set(1.3, 1.3, 1.3);
      }

      // Update the reference
      hoveredCube = currentlyHovered;

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

  return (
    <section className="relative w-full h-screen bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Interactive Cubes
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Hover over the cubes to make only that one spin ✨
        </p>
      </div>
    </section>
  );
}
