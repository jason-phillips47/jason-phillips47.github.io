import '../dist/output.css';
import './style.css';
import * as THREE from 'three';
let scene, camera, renderer;
let bubbles = [];
const mouse = new THREE.Vector2();
const scatterVelocity = [];
let idleTime = 0;
let scatterDelay = 0;
const scatterDelayDuration = 2; // Number of frames to delay before scattering

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    for (let i = 0; i < 100; i++) {
        const bubble = new THREE.Mesh(geometry, material);
        bubble.position.x = Math.random() * 100 - 50;
        bubble.position.y = Math.random() * 100 - 50;
        bubble.position.z = Math.random() * 50 - 50;
        scene.add(bubble);
        bubbles.push(bubble);
        scatterVelocity.push(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0));
    }

    camera.position.z = 50;

    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Initiate scatter delay
    scatterDelay = scatterDelayDuration;

    // Reset idle time
    idleTime = 0;
    
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Increment idle time
    idleTime++;

    bubbles.forEach((bubble, index) => {
        if (idleTime > 10) {
            // Move bubbles toward the cursor when idle
            bubble.position.x += (mouse.x * 50 - bubble.position.x) * 0.004;
            bubble.position.y += (mouse.y * 50 - bubble.position.y) * 0.004;
        } else if (scatterDelay <= 0) {
            // Scatter bubbles smoothly after delay
            bubble.position.add(scatterVelocity[index]);
        }
    });

    if (scatterDelay > 0) {
        scatterDelay--;
    }

    renderer.render(scene, camera);
}
