function Game() {
    this.scene;
    this.renderer;
    this.camera;
    this.controls;
    this.controlsEnabled = false;

    this.player;
    this.objects;
    this.platform;
    this.rayInter;

    // gestao do tempo
    this.minTimeSpeed = 0.01;
    this.maxTimeSpeed = 1;
    this.currentTimeSpeed = this.maxTimeSpeed;

    this.prevTime;
    this.stats1;
    this.stats2;


    this.init = function() {

        // SCENE

        this.scene = new THREE.Scene();

        // CAMERA

        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 9000 );
        
        // Mover a camara com o rato (FirstPerson)
        this.controls = new THREE.PointerLockControls( this.camera );
        this.scene.add( this.controls.getObject() ); // adiciona camera
        
        // LIGHTS

        this.scene.add( new THREE.AmbientLight( 0x222222 ) );

        var directionalLight = new THREE.DirectionalLight( 0xe2c3a4 );
        directionalLight.position.set( 0, 0, 1 ).normalize();
        this.scene.add( directionalLight );

        // RENDERER

        this.renderer = new THREE.WebGLRenderer();  // TODO ver o antialias
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( this.renderer.domElement );
        
        // SKYBOX

        this.scene.add( makeSkybox( [
            'textures/cube/skybox/px.jpg', // right
            'textures/cube/skybox/nx.jpg', // left
            'textures/cube/skybox/py.jpg', // top
            'textures/cube/skybox/ny.jpg', // bottom
            'textures/cube/skybox/pz.jpg', // back
            'textures/cube/skybox/nz.jpg'  // front
        ], 8000 ));
        
        // PLATFORM

        this.scene.add( makePlatform(
            'models/platform/platform.json',
            'models/platform/platform.jpg',
            this.renderer.getMaxAnisotropy()
        ));

        //RAYCAST DEBUG

        var gem = new THREE.BoxGeometry(0.1,0.5,0.1);
        var lineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.rayInter = new THREE.Mesh(gem, lineMaterial);
        this.rayInter.name = "DEBUG_RAY";
        this.scene.add(this.rayInter);

        // EVENTS

        window.addEventListener( 'resize', this.onWindowResize, false );

        document.addEventListener('keydown', function (event) {
            switch (event.keycode){
                case 80:
                    this.controlsEnabled = !this.controlsEnabled;
                    break;
            }
        } , false);

        // POINTERLOCK

        var havePointerLock = 'pointerLockElement' in document 
            || 'mozPointerLockElement' in document 
            || 'webkitPointerLockElement' in document;

        //verificar se o browser suporta pointerLock
        if ( havePointerLock ) {
            var element = document.body;

            function pointerlockchange( event ) {
                if ( document.pointerLockElement === element 
                        || document.mozPointerLockElement === element 
                        || document.webkitPointerLockElement === element ) {
                    game.controlsEnabled = true;
                    game.controls.enabled = true;
                    blocker.style.display = 'none';
                } else {
                    game.controls.enabled = false;
                    blocker.style.display = 'block';
                    instructions.style.display = '';
                }
            };

            // Hook pointer lock state change events
            document.addEventListener( 'pointerlockchange', pointerlockchange, false );
            document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
            document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

            instructions.addEventListener( 'click', function ( event ) {
                instructions.style.display  = "none" ;
                
                // Ask the browser to lock the pointer
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                element.requestPointerLock();
            }, false );
        } else {
            container.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
        }

        //CRIAR OBJETOS

        this.objects = [];
        
        this.player = new Player();
        this.player.addWeapon(new Pistol(loader.gun3, Bullet, 20));
        this.player.addWeapon(new Automatic(loader.gun2, Bullet, 10));

        new Enemy(new THREE.Vector3(-2, 5, 20 )).render();
        //new Enemy(new THREE.Vector3(40, 15, -2 )).render();


        // STATS

        this.stats1 = new Stats();
        this.stats1.showPanel(0); // Panel 0 = fps
        this.stats1.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
        document.body.appendChild(this.stats1.domElement);

        this.stats2 = new Stats();
        this.stats2.showPanel(1); // Panel 1 = ms
        this.stats2.domElement.style.cssText = 'position:absolute;top:0px;left:80px;';
        document.body.appendChild(this.stats2.domElement);
    }

    this.animate = function() {
        if (game.prevTime == undefined) game.prevTime = performance.now();

        game.stats1.begin();
        game.stats2.begin();

        var time = performance.now();
        var delta = ( time - game.prevTime ) / 1000;

        resetPlayer();
        if ( game.controlsEnabled ) {
            //Call update
            for (var i = 0 ; i < game.objects.length ; i++){
                game.objects[i].update(delta,i);
            }
        }

        game.stats1.end();
        game.stats2.end();
        requestAnimationFrame( game.animate );
        game.renderer.render( game.scene, game.camera );
        game.prevTime = time;
    }

    this.onWindowResize = function( event ) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        game.renderer.setSize( width, height );
        game.camera.aspect = width / height;
        game.camera.updateProjectionMatrix();
    }
}

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

function makePlatform( jsonUrl, textureUrl, textureQuality ) {
    var placeholder = new THREE.Object3D();
    var texture = new THREE.TextureLoader().load( textureUrl );
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = textureQuality;

    var loader = new THREE.JSONLoader();
    loader.load( jsonUrl, function( geometry ) {
        geometry.computeFaceNormals();
        game.platform = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ map : texture }) );
        game.platform.name = "platform";
        game.platform.scale.set( 2, 2, 2 );
        placeholder.add( game.platform );
    });

    return placeholder;
}



