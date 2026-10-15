document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    
    if (!container) {
      console.error("❌ Elemento 'canvas-container' não foi encontrado no HTML!");
      return;
    }
  
    const scene = new THREE.Scene();
  
    const getWidth = () => container.clientWidth || 180;
    const getHeight = () => container.clientHeight || 480;
    let aspect = getWidth() / getHeight();
    const d = 2.4;
  
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(getWidth(), getHeight());
    container.appendChild(renderer.domElement);
  
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
  
    // Materiais
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f });
    const skinMat = new THREE.MeshBasicMaterial({ color: 0xf5cba7 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headMat = new THREE.MeshBasicMaterial({ color: 0x181818 });
  
    const legoBatman = new THREE.Group();
  
    // Cabeça e Orelhas
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.1), headMat);
    head.position.y = 1.6;
    legoBatman.add(head);
  
    const earGeo = new THREE.ConeGeometry(0.12, 0.35, 3);
    const leftEar = new THREE.Mesh(earGeo, headMat);
    leftEar.position.set(-0.3, 2.05, 0);
    const rightEar = new THREE.Mesh(earGeo, headMat);
    rightEar.position.set(0.3, 2.05, 0);
    legoBatman.add(leftEar, rightEar);
  
    // Rosto e Olhos
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), skinMat);
    face.position.set(0, 1.48, 0.06);
    legoBatman.add(face);
  
    const eyeGeo = new THREE.PlaneGeometry(0.15, 0.06);
    const leftEye = new THREE.Mesh(eyeGeo, whiteMat);
    leftEye.position.set(-0.16, 1.55, 0.07);
    const rightEye = new THREE.Mesh(eyeGeo, whiteMat);
    rightEye.position.set(0.16, 1.55, 0.07);
    legoBatman.add(leftEye, rightEye);
  
    // Torso
    const torso = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), blackMat);
    torso.position.y = 0.65;
    legoBatman.add(torso);
  
    // Símbolo do Peito
    const batLogoBg = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), yellowMat);
    batLogoBg.scale.set(1.1, 0.7, 1);
    batLogoBg.position.set(0, 0.8, 0.06);
    legoBatman.add(batLogoBg);
  
    const batShape = new THREE.Shape();
    batShape.moveTo(0, 0.08);
    batShape.lineTo(-0.06, 0.14);
    batShape.lineTo(-0.1, 0.08);
    batShape.lineTo(-0.2, 0.1);
    batShape.lineTo(-0.14, -0.08);
    batShape.lineTo(0, -0.02);
    batShape.lineTo(0.14, -0.08);
    batShape.lineTo(0.2, 0.1);
    batShape.lineTo(0.1, 0.08);
    batShape.lineTo(0.06, 0.14);
    batShape.closePath();
  
    const batSymbol = new THREE.Mesh(new THREE.ShapeGeometry(batShape), blackMat);
    batSymbol.position.set(0, 0.78, 0.07);
    legoBatman.add(batSymbol);
  
    // Cinto
    const belt = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.2), yellowMat);
    belt.position.set(0, 0.1, 0.06);
    legoBatman.add(belt);
  
    // Braços e Mãos
    const leftArm = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.8), blackMat);
    leftArm.position.set(-0.75, 0.65, 0);
    const rightArm = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.8), blackMat);
    rightArm.position.set(0.75, 0.65, 0);
    legoBatman.add(leftArm, rightArm);
  
    const handGeo = new THREE.RingGeometry(0.06, 0.12, 16, 1, 0, Math.PI * 1.5);
    const leftHand = new THREE.Mesh(handGeo, yellowMat);
    leftHand.position.set(-0.75, 0.18, 0.06);
    const rightHand = new THREE.Mesh(handGeo, yellowMat);
    rightHand.position.set(0.75, 0.18, 0.06);
    legoBatman.add(leftHand, rightHand);
  
    // Pernas
    const leftLeg = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.8), blackMat);
    leftLeg.position.set(-0.25, -0.4, 0);
    const rightLeg = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.8), blackMat);
    rightLeg.position.set(0.25, -0.4, 0);
    legoBatman.add(leftLeg, rightLeg);
  
    legoBatman.position.y = -0.5;
    scene.add(legoBatman);
  
    // --- LÓGICA DAS ANIMAÇÕES ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
  
    // Acompanhamento da posição do rato
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  
    // Loop de Animação Contínuo
    function animate(time) {
      requestAnimationFrame(animate);
  
      const clock = time * 0.002;
  
      // 1. Animação de flutuação/respiração suave
      legoBatman.position.y = -0.5 + Math.sin(clock * 2) * 0.05;
  
      // 2. Balanço suave dos braços
      leftArm.rotation.z = Math.sin(clock * 2) * 0.05;
      rightArm.rotation.z = -Math.sin(clock * 2) * 0.05;
  
      // 3. Rotação suave em direção ao cursor do rato
      targetRotationY = mouseX * 0.2;
      targetRotationX = mouseY * 0.1;
  
      legoBatman.rotation.y += (targetRotationY - legoBatman.rotation.y) * 0.05;
      legoBatman.rotation.x += (targetRotationX - legoBatman.rotation.x) * 0.05;
  
      renderer.render(scene, camera);
    }
  
    // Iniciar Animação
    animate(0);
  
    // Ajuste quando a janela muda de tamanho
    window.addEventListener('resize', () => {
      const w = getWidth();
      const h = getHeight();
      if (w === 0 || h === 0) return;
      
      const newAspect = w / h;
      camera.left = -d * newAspect;
      camera.right = d * newAspect;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  });