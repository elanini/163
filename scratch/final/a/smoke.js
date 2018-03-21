const smokevert = `
attribute vec2 uv;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4((vUv * 2.0) - 1.0, 0.0, 1.0);
}
`

const smokefrag = `
precision highp float;
varying vec2 vUv;
uniform sampler2D bufferTexture;
uniform float tick;
void main() {
    float pxStep = 1.0/1024.0;
    vec2 fragpos = gl_FragCoord.xy/1024.0;
	float Np  = texture2D(bufferTexture, vec2(vUv.x + pxStep, vUv.y)).x;
	float Ep  = texture2D(bufferTexture, vec2(vUv.x, vUv.y + pxStep)).x;
	float Sp  = texture2D(bufferTexture, vec2(vUv.x - pxStep, vUv.y)).x;
	float Wp  = texture2D(bufferTexture, vec2(vUv.x, vUv.y - pxStep)).x;
	float c  = texture2D(bufferTexture, vec2(vUv.x, vUv.y)).x;
    float factor = 14.0 * 0.016 * (Np + Ep + Sp + Wp -  4.0 * c);
    c += factor;
    if (all(lessThan(abs(fragpos - 0.5), vec2(0.002)))) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
        gl_FragColor = vec4(c, c, c, 1.0);
    }
}
`

function generate_smoke_mesh(bufferTexture) {
    let uniforms = {
        bufferTexture: {type: "t", value: bufferTexture.texture},
        tick: {type: "f", value: 0.0}
    }
    let geometry = new THREE.PlaneGeometry(1,1,1,1);
    let material = new THREE.RawShaderMaterial({
        uniforms,
        vertexShader: smokevert,
        fragmentShader: smokefrag
    });
    let mesh = new THREE.Mesh(geometry, material)
    return mesh;
}