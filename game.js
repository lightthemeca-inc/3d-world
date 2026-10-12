 
    import * as THREE from
      "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 25, 65);

    const camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 100
    );
    camera.position.set(0, 2, 5);
    camera.rotation.order = "YXZ";

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x536b39, 2));

    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(-10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);

    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    const grass = new THREE.MeshLambertMaterial({ color: 0x55a832 });
    const dirt = new THREE.MeshLambertMaterial({ color: 0x79502e });
    const stone = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const wood = new THREE.MeshLambertMaterial({ color: 0x80502b });
    const leaves = new THREE.MeshLambertMaterial({ color: 0x27823a });

    function block(x, y, z, material) {
      const mesh = new THREE.Mesh(blockGeometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    }

// Build the HUGE ground.
for (let x = -50; x <= 50; x++) {
  for (let z = -50; z <= 50; z++) {
    block(x, -0.5, z, grass);

    if ((x * 7 + z * 3) % 4 === 0) {
      block(x, -1.5, z, dirt);
    }
  }
}

    // Scatter rocks around the world.
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(Math.random() * 32) - 16;
      const z = Math.floor(Math.random() * 32) - 16;

      if (Math.abs(x) < 3 && Math.abs(z) < 3) continue;

      block(x, 0.5, z, stone);
      if (i % 3 === 0) block(x, 1.5, z, stone);
    }

    // Plant blocky trees.
    for (let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * 32) - 16;
      const z = Math.floor(Math.random() * 32) - 16;

      if (Math.abs(x) < 4 && Math.abs(z) < 4) continue;

      block(x, 0.5, z, wood);
      block(x, 1.5, z, wood);
      block(x, 2.5, z, leaves);
      block(x + 1, 2.5, z, leaves);
      block(x - 1, 2.5, z, leaves);
      block(x, 2.5, z + 1, leaves);
      block(x, 2.5, z - 1, leaves);
      block(x, 3.5, z, leaves);
    }

    let yaw = 0;
    let pitch = 0;
    const keys = {};
    let playing = false;

    function look(event) {
      if (!playing || document.pointerLockElement !== renderer.domElement) return;
      yaw -= event.movementX * 0.002;
      pitch -= event.movementY * 0.002;
      pitch = Math.max(-1.4, Math.min(1.4, pitch));
      camera.rotation.set(pitch, yaw, 0, "YXZ");
    }

    document.addEventListener("mousemove", look);

    document.addEventListener("keydown", event => {
      keys[event.code] = true;
      if (["Space", "ArrowUp", "ArrowDown"].includes(event.code)) {
        event.preventDefault();
      }
    });

    document.addEventListener("keyup", event => {
      keys[event.code] = false;
    });

    const start = document.getElementById("start");
    const play = document.getElementById("play");

    play.addEventListener("click", () => {
      playing = true;
      renderer.domElement.requestPointerLock();
      start.style.display = "none";
    });

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement !== renderer.domElement) {
        playing = false;
        start.style.display = "grid";
        play.textContent = "RESUME ADVENTURE";
      } else {
        playing = true;
      }
    });

    function animate() {
      requestAnimationFrame(animate);

      if (playing) {
        const speed = 0.12;
        const forward = new THREE.Vector3(
          -Math.sin(yaw), 0, -Math.cos(yaw)
        );
        const right = new THREE.Vector3(
          Math.cos(yaw), 0, -Math.sin(yaw)
        );

        if (keys.KeyW || keys.ArrowUp) camera.position.addScaledVector(forward, speed);
        if (keys.KeyS || keys.ArrowDown) camera.position.addScaledVector(forward, -speed);
        if (keys.KeyA) camera.position.addScaledVector(right, -speed);
        if (keys.KeyD) camera.position.addScaledVector(right, speed);

camera.position.x = THREE.MathUtils.clamp(camera.position.x, -49, 49);
camera.position.z = THREE.MathUtils.clamp(camera.position.z, -49, 49);
        camera.position.y = 2;

        document.getElementById("position").textContent =
          `Explorer: ${Math.round(camera.position.x)}, ${Math.round(camera.position.z)}`;
      }

      renderer.render(scene, camera);
    }

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
