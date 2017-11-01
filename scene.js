// init 3D stuff

function makeSkybox( urls, size ) {
    var skyboxCubemap = new THREE.CubeTextureLoader().load( urls );
    skyboxCubemap.format = THREE.RGBFormat;

    var skyboxShader = THREE.ShaderLib['cube'];
    skyboxShader.uniforms['tCube'].value = skyboxCubemap;

    return new THREE.Mesh(
        new THREE.BoxGeometry( size, size, size ),
        new THREE.ShaderMaterial({
            fragmentShader : skyboxShader.fragmentShader, vertexShader : skyboxShader.vertexShader,
            uniforms : skyboxShader.uniforms, depthWrite : false, side : THREE.BackSide
        })
    );
}
var platform;
function makePlatform( jsonUrl, textureUrl, textureQuality ) {
    var placeholder = new THREE.Object3D();

    var texture = new THREE.TextureLoader().load( textureUrl );
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = textureQuality;

    var loader = new THREE.JSONLoader();
    loader.load( jsonUrl, function( geometry ) {

        geometry.computeFaceNormals();

        platform = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ map : texture }) );

        platform.name = "platform";

        placeholder.add( platform );
    });

    return placeholder;
}


var renderer = new THREE.WebGLRenderer({ antialias : true });
renderer.setPixelRatio( window.devicePixelRatio );

var camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 9000 );

var scene = new THREE.Scene();


// Mover a camara com o rato (FirstPerson)
var controls = new THREE.PointerLockControls( camera );

scene.add( controls.getObject() );

scene.add( makeSkybox( [
    'textures/cube/skybox/px.jpg', // right
    'textures/cube/skybox/nx.jpg', // left
    'textures/cube/skybox/py.jpg', // top
    'textures/cube/skybox/ny.jpg', // bottom
    'textures/cube/skybox/pz.jpg', // back
    'textures/cube/skybox/nz.jpg'  // front
], 8000 ));


scene.add( makePlatform(
    'models/platform/platform.json',
    'models/platform/platform.jpg',
    renderer.getMaxAnisotropy()
));

var gem = new THREE.BoxGeometry(5,5,5);
var mat = new THREE.MeshBasicMaterial();
var mesh = new THREE.Mesh(gem,mat);

scene.add(mesh);