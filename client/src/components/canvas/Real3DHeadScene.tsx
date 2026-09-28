"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { BiomarkerFinding } from "@/types/screening";

interface Real3DHeadSceneProps {
  findings: BiomarkerFinding[];
  selectedFinding: BiomarkerFinding | null;
  onSelectFinding: (finding: BiomarkerFinding) => void;
  viewMode: "realistic" | "muscles" | "thermal";
  showWireframe: boolean;
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

// 3D coordinates mapped onto the anatomical head model
const ANATOMICAL_HOTSPOTS_3D: Record<string, THREE.Vector3> = {
  SKIN_BARRIER_HYDRATION: new THREE.Vector3(0.0, 0.72, 0.22), // Forehead
  PERIORBITAL_EDEMA: new THREE.Vector3(-0.35, 0.35, 0.26), // Left Eye
  SCLERAL_ICTERUS_CHECK: new THREE.Vector3(0.35, 0.35, 0.26), // Right Eye
  FACIAL_ERYTHEMA: new THREE.Vector3(-0.55, -0.05, 0.18), // Zygomaticus / Malar cheek
  FACIAL_SYMMETRY_TONE: new THREE.Vector3(0.0, -0.42, 0.28), // Lips / Oral sphincter
};

export const Real3DHeadScene: React.FC<Real3DHeadSceneProps> = ({
  findings,
  selectedFinding,
  onSelectFinding,
  viewMode,
  showWireframe,
  isScanning,
  onHotspotsUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.05, y: 0.0 });
  const currentRotation = useRef({ x: 0.05, y: 0.0 });

  const sceneObjectsRef = useRef<{
    splitMesh: THREE.Mesh | null;
    muscleMesh: THREE.Mesh | null;
    skinMesh: THREE.Mesh | null;
    thermalMaterial: THREE.MeshStandardMaterial;
    // New anatomy layer groups
    skinGroup: THREE.Object3D[];
    muscleGroup: THREE.Object3D[];
    boneGroup: THREE.Object3D[];
    vesselGroup: THREE.Object3D[];
    nerveGroup: THREE.Object3D[];
    eyeGroup: THREE.Object3D[];
    noseGroup: THREE.Object3D[];
    mouthGroup: THREE.Object3D[];
  }>({
    splitMesh: null,
    muscleMesh: null,
    skinMesh: null,
    thermalMaterial: new THREE.MeshStandardMaterial({
      color: 0x0062ff,
      roughness: 0.3,
      metalness: 0.4,
      emissive: 0x002277,
      emissiveIntensity: 0.6,
    }),
    skinGroup: [],
    muscleGroup: [],
    boneGroup: [],
    vesselGroup: [],
    nerveGroup: [],
    eyeGroup: [],
    noseGroup: [],
    mouthGroup: [],
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.0, 4.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5eb, 2.5);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x90caf9, 1.4);
    fillLight.position.set(-3.5, 1.5, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    // 3. Scanning Laser Plane
    const laserGeo = new THREE.PlaneGeometry(3.0, 0.04);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xd4f938,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.y = 1.5;
    scene.add(laserMesh);

    // 4. Load Master Anatomy GLB
    const loader = new GLTFLoader();
    loader.load(
      "/models/face_anatomy.glb",
      (gltf) => {
        headGroup.add(gltf.scene);

        let splitMesh: THREE.Mesh | null = null;
        let muscleMesh: THREE.Mesh | null = null;
        let skinMesh: THREE.Mesh | null = null;
        const extraAnatomy: THREE.Object3D[] = [];

        gltf.scene.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }

          const name = child.name;
          if (name.includes("Medical_Split_Cutaway") || child.parent?.name.includes("Medical_Split_Cutaway")) {
            splitMesh = mesh;
          } else if (name.includes("Full_Muscles_Anatomy") || child.parent?.name.includes("Full_Muscles_Anatomy")) {
            muscleMesh = mesh;
          } else if (name.includes("Full_Skin_Head") || name.includes("LeePerrySmith") || child.parent?.name.includes("Full_Skin_Head")) {
            skinMesh = mesh;
          } else if (mesh.isMesh) {
            extraAnatomy.push(mesh);
          }
        });

        sceneObjectsRef.current.splitMesh = splitMesh;
        sceneObjectsRef.current.muscleMesh = muscleMesh;
        sceneObjectsRef.current.skinMesh = skinMesh;

        // Center and scale to fit camera view perfectly
        const bbox = new THREE.Box3().setFromObject(headGroup);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());

        const targetHeight = 2.8;
        const scaleFactor = targetHeight / (size.y || 1);
        gltf.scene.scale.set(scaleFactor, scaleFactor, scaleFactor);
        gltf.scene.position.set(
          -center.x * scaleFactor,
          -center.y * scaleFactor + 0.05,
          -center.z * scaleFactor
        );

        // Initial visibility
        if (splitMesh) (splitMesh as THREE.Mesh).visible = true;
        if (muscleMesh) (muscleMesh as THREE.Mesh).visible = false;
        if (skinMesh) (skinMesh as THREE.Mesh).visible = false;
      },
      undefined,
      (err) => {
        console.error("Failed to load face_anatomy.glb:", err);
      }
    );



    // 5. Interactive Mouse Orbit Controls
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        targetRotation.current.y += deltaX * 0.009;
        targetRotation.current.x += deltaY * 0.009;
        targetRotation.current.x = Math.max(-0.75, Math.min(0.75, targetRotation.current.x));
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      } else {
        const rect = container.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotation.current.y = normX * 0.45;
        targetRotation.current.x = normY * 0.35;
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
        targetRotation.current.y += deltaX * 0.01;
        targetRotation.current.x += deltaY * 0.01;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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

    // 6. Animation Loop
    let animationFrameId: number;
    let startTime = performance.now();
    let laserY = 1.6;
    let laserDir = -1;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      headGroup.rotation.x = currentRotation.current.x;
      headGroup.rotation.y = currentRotation.current.y;

      // Breathing animation float
      headGroup.position.y = Math.sin(elapsed * 1.5) * 0.04;

      // Scanning Laser
      if (isScanning) {
        laserMesh.visible = true;
        laserY += laserDir * 0.04;
        if (laserY < -1.6) laserDir = 1;
        if (laserY > 1.6) laserDir = -1;
        laserMesh.position.y = laserY;
      } else {
        laserMesh.visible = false;
      }

      renderer.render(scene, camera);

      // Project 3D Hotspots
      const projectedHotspots: Array<{
        id: string;
        x: number;
        y: number;
        visible: boolean;
        finding: BiomarkerFinding;
      }> = [];

      findings.forEach((finding) => {
        const localPos = ANATOMICAL_HOTSPOTS_3D[finding.code];
        if (!localPos) return;

        const worldPos = localPos.clone();
        worldPos.applyEuler(headGroup.rotation);
        worldPos.add(headGroup.position);

        const isFacingFront = worldPos.z > -0.15;
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
  }, [findings, isScanning]);

  // Update viewMode and wireframe dynamically
  useEffect(() => {
    const { splitMesh, muscleMesh, skinMesh, thermalMaterial } = sceneObjectsRef.current;

    if (splitMesh) splitMesh.visible = viewMode === "realistic";
    if (muscleMesh) muscleMesh.visible = viewMode === "muscles";
    if (skinMesh) skinMesh.visible = viewMode === "thermal";

    const activeMesh = viewMode === "muscles" ? muscleMesh : viewMode === "thermal" ? skinMesh : splitMesh;

    if (activeMesh && activeMesh.material) {
      if (Array.isArray(activeMesh.material)) {
        activeMesh.material.forEach((m) => {
          if ("wireframe" in m) (m as THREE.MeshStandardMaterial).wireframe = showWireframe;
        });
      } else if ("wireframe" in activeMesh.material) {
        (activeMesh.material as THREE.MeshStandardMaterial).wireframe = showWireframe;
      }
    }
  }, [viewMode, showWireframe]);


  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
};
