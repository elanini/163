var container;
var fullScreenQuad, plane;

var camera, scene, renderer;
var options;
var tick = 0;
let bufferScene, bufferTexture;
var terrain_mesh;
let smoke_mesh;
var FBO_A, FBO_B;
function init() {

    let gui = new dat.GUI({width: 300})
    container = document.getElementById('container');
    console.log(container)
    let width = 512
    let height = 512
    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    camera.position.z = 1;
    // var controls = new THREE.OrbitControls(camera)
    // camera.position.z = 100;
    // camera.position.y = 40;
    // controls.update();

    scene = new THREE.Scene();

    bufferScene = new THREE.Scene()
    bufferTexture = new THREE.WebGLRenderTarget( 
        1024, 
        1024, 
        { 
            minFilter: THREE.LinearFilter, 
            magFilter: THREE.NearestFilter
        }
    );

    options = {
        fakeShadow: true
    }
    gui.add(options, "fakeShadow", false, true);
    smoke_mesh = generate_smoke_mesh(bufferTexture)
    bufferScene.add(smoke_mesh)

    plane = new THREE.PlaneBufferGeometry( 1024, 1024)
	fullScreenQuad = new THREE.Mesh( plane, new THREE.MeshBasicMaterial() );
	scene.add(fullScreenQuad);

    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    renderer.setClearColor(0x999999);
    renderer.setSize(1024, 1024);
    container.appendChild(renderer.domElement);

	FBO_A = new THREE.WebGLRenderTarget( 1024, 1024, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});
	FBO_B = new THREE.WebGLRenderTarget( 1024, 1024, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter} );

    //make it so that resizing the browser window also resizes the scene
    window.addEventListener('resize', onWindowResize, false);

    animate();
    // renderk()
    // var dataURL = renderer.domElement.toDataURL();
    // window.open(dataURL, "image");
}



function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {
    tick += 0.01;
    smoke_mesh.material.uniforms.tick.value = tick;
    // terrain_mesh.material.uniforms.fakeShadow.value = options.fakeShadow ? 1 : 0

    //if I want to update the lights, I acutally have to update the material used by each object in the scene. 
    //material.uniforms.light1_diffuse.value = new THREE.Vector3(0.0,1.0,0.0);
    renderer.render(bufferScene, camera, FBO_B);
    fullScreenQuad.material.map = FBO_B.texture;

    renderer.render(scene, camera);
    var t = FBO_A;
    FBO_A = FBO_B;
    FBO_B = t;
    smoke_mesh.material.uniforms.bufferTexture.value = FBO_A.texture;
}


function onWindowResize(event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}