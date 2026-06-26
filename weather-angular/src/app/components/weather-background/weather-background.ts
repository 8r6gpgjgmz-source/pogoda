import { Component, OnInit, OnDestroy, ElementRef, ViewChild, input, effect } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-weather-background',
  templateUrl: './weather-background.html',
  styleUrl: './weather-background.css',
})
export class WeatherBackground implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  weatherCode = input<number>(0);
  darkMode = input<boolean>(true);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationId!: number;
  private objects: THREE.Object3D[] = [];
  private intervalId: any = null;
  private useFallback = false;

  constructor() {
    effect(() => {
      const code = this.weatherCode();
      this.darkMode();
      if (this.useFallback) {
        this.applyFallback(code);
      } else if (this.scene) {
        this.buildScene(code);
      }
    });
  }

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    } catch {
      this.useFallback = true;
    }

    if (this.useFallback || !this.renderer.getContext()) {
      this.useFallback = true;
      canvas.style.display = 'none';
      this.applyFallback(this.weatherCode());
      return;
    }

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.zIndex = '-1';
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 10;
    this.buildScene(this.weatherCode());
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.renderer) this.renderer.dispose();
  }

  private applyFallback(code: number): void {
    const dark = this.darkMode();
    let colors: [string, string];
    if (code === -1) {
      colors = dark ? ['#0a0a1a', '#1a1a2e'] : ['#263238', '#37474f'];
    } else if (code === 0) {
      colors = dark ? ['#1a6fc4', '#0d3a6b'] : ['#87CEEB', '#4a90d9'];
    } else if (code <= 3) {
      colors = dark ? ['#6b8cae', '#3a4a5e'] : ['#b0c4de', '#8fa3bd'];
    } else if (code >= 61 && code <= 67) {
      colors = dark ? ['#2c3e50', '#1a252f'] : ['#607d8b', '#455a64'];
    } else if (code >= 71 && code <= 77) {
      colors = dark ? ['#7a8fa6', '#4a5a6e'] : ['#e8f4f8', '#c5dde6'];
    } else if (code >= 95) {
      colors = dark ? ['#1a1a2e', '#0d0d1a'] : ['#37474f', '#263238'];
    } else {
      colors = dark ? ['#6b8cae', '#3a4a5e'] : ['#b0c4de', '#8fa3bd'];
    }
    document.body.style.background = `linear-gradient(160deg, ${colors[0]}, ${colors[1]})`;
    document.body.style.backgroundAttachment = 'fixed';
  }

  private clearScene(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.objects.forEach(o => this.scene.remove(o));
    this.objects = [];
  }

  private buildScene(code: number): void {
    this.clearScene();

    if (code === -1) {
      this.buildUnknown();
    } else if (code === 0) {
      this.buildSunny();
    } else if (code <= 3) {
      this.buildCloudy();
    } else if (code >= 61 && code <= 67) {
      this.buildRainy();
    } else if (code >= 71 && code <= 77) {
      this.buildSnowy();
    } else if (code >= 95) {
      this.buildStormy();
    } else {
      this.buildCloudy();
    }
  }

  private buildSunny(): void {
    this.scene.background = new THREE.Color(this.darkMode() ? '#1a6fc4' : '#87CEEB');
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2, 32, 32),
      new THREE.MeshBasicMaterial({ color: '#FFD700' })
    );
    sun.position.set(12, 5, -5)
    this.scene.add(sun);
    this.objects.push(sun);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const ray = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 2),
        new THREE.MeshBasicMaterial({ color: '#FFD700' })
      );
      ray.position.set(12 + Math.cos(angle) * 3, 5 + Math.sin(angle) * 3, -5);
      ray.rotation.z = angle;
      this.scene.add(ray);
      this.objects.push(ray);
    }
  }

  private buildCloudy(): void {
    this.scene.background = new THREE.Color(this.darkMode() ? '#6b8cae' : '#b0c4de');
    for (let i = 0; i < 6; i++) {
      const cloud = this.makeCloud();
      cloud.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5 - 3);
      this.scene.add(cloud);
      this.objects.push(cloud);
    }
  }

  private buildRainy(): void {
    this.scene.background = new THREE.Color(this.darkMode() ? '#2c3e50' : '#607d8b');
    this.buildCloudy();

    const positions = new Float32Array(1500);
    for (let i = 0; i < 1500; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rain = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#88bbff', size: 0.05 }));
    this.scene.add(rain);
    this.objects.push(rain);
  }

  private buildSnowy(): void {
    this.scene.background = new THREE.Color(this.darkMode() ? '#b0c4de' : '#e8f4f8');
    const positions = new Float32Array(2000);
    for (let i = 0; i < 2000; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const snow = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.1 }));
    this.scene.add(snow);
    this.objects.push(snow);
  }

  private buildStormy(): void {
    this.scene.background = new THREE.Color(this.darkMode() ? '#1a1a2e' : '#37474f');
    this.buildCloudy();

    const points = [
      new THREE.Vector3(-6, 4, 2),
      new THREE.Vector3(-5.5, 2, 2),
      new THREE.Vector3(-6.3, 1, 2),
      new THREE.Vector3(-5.2, -1, 2),
      new THREE.Vector3(-6, -3, 2),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const lightning = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#ffff00', linewidth: 3 }));
    this.scene.add(lightning);
    this.objects.push(lightning);

    let visible = true;
    this.intervalId = setInterval(() => {
      visible = !visible;
      lightning.visible = visible;
    }, 500);
  }

  private buildUnknown(): void {
    this.scene.background = new THREE.Color(this.darkMode() ? '#0a0a1a' : '#263238');
    const positions = new Float32Array(3000);
    for (let i = 0; i < 3000; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.08 }));
    this.scene.add(stars);
    this.objects.push(stars);
  }

  private makeCloud(): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: '#8899aa', transparent: true, opacity: 0.7 });
    [[0, 0], [-1.2, -0.3], [1.2, -0.3], [-0.6, 0.4], [0.6, 0.4]].forEach(([x, y]) => {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), mat);
      sphere.position.set(x, y, 0);
      group.add(sphere);
    });
    return group;
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.objects.forEach((obj, i) => {
      if (obj instanceof THREE.Points) {
        obj.position.y -= 0.02;
        if (obj.position.y < -10) obj.position.y = 10;
      }
      if (obj instanceof THREE.Group) {
        obj.position.x += 0.005 * (i % 2 === 0 ? 1 : -1);
        if (obj.position.x > 12) obj.position.x = -12;
        if (obj.position.x < -12) obj.position.x = 12;
      }
    });
    this.renderer.render(this.scene, this.camera);
  }
}