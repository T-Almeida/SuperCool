function Game() {
    this.scene;
    this.renderer;
    this.camera;
    this.controls;
    this.controlsEnabled = false;

    this.player;
    this.enemies = [];
    this.objects = [];
    this.floors;
    this.walls;
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

        this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 1000 );
        // Mover a camara com o rato (FirstPerson)
        this.controls = new THREE.PointerLockControls( this.camera );
        this.scene.add( this.controls.getObject() ); // adiciona camera
        
        // LIGHTS

        this.scene.add( new THREE.AmbientLight( 0x222222 ) );

        
        var light = new THREE.SpotLight( 0xffffff, 5, 1000 );
        light.position.set( -100, 350, 350 );
        light.angle = 0.5;
        light.penumbra = 0.5;
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        // scene.add( new THREE.CameraHelper( light.shadow.camera ) );
        this.scene.add( light );

        // RENDERER

        this.renderer = new THREE.WebGLRenderer();  // TODO ver o antialias
        this.renderer.shadowMap.enabled = true;
        //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( this.renderer.domElement );
        
        // SKYBOX
        /*
        this.scene.add( makeSkybox( [
            'textures/cube/skybox/px.jpg', // right
            'textures/cube/skybox/nx.jpg', // left
            'textures/cube/skybox/py.jpg', // top
            'textures/cube/skybox/ny.jpg', // bottom
            'textures/cube/skybox/pz.jpg', // back
            'textures/cube/skybox/nz.jpg'  // front
        ], 8000 ));*/
        
        // PLATFORM
        /*
        this.scene.add( makePlatform(
            'models/platform/platform.json',
            'models/platform/platform.jpg',
            this.renderer.getMaxAnisotropy()
        ));*/

        // GAME MAP

        var ground_geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
        var ground_material = new THREE.MeshPhongMaterial( { 
            color: 0x999999,
            specular: 0x222222,
            shininess: 5 } );
        var ground = new THREE.Mesh( ground_geometry, ground_material );
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add( ground );
        this.platform = ground; // TODO tirar
        
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
                    game.controlsEnabled = false;
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

        
        this.player = new Player();
        this.player.addWeapon(new Pistol(loader.gun2, Bullet, 40, new THREE.Vector3(0, 4, 4)));
        this.player.addWeapon(new Automatic(loader.gun1, Bullet, 60));

        new Enemy(new THREE.Vector3(-2, 12, 20 )).render();
        //new Enemy(new THREE.Vector3(40, 15, -2 )).render();

        //this.createEnemies();

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
        var delta = clock.getDelta();

        resetPlayer();

        if ( game.controlsEnabled ) {
            //Call update
            for (var i = 0 ; i < game.objects.length ; i++){
                game.objects[i].update(delta,i);
            }
            

        }
        
        requestAnimationFrame( game.animate );
        game.renderer.render( game.scene, game.camera );

        game.stats1.update();
        game.stats2.update();
    }

    this.createEnemies = function() {
        var controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
            attack: true
        };
        
        for (i=0; i<3; i++) {
            var enemyChar = new THREE.MD2CharacterComplex();
            enemyChar.scale = 0.5;
            enemyChar.controls = controls;
            enemyChar.shareParts( loader.enemy );
            // cast and receive shadows
            if (i==0) enemyChar.setWireframe (true) ;
            enemyChar.setWeapon( 0 );
            enemyChar.setSkin( i );
            enemyChar.root.position.x = i * 50;
            enemyChar.root.position.y = 12;
            this.scene.add( enemyChar.root );
            this.enemies.push(enemyChar);
            console.log(enemyChar);
        }
        
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
        // game.platform = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ map : texture }) );
        game.platform = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({ map : texture, shading: THREE.SmoothShading }) );
        game.platform.name = "platform";
        game.platform.scale.set( 2, 2, 2 );
        placeholder.add( game.platform );
    });

    return placeholder;
}



