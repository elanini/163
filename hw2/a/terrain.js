var DISPLACEMENT_VS = `
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform sampler2D tPic;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform float displaceAmt; //controls the amount of vertex displacement...

varying float vDisplace; 
varying vec2 vUv;

precision mediump float;

void main() {
    vUv = uv;

    vec4 clr = texture2D(tPic, uv);
    vDisplace = clr.r * displaceAmt; //displacement;
    vec3 newPosition = (position.xyz + normal.xyz * vDisplace).xyz;

    gl_Position = projectionMatrix  * viewMatrix * modelMatrix  * vec4( newPosition, 1.0 );
}`;

var DISPLACEMENT_FS = `
precision mediump float;

uniform sampler2D tRock, tSand;

varying vec2 vUv;
varying float vDisplace; 

void main() {
    vec4 sand = texture2D(tSand, vUv);
    vec4 rock = texture2D(tRock, vUv);

    float zOffset = vDisplace;
    float mixval = 0.0;
    if (vDisplace > 0.15 && vDisplace < 0.25) {
        mixval = (vDisplace - 0.15) * 10.0;
    } else if (vDisplace > 0.25) {
        mixval = 1.0;
    }

    vec4 mix1 = mix(sand, rock, mixval);

    gl_FragColor = vec4( mix1.rgb, 1.0 );        
}
`;


function generate_terrain_mesh() {
    let heightTexture = new THREE.TextureLoader().load('height4.png');
    let sandTexture = new THREE.TextureLoader().load('sand.jpg');
    let rockTexture = new THREE.TextureLoader().load('rock.jpg');

    let geometry = new THREE.PlaneGeometry(5,5,300,300);
    let uniforms = {
        displaceAmt: { type: "f", value: 1.0 },
        tPic:  { type: "t", value: heightTexture },
        tSand: { type: "t", value: sandTexture },
        tRock: { type: "t", value: rockTexture }
    };
    let material = new THREE.RawShaderMaterial({
        uniforms,
        vertexShader: DISPLACEMENT_VS,
        fragmentShader: DISPLACEMENT_FS
    });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.material.side = THREE.DoubleSide;
    return mesh;
}