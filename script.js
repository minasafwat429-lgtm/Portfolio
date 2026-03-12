// Import Three.js
import * as THREE from 'three';

// ==================== 1. MATRIX RAIN BACKGROUND ====================
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
const matrixArray = matrix.split("");

const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}
setInterval(drawMatrix, 35);

// ==================== 2. THREE.JS 3D BACKGROUND ====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('bgCanvas'),
    alpha: false,
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ff41, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Create central glowing sphere
const geometrySphere = new THREE.IcosahedronGeometry(2, 2);
const materialSphere = new THREE.MeshStandardMaterial({
    color: 0x00ff41,
    emissive: 0x004400,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const sphere = new THREE.Mesh(geometrySphere, materialSphere);
scene.add(sphere);

// Add random floating nodes
const nodesGeometry = new THREE.BufferGeometry();
const nodesCount = 600;
const posArray = new Float32Array(nodesCount * 3);
const colorArray = new Float32Array(nodesCount * 3);

for (let i = 0; i < nodesCount * 3; i += 3) {
    const r = 15 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    posArray[i] = Math.sin(phi) * Math.cos(theta) * r;
    posArray[i+1] = Math.sin(phi) * Math.sin(theta) * r;
    posArray[i+2] = Math.cos(phi) * r;
    
    const isRed = Math.random() > 0.8;
    colorArray[i] = isRed ? 1 : 0.2;
    colorArray[i+1] = isRed ? 0.2 : 0.8;
    colorArray[i+2] = isRed ? 0.2 : 0.2;
}

nodesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
nodesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

const nodesMaterial = new THREE.PointsMaterial({ 
    size: 0.2, 
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});
const nodes = new THREE.Points(nodesGeometry, nodesMaterial);
scene.add(nodes);

// Add connection lines
const linesGeometry = new THREE.BufferGeometry();
const linePositions = [];

for (let i = 0; i < nodesCount; i++) {
    for (let j = i+1; j < nodesCount; j++) {
        const dist = Math.sqrt(
            Math.pow(posArray[i*3] - posArray[j*3], 2) +
            Math.pow(posArray[i*3+1] - posArray[j*3+1], 2) +
            Math.pow(posArray[i*3+2] - posArray[j*3+2], 2)
        );
        if (dist < 5) {
            linePositions.push(posArray[i*3], posArray[i*3+1], posArray[i*3+2]);
            linePositions.push(posArray[j*3], posArray[j*3+1], posArray[j*3+2]);
        }
    }
}

linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
const linesMaterial = new THREE.LineBasicMaterial({ color: 0x00ff41, opacity: 0.1, transparent: true });
const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
scene.add(lines);

// Animation loop
function animateThree() {
    requestAnimationFrame(animateThree);
    
    sphere.rotation.x += 0.001;
    sphere.rotation.y += 0.002;
    nodes.rotation.y += 0.0005;
    lines.rotation.y += 0.0005;
    
    renderer.render(scene, camera);
}
animateThree();

// ==================== 3. TYPEWRITER EFFECT ====================
const texts = ["Mina Safwat", "Red Team", "Bug Bounty Hunter", "Head of Cyber Security team in GDG AAST ASWAN", "Cyber Security Researcher", "Tech Speaker"];
let count = 0;
let index = 0;
let currentText = '';
let letter = '';

(function type() {
    if (count === texts.length) {
        count = 0;
    }
    currentText = texts[count];
    letter = currentText.slice(0, ++index);
    
    document.querySelector('.typewriter-text').textContent = letter;
    if (letter.length === currentText.length) {
        count++;
        index = 0;
        setTimeout(type, 1500);
    } else {
        setTimeout(type, 100);
    }
})();

// ==================== 4. AOS INIT ====================
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// ==================== 5. RESIZE HANDLER ====================
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================== 6. SMOOTH SCROLLING ====================
// 1. Smooth Scrolling Corrected
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// 2. Mouse Interaction - SAFE VERSION
window.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth) - 0.5;
    const mouseY = (e.clientY / window.innerHeight) - 0.5;
    
    // Check if camera exists from Three.js init
    if (typeof camera !== 'undefined') {
        camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 4 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
    }
    
    // Parallax for the Glass Card
    const glass = document.querySelector('.hero-glass');
    if (glass) {
        glass.style.transform = `rotateY(${mouseX * 5}deg) rotateX(${-mouseY * 5}deg)`;
    }

    // Function to handle Scroll Spy for the HUD
function scrollSpy() {
    const sections = document.querySelectorAll('section'); // بيتأكد إن كل السيكشنز واخدة tag section
    const navLinks = document.querySelectorAll('.hud-item');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // لو المستخدم نزل بالسكرول لـ 30% من السيكشن، يعتبره هو النشط
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// تشغيل الفانكشن
scrollSpy();


const scrollTopBtn = document.getElementById("scrollTopBtn");

window.onscroll = function() {
    if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
        scrollTopBtn.style.display = "flex";
    } else {
        scrollTopBtn.style.display = "none";
    }
};

scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


const mobileToggleBtn = document.getElementById('mobile-hud-toggle');
const cyberHud = document.getElementById('cyber-hud');
const hudItems = document.querySelectorAll('.hud-item');

if(mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', () => {
        cyberHud.classList.toggle('hud-collapsed');
        // تغيير أيقونة الهامبرجر لعلامة X والعكس
        const icon = mobileToggleBtn.querySelector('i');
        if(cyberHud.classList.contains('hud-collapsed')){
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });
}

// قفل القائمة أوتوماتيك لما تختار سيكشن
hudItems.forEach(item => {
    item.addEventListener('click', () => {
        if(window.innerWidth <= 991) {
            cyberHud.classList.add('hud-collapsed');
            mobileToggleBtn.querySelector('i').classList.remove('fa-times');
            mobileToggleBtn.querySelector('i').classList.add('fa-bars');
        }
    });
});

});

/* ===================================================
   نظام إرسال فورم السايبر سيكيوريتي (النسخة النهائية المستقرة)
   =================================================== */
document.addEventListener("DOMContentLoaded", function () {
    const cyberForm = document.getElementById("cyberForm");

    if (cyberForm) {
        cyberForm.addEventListener("submit", function (e) {
            e.preventDefault(); // منع ريفريش الصفحة

            // 1. سحب البيانات من الحقول
            const name = document.getElementById("cyberName").value.trim();
            const email = document.getElementById("cyberEmail").value.trim();
            const message = document.getElementById("cyberMessage").value.trim();

            // 2. تصميم رسالة الواتساب
            let waMessage = `*⚠️ SYSTEM ALERT: SECURE TRANSMISSION ⚠️*\n\n`;
            waMessage += `👤 *AGENT:* ${name}\n`;
            waMessage += `📧 *CONTACT:* ${email}\n`;
            waMessage += `------------------------\n`;
            waMessage += `📝 *MISSION DATA:*\n${message}\n`;
            waMessage += `------------------------\n`;
            waMessage += `*STATUS: AWAITING RESPONSE_ 🟩*`;

            // 3. رقم الواتساب (حط رقمك إنت الأول جرب بيه عشان تتأكد)
            const targetNumber = "201205449113"; 

            // 4. تشفير الرسالة واستخدام الرابط الرسمي المستقر
            const encodedMessage = encodeURIComponent(waMessage);
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetNumber}&text=${encodedMessage}`;

            // 5. تأثير على الزرار (جاري التشفير)
            const submitBtn = document.getElementById("cyberSubmitBtn");
            const originalHTML = submitBtn.innerHTML;
            
            submitBtn.innerHTML = `[ ENCRYPTING... ] <i class="fa-solid fa-circle-notch fa-spin ms-2"></i>`;
            submitBtn.disabled = true;

            // 6. فتح الواتساب مباشرة
            window.open(whatsappUrl, "_blank");

            // 7. إرجاع الزرار لشكله الطبيعي
            setTimeout(() => {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                cyberForm.reset(); 
            }, 1000);
        });
    }
});
