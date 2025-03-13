import * as THREE from "three";

export class ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  animationFrameId: number | null = null;
  container: HTMLElement | null = null;
  
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // Transparent background
    });
    
    // Set camera position
    this.camera.position.z = 5;
  }
  
  init(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container element with id ${containerId} not found.`);
      return;
    }
    
    // Set renderer size and append to container
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
    
    // Add window resize handler
    window.addEventListener("resize", this.handleResize);
    
    return this;
  }
  
  private handleResize = () => {
    if (!this.container) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
  
  addToolsModel() {
    // Create simple tools using basic geometries
    // Wrench
    const wrenchMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6, 
      roughness: 0.5,
      metalness: 0.8
    });
    
    const wrenchHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1, 0.1),
      wrenchMaterial
    );
    wrenchHandle.position.x = -1;
    this.scene.add(wrenchHandle);
    
    // Hammer
    const hammerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x10b981,
      roughness: 0.3,
      metalness: 0.7
    });
    
    const hammerHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    hammerHandle.rotation.z = Math.PI / 4;
    hammerHandle.position.x = 1;
    this.scene.add(hammerHandle);
    
    const hammerHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.15, 0.15),
      hammerMaterial
    );
    hammerHead.position.set(
      1 + Math.sin(Math.PI / 4) * 0.5,
      Math.cos(Math.PI / 4) * 0.5,
      0
    );
    hammerHead.rotation.z = Math.PI / 4;
    this.scene.add(hammerHead);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    return this;
  }
  
  animate() {
    if (!this.container) return;
    
    const animate = () => {
      // Rotate all objects in the scene slightly
      this.scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.y += 0.01;
        }
      });
      
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    return this;
  }
  
  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener("resize", this.handleResize);
    
    // Clean up scene objects
    this.scene.clear();
    
    // Remove canvas from DOM
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export const createSkillsVisualization = (containerId: string) => {
  const scene = new ThreeScene();
  scene.init(containerId)?.addToolsModel()?.animate();
  return scene;
};
