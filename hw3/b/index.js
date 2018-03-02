function onWindowResize(state) {
    // let {camera, renderer} = state;
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();
    // renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate(state) {
    state.plane.material.uniforms.tick.value += 0.01;
}

function generate_plane() {
    let geometry = new THREE.PlaneGeometry(640, 640, 1, 1, 1);
    let uniforms = {
        tick: {type: "f", value: 0},
        resolution: {type: "v2", value: new THREE.Vector2(640, 640)}
    };
    let material = new THREE.RawShaderMaterial({
        uniforms: uniforms,
        vertexShader: vs,
        fragmentShader: fs
    });
    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function init() {
    let container = document.getElementById('container');
    console.log(container)
    let width = window.innerWidth;
    let height = window.innerHeight;
    let camera = new THREE.OrthographicCamera( 
        width , width , height , height , 
        -1, 1 
    );
    // let camera = new THREE.OrthographicCamera( 
    //     width / - 2, width / 2, height / 2, height / - 2, 
    //     -1, 1 
    // );

    let scene = new THREE.Scene();

    let renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 640, 640);
    renderer.setClearColor(new THREE.Color(0x000000), 1)
    container.appendChild( renderer.domElement );

    let plane = generate_plane();
    scene.add(plane);

    let state = {camera, scene, renderer, container, plane};

    //make it so that resizing the browser window also resizes the scene
    window.addEventListener('resize', () => { onWindowResize(state) }, false);

    function render() {
        animate(state);

        state.renderer.render(state.scene, state.camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render)
}




