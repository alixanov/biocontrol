"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BiomarkerFinding } from "@/types/screening";

interface ThreeFaceSceneProps {
  findings: BiomarkerFinding[];
  selectedFinding: BiomarkerFinding | null;
  onSelectFinding: (finding: BiomarkerFinding) => void;
  viewMode: "anatomical" | "thermal";
  showMeshOverlay: boolean;
  isScanning: boolean;
  onHotspotsUpdate: (
    projected: Array<{
      id: string;
      x: number;
      y: number;
      visible: boolean;
      finding: BiomarkerFinding;
    }>
  ) => void;
}

// 3D coordinates for biomarkers on the head model
const BIOMARKER_3D_POINTS: Record<string, THREE.Vector3> = {
  FACIAL_ERYTHEMA: new THREE.Vector3(-0.65, -0.15, 1.15), // Malar right cheek
  PERIORBITAL_EDEMA: new THREE.Vector3(-0.55, 0.45, 1.05), // Infraorbital right
  SCLERAL_ICTERUS_CHECK: new THREE.Vector3(0.55, 0.55, 1.05), // Left eye orbit
  FACIAL_SYMMETRY_TONE: new THREE.Vector3(0.0, -0.65, 1.25), // Nasolabial / Philtrum
  SKIN_BARRIER_HYDRATION: new THREE.Vector3(0.1, 1.15, 0.95), // Forehead crest
};

export const ThreeFaceScene: React.FC<ThreeFaceSceneProps> = ({
  findings,
  selectedFinding,
  onSelectFinding,
  viewMode,
  showMeshOverlay,
  isScanning,
  onHotspotsUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: -0.05, y: -0.35 }); // Initial 3/4 turn angle
  const currentRotation = useRef({ x: -0.05, y: -0.35 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Head & Sculpted Organic Group
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // Master Materials
    const porcelainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5f7fb,
      roughness: 0.28,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      reflectivity: 0.8,
    });

    const thermalMaterial = new THREE.MeshStandardMaterial({
      color: 0x0062ff,
      roughness: 0.4,
      metalness: 0.3,
      wireframe: false,
    });

    // Wireframe Mesh overlay
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4f938,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    // 2a. Anatomical Sculpted Head Structure
    // Cranial Dome
    const craniumGeo = new THREE.SphereGeometry(1.2, 48, 48);
    craniumGeo.scale(0.92, 1.25, 1.05);
    const cranium = new THREE.Mesh(craniumGeo, porcelainMaterial);
    cranium.position.set(0, 0.15, 0);
    headGroup.add(cranium);

    // Wireframe duplicate
    const craniumWire = new THREE.Mesh(craniumGeo, wireframeMaterial);
    craniumWire.position.copy(cranium.position);
    craniumWire.scale.set(1.005, 1.005, 1.005);
    headGroup.add(craniumWire);

    // Facial Frontal Mask
    const faceMaskGeo = new THREE.SphereGeometry(1.05, 36, 36);
    faceMaskGeo.scale(0.85, 1.1, 0.95);
    const faceMask = new THREE.Mesh(faceMaskGeo, porcelainMaterial);
    faceMask.position.set(0, -0.05, 0.35);
    headGroup.add(faceMask);

    // Cheekbones (Malar Crests)
    const leftCheekGeo = new THREE.SphereGeometry(0.38, 24, 24);
    leftCheekGeo.scale(1.2, 0.7, 0.9);
    const leftCheek = new THREE.Mesh(leftCheekGeo, porcelainMaterial);
    leftCheek.position.set(-0.62, -0.1, 0.95);
    headGroup.add(leftCheek);

    const rightCheek = leftCheek.clone();
    rightCheek.position.set(0.62, -0.1, 0.95);
    headGroup.add(rightCheek);

    // Nose Bridge & Cartilage
    const noseGeo = new THREE.ConeGeometry(0.24, 0.85, 20);
    noseGeo.rotateX(Math.PI / 8);
    const nose = new THREE.Mesh(noseGeo, porcelainMaterial);
    nose.position.set(0, 0.15, 1.25);
    nose.scale.set(0.7, 1.0, 0.7);
    headGroup.add(nose);

    // Jawline & Chin
    const chinGeo = new THREE.SphereGeometry(0.42, 24, 24);
    chinGeo.scale(0.9, 0.8, 1.1);
    const chin = new THREE.Mesh(chinGeo, porcelainMaterial);
    chin.position.set(0, -0.95, 0.85);
    headGroup.add(chin);

    // Orbital Sockets / Eyes
    const eyeSocketGeo = new THREE.SphereGeometry(0.26, 24, 24);
    const leftEye = new THREE.Mesh(eyeSocketGeo, porcelainMaterial);
    leftEye.position.set(-0.48, 0.48, 0.98);
    headGroup.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.set(0.48, 0.48, 0.98);
    headGroup.add(rightEye);

    // 2b. Organic Liquid Droplets & Floating Bubbles (Matching the user's reference)
    const liquidDroplets: Array<{
      mesh: THREE.Mesh;
      initialPos: THREE.Vector3;
      speed: number;
      amplitude: number;
    }> = [];

    const dropletColors = [0xd4f938, 0x00e5ff, 0xd946ef, 0xff9e0b, 0xffffff];

    const dropletPositions = [
      { pos: new THREE.Vector3(-0.85, 0.35, 1.1), scale: 0.28 },
      { pos: new THREE.Vector3(-0.55, -0.45, 1.25), scale: 0.35 },
      { pos: new THREE.Vector3(0.85, 0.4, 0.9), scale: 0.32 },
      { pos: new THREE.Vector3(0.35, -0.85, 1.15), scale: 0.25 },
      { pos: new THREE.Vector3(-0.25, 1.35, 0.9), scale: 0.26 },
      { pos: new THREE.Vector3(0.65, -0.35, 1.2), scale: 0.29 },
      { pos: new THREE.Vector3(-1.05, -0.15, 0.65), scale: 0.42 },
      { pos: new THREE.Vector3(0.95, 0.9, 0.45), scale: 0.22 },
    ];

    dropletPositions.forEach((d, index) => {
      const dropGeo = new THREE.SphereGeometry(d.scale, 32, 32);
      dropGeo.scale(1.15, 0.85, 1.0); // Organic oblong shape

      const dropMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        transmission: 0.3,
        ior: 1.45,
      });

      const dropMesh = new THREE.Mesh(dropGeo, dropMat);
      dropMesh.position.copy(d.pos);
      headGroup.add(dropMesh);

      liquidDroplets.push({
        mesh: dropMesh,
        initialPos: d.pos.clone(),
        speed: 1.2 + (index % 3) * 0.4,
        amplitude: 0.08 + (index % 2) * 0.04,
      });
    });

    // 2c. Scanning Laser Plane
    const laserPlaneGeo = new THREE.PlaneGeometry(3.5, 0.04);
    const laserPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xd4f938,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const laserPlane = new THREE.Mesh(laserPlaneGeo, laserPlaneMat);
    laserPlane.rotation.x = Math.PI / 2;
    laserPlane.position.y = 2.0;
    scene.add(laserPlane);

    // 3. Cinematic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Main key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // Cyan Fill light
    const fillLight = new THREE.DirectionalLight(0x00e5ff, 1.5);
    fillLight.position.set(-5, 2, 4);
    scene.add(fillLight);

    // Magenta Rim Light (giving the iridescent edge sheen from the photo)
    const rimLight = new THREE.DirectionalLight(0xd946ef, 2.2);
    rimLight.position.set(0, -4, -4);
    scene.add(rimLight);

    // Warm Gold Accent Light
    const goldLight = new THREE.DirectionalLight(0xffaa00, 1.2);
    goldLight.position.set(3, -2, 3);
    scene.add(goldLight);

    // 4. Mouse Orbit Controls (Interactive Drag & Parallax)
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        targetRotation.current.y += deltaX * 0.007;
        targetRotation.current.x += deltaY * 0.007;
        targetRotation.current.x = Math.max(
          -0.6,
          Math.min(0.6, targetRotation.current.x)
        );
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      } else {
        // Subtle Parallax float on hover
        const rect = container.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotation.current.y = -0.35 + normX * 0.45;
        targetRotation.current.x = -0.05 + normY * 0.35;
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Touch support for mobile/tablets
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePosition.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
        targetRotation.current.y += deltaX * 0.008;
        targetRotation.current.x += deltaY * 0.008;
        previousMousePosition.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 5. Animation Loop
    let animationFrameId: number;
    let startTime = performance.now();
    let laserY = 1.8;
    let laserDirection = -1;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth Lerp Rotation
      currentRotation.current.x +=
        (targetRotation.current.x - currentRotation.current.x) * 0.06;
      currentRotation.current.y +=
        (targetRotation.current.y - currentRotation.current.y) * 0.06;

      headGroup.rotation.x = currentRotation.current.x;
      headGroup.rotation.y = currentRotation.current.y;

      // Gentle Ambient Breathing Float
      headGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.06;

      // Animate Organic Liquid Droplets
      liquidDroplets.forEach((d) => {
        const offset = Math.sin(elapsedTime * d.speed) * d.amplitude;
        d.mesh.position.y = d.initialPos.y + offset;
        d.mesh.position.x = d.initialPos.x + Math.cos(elapsedTime * d.speed * 0.8) * (d.amplitude * 0.5);
      });

      // Scan Laser Animation
      if (isScanning) {
        laserPlane.visible = true;
        laserY += laserDirection * 0.04;
        if (laserY < -1.8) laserDirection = 1;
        if (laserY > 1.8) laserDirection = -1;
        laserPlane.position.y = laserY;
      } else {
        laserPlane.visible = false;
      }

      // Material view switch
      const activeMat = (viewMode === "thermal" ? thermalMaterial : porcelainMaterial) as any;
      cranium.material = activeMat;
      faceMask.material = activeMat;
      leftCheek.material = activeMat;
      rightCheek.material = activeMat;
      nose.material = activeMat;
      chin.material = activeMat;
      leftEye.material = activeMat;
      rightEye.material = activeMat;
      craniumWire.visible = showMeshOverlay;

      renderer.render(scene, camera);

      // Project 3D Hotspot Nodes to Screen Coordinates
      const projectedHotspots: Array<{
        id: string;
        x: number;
        y: number;
        visible: boolean;
        finding: BiomarkerFinding;
      }> = [];

      findings.forEach((finding) => {
        const localPos = BIOMARKER_3D_POINTS[finding.code];
        if (!localPos) return;

        const worldPos = localPos.clone();
        worldPos.applyEuler(headGroup.rotation);
        worldPos.add(headGroup.position);

        // Check if facing the camera (positive Z in view space)
        const isFacingFront = worldPos.z > -0.2;

        worldPos.project(camera);

        const screenX = ((worldPos.x + 1) * width) / 2;
        const screenY = ((-worldPos.y + 1) * height) / 2;

        projectedHotspots.push({
          id: finding.id,
          x: screenX,
          y: screenY,
          visible: isFacingFront,
          finding,
        });
      });

      onHotspotsUpdate(projectedHotspots);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [findings, viewMode, showMeshOverlay, isScanning]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
};
