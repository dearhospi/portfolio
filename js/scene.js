import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, model;
let currentSection = 'hero';
let targetPosition = new THREE.Vector3();
let targetRotation = new THREE.Euler();
let isModelLoaded = false;
let baseScale = 1;

const sectionConfigs = {
    hero: {
        position: new THREE.Vector3(0, -0.5, -3),
        rotation: new THREE.Euler(0, 0.3, 0),
        scale: 1.2
    },
    about: {
        position: new THREE.Vector3(2.5, -0.3, -2.5),
        rotation: new THREE.Euler(0.1, -0.5, 0),
        scale: 1
    },
    skills: {
        position: new THREE.Vector3(-2.5, 0.2, -2.5),
        rotation: new THREE.Euler(-0.1, 0.8, 0),
        scale: 1
    },
    services: {
        position: new THREE.Vector3(0, 0.5, -3),
        rotation: new THREE.Euler(0.2, 0, 0),
        scale: 1.1
    },
    projects: {
        position: new THREE.Vector3(-2, -0.5, -3),
        rotation: new THREE.Euler(0, 1.2, 0),
        scale: 1
    },
    devlog: {
        position: new THREE.Vector3(2, 0, -2.5),
        rotation: new THREE.Euler(-0.1, -0.8, 0),
        scale: 0.9
    },
    contact: {
        position: new THREE.Vector3(0, -0.2, -3.5),
        rotation: new THREE.Euler(0.15, 0.2, 0),
        scale: 1.1
    }
};

const mobileSectionConfigs = {
    hero: {
        position: new THREE.Vector3(0, -0.3, -3.5),
        rotation: new THREE.Euler(0, 0.3, 0),
        scale: 0.9
    },
    about: {
        position: new THREE.Vector3(0, -0.3, -3.5),
        rotation: new THREE.Euler(0.1, 0, 0),
        scale: 0.85
    },
    skills: {
        position: new THREE.Vector3(0, -0.2, -3.5),
        rotation: new THREE.Euler(-0.1, 0, 0),
        scale: 0.85
    },
    services: {
        position: new THREE.Vector3(0, 0, -3.5),
        rotation: new THREE.Euler(0.15, 0, 0),
        scale: 0.9
    },
    projects: {
        position: new THREE.Vector3(0, -0.3, -3.5),
        rotation: new THREE.Euler(0, 0, 0),
        scale: 0.85
    },
    devlog: {
        position: new THREE.Vector3(0, -0.2, -3.5),
        rotation: new THREE.Euler(-0.1, 0, 0),
        scale: 0.8
    },
    contact: {
        position: new THREE.Vector3(0, -0.1, -3.5),
        rotation: new THREE.Euler(0.1, 0, 0),
        scale: 0.9
    }
};

const defaultConfig = {
    position: new THREE.Vector3(0, 0, -3),
    rotation: new THREE.Euler(0, 0, 0),
    scale: 1
};

const mobileDefaultConfig = {
    position: new THREE.Vector3(0, -0.3, -3.5),
    rotation: new THREE.Euler(0, 0, 0),
    scale: 0.85
};

let isMobile = false;

export async function initScene() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) {
        throw new Error('Canvas element not found');
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00d4ff, 2.0);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00ffff, 0.6);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x0099cc, 1.0);
    rimLight.position.set(0, -4, -6);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0x00d4ff, 1.5, 10);
    accentLight.position.set(2, 1, 2);
    scene.add(accentLight);

    await loadModel();

    if (!prefersReducedMotion) {
        animate();
    } else {
        render();
    }

    window.addEventListener('resize', onResize, { passive: true });

    return { scene, camera, renderer };
}

async function loadModel() {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            'models/model.glb',
            (gltf) => {
                model = gltf.scene;

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) {
                            child.material.metalness = Math.min(child.material.metalness || 0, 0.3);
                            child.material.roughness = Math.max(child.material.roughness || 1, 0.7);
                        }
                    }
                });

                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;

                model.scale.setScalar(scale);
                model.position.sub(center.clone().multiplyScalar(scale));

                baseScale = scale;

                scene.add(model);
                isModelLoaded = true;

                applySectionConfig('hero');
                resolve();
            },
            undefined,
            (error) => {
                console.error('GLB loading error:', error);
                reject(error);
            }
        );
    });
}

function getConfigs() {
    return isMobile ? mobileSectionConfigs : sectionConfigs;
}

function getDefaultConfig() {
    return isMobile ? mobileDefaultConfig : defaultConfig;
}

function applySectionConfig(sectionId) {
    if (!model || !isModelLoaded) return;

    const configs = getConfigs();
    const defaultCfg = getDefaultConfig();
    const config = configs[sectionId] || defaultCfg;

    targetPosition.copy(config.position);
    targetRotation.copy(config.rotation);

    const targetScale = baseScale * config.scale;
    model.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
}

export function updateModelPosition(sectionId) {
    if (sectionId === currentSection) return;
    currentSection = sectionId;
    applySectionConfig(sectionId);
}

function animate() {
    if (!isModelLoaded || !model) {
        requestAnimationFrame(animate);
        return;
    }

    const time = performance.now() * 0.001;

    model.position.lerp(targetPosition, 0.03);

    model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, targetRotation.x, 0.03);
    model.rotation.y = time * 0.39;
    model.rotation.z = THREE.MathUtils.lerp(model.rotation.z, targetRotation.z, 0.03);

    if (model.position.y > -0.5) {
        model.position.y += Math.sin(time * 0.6) * 0.001;
    }

    render();
    requestAnimationFrame(animate);
}

function render() {
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onResize() {
    if (!camera || !renderer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const wasMobile = isMobile;
    isMobile = width <= 768;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);

    if (wasMobile !== isMobile && isModelLoaded) {
        applySectionConfig(currentSection);
    }
}

export function disposeScene() {
    window.removeEventListener('resize', onResize);

    if (renderer) {
        renderer.dispose();
        renderer = null;
    }

    if (scene) {
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        scene = null;
    }

    model = null;
    camera = null;
    isModelLoaded = false;
}