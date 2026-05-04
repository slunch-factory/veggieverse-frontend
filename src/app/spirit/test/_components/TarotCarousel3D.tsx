'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const CARD_BACK = `${BASE}/images/tarot/card-back.png`;

const CARDS = [
  { image: `${BASE}/images/tarot/diet-type/garden.png`, title: 'The Garden' },
  { image: `${BASE}/images/tarot/diet-type/ocean.png`, title: 'The Sea' },
  { image: `${BASE}/images/tarot/diet-type/dawn.png`, title: 'The Dawn' },
  { image: `${BASE}/images/tarot/diet-type/balance.png`, title: 'The Balance' },
  { image: `${BASE}/images/tarot/diet-type/feast.png`, title: 'The Feast' },
  { image: `${BASE}/images/tarot/priority/scale.png`, title: 'The Scale' },
  { image: `${BASE}/images/tarot/priority/wind.png`, title: 'The Feather' },
  { image: `${BASE}/images/tarot/priority/compass.png`, title: 'The Compass' },
  { image: `${BASE}/images/tarot/food-mood/heritage.png`, title: 'The Heritage' },
  { image: `${BASE}/images/tarot/food-mood/alchemy.png`, title: 'The Flame' },
];

const CARD_W = 1.4;
const CARD_H = 2.4;
const RADIUS = 5.5;
const N = CARDS.length;
const ROTATION_SPEED = 0.003;

export default function TarotCarousel3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06061a);
    scene.fog = new THREE.FogExp2(0x06061a, 0.038);

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 2.5, 13);
    camera.lookAt(0, 0, 0);

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    // ── Lighting ───────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x3344aa, 0.7));

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(4, 8, 10);
    scene.add(mainLight);

    const purpleGlow = new THREE.PointLight(0x9966ff, 3, 18);
    purpleGlow.position.set(0, 4, 9);
    scene.add(purpleGlow);

    const blueRim = new THREE.PointLight(0x3366ff, 2, 15);
    blueRim.position.set(-7, -1, -3);
    scene.add(blueRim);

    // ── Stars ──────────────────────────────────────────────────────────────
    const starPos = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) starPos[i] = (Math.random() - 0.5) * 80;
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.07,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
    });
    scene.add(new THREE.Points(starGeom, starMat));

    // ── Base ring glow ─────────────────────────────────────────────────────
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7744ff, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(RADIUS, 0.06, 8, 128), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.6;
    scene.add(ring);

    // ── Floor glow (canvas gradient) ───────────────────────────────────────
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = floorCanvas.height = 512;
    const ctx = floorCanvas.getContext('2d')!;
    const radGrad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    radGrad.addColorStop(0, 'rgba(80,40,200,0.35)');
    radGrad.addColorStop(0.5, 'rgba(40,20,100,0.15)');
    radGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 512, 512);
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(10, 64),
      new THREE.MeshBasicMaterial({ map: floorTex, transparent: true }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.6;
    scene.add(floor);

    // ── Carousel ───────────────────────────────────────────────────────────
    const carousel = new THREE.Group();
    scene.add(carousel);

    const loader = new THREE.TextureLoader();
    const backTex = loader.load(CARD_BACK);
    backTex.colorSpace = THREE.SRGBColorSpace;

    // Shared box geometry (thin card)
    const boxGeom = new THREE.BoxGeometry(CARD_W, CARD_H, 0.025);
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x1a0d2e, metalness: 0.3, roughness: 0.7 });

    const cardGroups: THREE.Group[] = [];

    CARDS.forEach((card, i) => {
      const angle = (i / N) * Math.PI * 2;

      const frontTex = loader.load(card.image);
      frontTex.colorSpace = THREE.SRGBColorSpace;

      const frontMat = new THREE.MeshStandardMaterial({ map: frontTex, metalness: 0.08, roughness: 0.35 });
      const backMat = new THREE.MeshStandardMaterial({ map: backTex, metalness: 0.08, roughness: 0.35 });

      // BoxGeometry face order: +X, -X, +Y, -Y, +Z (front), -Z (back)
      const mesh = new THREE.Mesh(boxGeom, [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat]);

      const group = new THREE.Group();
      group.add(mesh);
      group.position.set(Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS);
      group.rotation.y = angle;

      carousel.add(group);
      cardGroups.push(group);
    });

    // ── Mouse drag for manual rotation ────────────────────────────────────
    let isDragging = false;
    let dragStartX = 0;
    let dragVelocity = 0;
    let lastDragX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      lastDragX = e.clientX;
      dragVelocity = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      dragVelocity = (e.clientX - lastDragX) * 0.003;
      lastDragX = e.clientX;
      carousel.rotation.y += (e.clientX - dragStartX) * 0.001;
      dragStartX = e.clientX;
    };

    const onPointerUp = () => { isDragging = false; };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ── Animation loop ────────────────────────────────────────────────────
    let raf: number;
    const clock = new THREE.Clock();
    let lastFrontIdx = -1;

    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!isDragging) {
        // Blend drag inertia with auto rotation
        dragVelocity *= 0.92;
        carousel.rotation.y += dragVelocity - ROTATION_SPEED;
      }

      let frontIdx = 0;
      let minDist = Infinity;

      cardGroups.forEach((g, i) => {
        const baseAngle = (i / N) * Math.PI * 2;
        const worldAngle = baseAngle + carousel.rotation.y;

        // Bobbing
        g.position.y = Math.sin(t * 0.9 + baseAngle) * 0.2;

        // Scale: front card pops slightly
        const cos = Math.cos(worldAngle);
        g.scale.setScalar(0.88 + Math.max(0, cos) * 0.14);

        // Find front card
        const norm = ((worldAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const d = Math.min(norm, Math.PI * 2 - norm);
        if (d < minDist) { minDist = d; frontIdx = i; }
      });

      if (frontIdx !== lastFrontIdx && titleRef.current) {
        titleRef.current.textContent = CARDS[frontIdx].title;
        lastFrontIdx = frontIdx;
      }

      // Pulse glow
      purpleGlow.intensity = 3 + Math.sin(t * 1.2) * 0.8;
      ringMat.opacity = 0.45 + Math.sin(t * 1.5) * 0.1;

      renderer.render(scene, camera);
    }

    animate();

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
      starGeom.dispose();
      starMat.dispose();
      boxGeom.dispose();
      floorTex.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', cursor: 'grab' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top title */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '2.5rem',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <h1 style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
          fontWeight: 300,
          color: 'rgba(210, 185, 255, 0.92)',
          letterSpacing: '0.35em',
          textShadow: '0 0 30px rgba(160, 100, 255, 0.8), 0 0 60px rgba(100, 60, 200, 0.4)',
          margin: 0,
          textTransform: 'uppercase',
        }}>
          Veggieverse Tarot
        </h1>
        <p style={{
          color: 'rgba(170, 145, 230, 0.7)',
          fontSize: 'clamp(0.7rem, 1.8vw, 0.95rem)',
          letterSpacing: '0.25em',
          marginTop: '0.6rem',
          fontFamily: 'Georgia, serif',
        }}>
          당신의 채식 스피릿을 찾아보세요
        </p>
      </div>

      {/* Bottom card title */}
      <div style={{
        position: 'absolute',
        bottom: '3.5rem',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <div ref={titleRef} style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
          fontWeight: 400,
          color: 'rgba(220, 200, 255, 0.9)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(160, 100, 255, 0.9)',
        }}>
          {CARDS[0].title}
        </div>
        <p style={{
          color: 'rgba(150, 130, 200, 0.6)',
          fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)',
          letterSpacing: '0.15em',
          marginTop: '0.4rem',
          fontFamily: 'Georgia, serif',
        }}>
          드래그하여 카드를 탐색하세요
        </p>
      </div>
    </div>
  );
}
