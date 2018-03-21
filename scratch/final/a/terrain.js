const WATER_VS = `
precision highp float;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position; 
attribute vec2 uv;
attribute vec3 normal;
uniform float tick;

varying vec2 vUv;

uniform sampler2D heightmap;

void main() {
    // float displaceAmt = fbm(uv * 5.0 - 0.5, 100.0) * 50.0;
	float displaceAmt = texture2D(heightmap, uv).r * 25.0;
    vec3 newPosition = (position.xyz + normal.xyz * displaceAmt);
    vUv = uv;

	gl_Position = projectionMatrix  * viewMatrix * modelMatrix  * vec4( newPosition, 1.0 );
    // gl_Position = vec4( uv*2.0 - 1.0, 0.0, 1.0 );
}`;
  
const WATER_FS = `
precision highp float;
varying vec2 vUv;
uniform float tick;
uniform vec3 cameraPosition;

// vec3 pos_for_uv(vec2 uv) {
// 	float height = texture2D(heightmap, uv).r;
// 	return vec3(uv.x, uv.y, height);
// }

// vec3 diff_for_uv(vec2 uv, vec3 pos2) {
// 	return  pos_for_uv(uv)- pos2;
// }


// vec3 get_normal(vec3 a, vec3 b) {
// 	return cross(normalize(a), normalize(b));
// }
// vec3 calcColor(vec3 direction, vec3 lightColor, vec3 normal) {
//     vec3 eyeDirection = normalize(-cameraPosition);
// 	vec3 reflectionDirection = normalize(reflect(direction, normal));
// 	float specularLightWeighting = pow(clamp(dot(reflectionDirection, eyeDirection), 0.0, 1.0), 20.0);
//     return  (vec3(0.5, 0.5, 0.6) * lightColor * diffuseLightWeighting ) + 
//             (vec3(0.50, 0.50, 0.5) * lightColor * specularLightWeighting );
// }


uniform int fakeShadow;
uniform sampler2D heightmap;
uniform sampler2D normalmap;
uniform sampler2D normalmap_smooth;
void main() {
	vec3 normal = texture2D(normalmap, vUv).rgb * 2.0 - 1.0;
	vec3 smooth_normal = texture2D(normalmap_smooth, vUv).rgb * 2.0 - 1.0;
	vec3 direction = normalize(vec3( 2.0, 5.0, 2.0));
	vec3 lightColor = vec3(1.0);
	float diffuseLightWeighting; 

	if (fakeShadow == 0) {
		diffuseLightWeighting = clamp(dot(direction, normal), 0.0, 1.0); 
	} else {
		diffuseLightWeighting = dot(direction, normal) * clamp(5.0 * dot(direction, smooth_normal), 0.0, 1.0);
	}

    vec3 eyeDirection = normalize(-cameraPosition);
	vec3 reflectionDirection = normalize(reflect(direction, normal));
	float specularLightWeighting = pow(clamp(dot(reflectionDirection, eyeDirection), 0.0, 1.0), 20.0);

    vec3 color = (vec3(0.5, 0.5, 0.6) * lightColor * diffuseLightWeighting ) + 
            (vec3(0.50, 0.50, 0.5) * lightColor * specularLightWeighting );
	gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
	

	// float pxStep = 1.0/2048.0;
	// vec3 p   = pos_for_uv(vUv);

	// vec3 avgnorm = vec3(0.0);
	// vec3 Np  = diff_for_uv(vec2(vUv.x + pxStep, vUv.y), p);
	// vec3 NEp = diff_for_uv(vec2(vUv.x + pxStep, vUv.y + pxStep), p);
	// vec3 Ep  = diff_for_uv(vec2(vUv.x, vUv.y + pxStep), p);
	// vec3 SEp = diff_for_uv(vec2(vUv.x - pxStep, vUv.y + pxStep), p);
	// vec3 Sp  = diff_for_uv(vec2(vUv.x - pxStep, vUv.y), p);
	// vec3 SWp = diff_for_uv(vec2(vUv.x - pxStep, vUv.y - pxStep), p);
	// vec3 Wp  = diff_for_uv(vec2(vUv.x, vUv.y - pxStep), p);
	// vec3 NWp = diff_for_uv(vec2(vUv.x + pxStep, vUv.y - pxStep), p);



	// avgnorm += get_normal(Np, NEp);	
	// avgnorm += get_normal(NEp, Ep);	
	// avgnorm += get_normal(Ep, SEp);	
	// avgnorm += get_normal(SEp, Sp);	
	// avgnorm += get_normal(Sp, SWp);	
	// avgnorm += get_normal(SWp, Wp);	
	// avgnorm += get_normal(Wp, NWp);	
	// avgnorm += get_normal(NWp, Np);	
	// avgnorm += get_normal(Np, Ep);	
	// avgnorm += get_normal(Ep, Sp);	
	// avgnorm += get_normal(Sp, Wp);	
	// avgnorm += get_normal(Wp, Np);	
	// avgnorm = normalize(avgnorm);
	

	// gl_FragColor = vec4((avgnorm + 1.0) / 2.0, p.z);
	// gl_FragColor = vec4(vec3(fbm2(vUv * 5.0 - 0.5, 100.0)), 1.0);
}`;



function generate_terrain_mesh() {
	let geometry = new THREE.PlaneGeometry(100, 100, 250, 250);
	let heightmap = new THREE.TextureLoader().load('heightmap.png');
	let normalmap = new THREE.TextureLoader().load('normalmap.png');
	let normalmap_smooth = new THREE.TextureLoader().load('normalmap_smooth.png');
    let uniforms = {
        tick: {type: "f", value: 0},
		fakeShadow: {type: "i", value: 1},
		heightmap: {type: "t", value: heightmap},
		normalmap: {type: "t", value: normalmap},
		normalmap_smooth: {type: "t", value: normalmap_smooth}
	};
    let material = new THREE.RawShaderMaterial({
        uniforms: uniforms,
        vertexShader: WATER_VS,
        fragmentShader: WATER_FS
	})
	let mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

/*
	vec2 adjUv = vUv * 5.0 - 0.5;
    float noiseval = fbm5(adjUv, 100.0);
    float above = fbm5(vec2(adjUv.x + 0.0001, adjUv.y), 100.0);
    float right = fbm5(vec2(adjUv.x, adjUv.y + 0.0001), 100.0);
    vec3 cpos = vec3(adjUv, noiseval);
    vec3 abovePos = vec3(adjUv.x + 0.0001, adjUv.y, above);
    vec3 rightPos = vec3(adjUv.x, adjUv.y + 0.0001, right);
    vec3 N = normalize(cross(  normalize(rightPos - cpos), normalize(abovePos - cpos)));

	vec3 smoothN;
	if (fakeShadow == 1) {
		float smoothNoiseval = fbm2(adjUv, 100.0);
		float smoothAbove = fbm2(vec2(adjUv.x + 0.0001, adjUv.y), 100.0);
		float smoothRight = fbm2(vec2(adjUv.x, adjUv.y + 0.0001), 100.0);
		vec3 smoothCpos = vec3(adjUv, smoothNoiseval);
		vec3 smoothAbovePos = vec3(adjUv.x + 0.0001, adjUv.y, smoothAbove);
		vec3 smoothRightPos = vec3(adjUv.x, adjUv.y + 0.0001, smoothRight);
		smoothN = normalize(
			cross(  
				normalize(smoothRightPos - smoothCpos), 
				normalize(smoothAbovePos - smoothCpos)
			)
		);

	}

    vec3 hitpoint = cpos;
    vec3 L = normalize(vec3(1.0, 5.0, -2.0));
    vec3 Kd = vec3(1.0, 0.0, 0.0);
    vec3 Ka = vec3(0.0, 0.0, 0.2);
    vec3 Ks = vec3(1.0, 1.0, 1.0);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    vec3 V = normalize(vec3(0.0, 0.0, 1.0) - hitpoint);
	float diffuseWeight;
	if (fakeShadow == 1) {
		diffuseWeight = dot(N, L) * clamp(5.0 * dot(L, smoothN), 0.0, 1.0);
	} else {
		diffuseWeight = dot(N, L);
	}
    // vec3 reflectionDirection = normalize(reflect(-L, N));
    float specularWeight = 0.0;
	vec3 color = (Kd * lightColor * diffuseWeight) + (Ks * lightColor * specularWeight) + (Ka * lightColor);
	*/