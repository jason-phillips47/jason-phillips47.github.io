import '../dist/output.css';
import './style.css';
import * as THREE from 'three';

let scene, camera, renderer;
let bubbles = [];
const initialPositions = [];
const mouse = new THREE.Vector2(-100000, -100000); // Initialize mouse position off screen
const scatterVelocity = [];
const returnSpeed = 0.02;
const idleMovementSpeed = 1; // Reduced for more subtle movement
let isMouseMoving = false;
let idleTimer = 0; // Timer for idle movement
const cursorSmall = document.querySelector('.small');
const cursorBig = document.querySelector('.big');


init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    
    for (let i = 0; i < 50; i++) {
        const material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0, 1, 0.5) });
        const bubble = new THREE.Mesh(geometry, material);
        const initialPosition = new THREE.Vector3(
            Math.random() * 100 - 50,
            Math.random() * 100 - 50,
            0
        );
        bubble.position.copy(initialPosition);
        scene.add(bubble);
        bubbles.push(bubble);
        initialPositions.push(initialPosition);
        scatterVelocity.push(new THREE.Vector3());
    }

    camera.position.z = 50;

    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function updateBubbleColors() {
    // Map mouse x-coordinate to hue (0 to 360 degrees)
    const hue = ((mouse.x + mouse.y + 2) / 2) * 360; // Mouse x from -1 to 1 maps to 0 to 360

    bubbles.forEach(bubble => {
        // Convert mouse coordinates from normalized device coordinates to screen space
        const mouseX = (mouse.x + 1) / 2 * window.innerWidth;
        const mouseY = (1 - mouse.y) / 2 * window.innerHeight;

        // Project bubble's position to screen space
        const bubbleScreenPos = bubble.position.clone().project(camera);
        const bubbleScreenX = (bubbleScreenPos.x + 1) / 2 * window.innerWidth;
        const bubbleScreenY = (1 - bubbleScreenPos.y) / 2 * window.innerHeight;

        // Calculate 2D screen distance from bubble to mouse
        const distance = Math.sqrt(Math.pow(mouseX - bubbleScreenX, 2) + Math.pow(mouseY - bubbleScreenY, 2));
        
        // Map distance to lightness (closer is lighter)
        const lightness = Math.max(0, 1 - (distance / window.innerWidth) * 4); // Adjust scaling factor as needed

        // Update the bubble material color based on mouse position and distance
        bubble.material.color.setHSL(hue / 360, .8, lightness); // Saturation fixed at 1
    });
}


function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    isMouseMoving = true;

    setTimeout(() => isMouseMoving = false, 100); // Reset mouse movement state after a short delay

    // Update scatter velocities based on mouse position
    bubbles.forEach((bubble, index) => {
        const distanceVector = new THREE.Vector3(mouse.x * 50, mouse.y * 50, bubble.position.z).sub(bubble.position);
        const distance = distanceVector.length();
        const speedMultiplier = Math.max(0, 1 - distance / 50); // Decrease speed with distance

        const direction = distanceVector.clone().normalize().multiplyScalar(-1);
        const speed = 0.1 + Math.random() * 0.1;
        scatterVelocity[index].set(direction.x * speed * speedMultiplier* 6, direction.y * speed * speedMultiplier* 6, 0);
    });
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    updateBubbleColors();

    // Update idleTimer based on mouse movement
    if (!isMouseMoving) {
        idleTimer++;
    } else {
        idleTimer = 0;
    }

    bubbles.forEach((bubble, index) => {
        // Ensure each bubble has a unique tempTarget
        if (!bubble.tempTarget || idleTimer % 500 == 0) {
            bubble.tempTarget = new THREE.Vector3().addVectors(
                initialPositions[index], 
                new THREE.Vector3(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50)
            );
        }

        if (isMouseMoving) {
            // Cursor is moving
            bubble.position.add(scatterVelocity[index]);
        } else if (!bubble.position.equals(initialPositions[index]) && idleTimer >= 20 && idleTimer < 200) {
            // Return to initial position only if not idling
            const returnDirection = new THREE.Vector3().subVectors(initialPositions[index], bubble.position);
            returnDirection.multiplyScalar(returnSpeed);
            bubble.position.add(returnDirection);
        } else if (idleTimer > 200) {
            // Apply gradual movement towards tempTarget
            const idleDirection = new THREE.Vector3().subVectors(bubble.tempTarget, bubble.position);
            idleDirection.normalize().multiplyScalar(idleMovementSpeed * 0.004); // Adjust movement speed here
            bubble.position.add(idleDirection);
        }
    });

    renderer.render(scene, camera);
}

function positionElement(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const smallOffsetX = cursorSmall.offsetWidth / 2;
    const smallOffsetY = cursorSmall.offsetHeight / 2;
    const bigOffsetX = cursorBig.offsetWidth / 2;
    const bigOffsetY = cursorBig.offsetHeight / 2;

    cursorSmall.style.transform = `translate3d(${mouseX - smallOffsetX}px, ${mouseY - smallOffsetY}px, 0)`;

    setTimeout(() => {
        cursorBig.style.transform = `translate3d(${mouseX - bigOffsetX}px, ${mouseY - bigOffsetY}px, 0)`;
    }, 20);
}

const clickElementList = ['.social-icon', '.project-box', '.resume']

// Query all clickable elements (e.g., links, buttons)
const clickableElements = document.querySelectorAll(clickElementList); // Add selectors as needed

clickableElements.forEach(elem => {
    elem.addEventListener('mouseenter', () => {
      cursorBig.classList.add('cursor-hover');
      cursorSmall.classList.add('cursor-hover');
    });
  
    elem.addEventListener('mouseleave', () => {
      cursorBig.classList.remove('cursor-hover');
      cursorSmall.classList.remove('cursor-hover');
    });
  });

window.addEventListener('mousemove', positionElement);


document.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('resize', onWindowResize, false);

document.querySelectorAll('.project-box').forEach(box => {
    box.addEventListener('mouseenter', function() {
      const projectId = this.getAttribute('data-project');
      document.getElementById(`media-${projectId}`).style.display = 'block'; // Show media
    });
  
    box.addEventListener('mouseleave', function() {
      const projectId = this.getAttribute('data-project');
      document.getElementById(`media-${projectId}`).style.display = 'none'; // Hide media
    });
  });
  