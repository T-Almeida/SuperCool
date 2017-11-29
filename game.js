function Game() {
    this.scene;
    this.renderer;
    this.composer;
    this.camera;
    this.controls;
    this.controlsEnabled = false;

    this.player;
    this.enemies = [];
    this.bullets = [];
    this.floors;
    this.walls;
    //this.rayInter;

    // gestao do tempo
    this.minTimeSpeed = 0.01;
    this.maxTimeSpeed = 1;
    this.currentTimeSpeed = this.maxTimeSpeed;

    this.prevTime;
    this.stats1;

    //gestao das fisicas
    this.gravity = 2;

    this.enemySpawnTimer = 4;
    this.enemySpawnTimerCurrent = 1;
    this.score = 0;

    this.init = function() {
        // SCENE
        this.scene = new THREE.Scene();

        // CAMERA
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
        // Mover a camara com o rato (FirstPerson)
        this.controls = new THREE.PointerLockControls( this.camera );
        this.scene.add( this.controls.getObject() ); // adiciona camera
        

        // LIGHTS
        this.scene.add( new THREE.AmbientLight( 0x202020 ) );
        
        var mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.2,6,6),
            new THREE.MeshPhongMaterial({emissive:0xffffff}));
        var plight = new THREE.PointLight(0x555555, 1 , 30, 1);
        mesh.add(plight);
        mesh.position.set(0, 29, 0);
        this.scene.add(mesh);

        // RENDERER
        this.renderer = new THREE.WebGLRenderer({antialias: true});  // TODO ver o antialias 
        //this.renderer.shadowMapEnabled = true;
        //this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        //this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( this.renderer.domElement );

        this.composer = new THREE.EffectComposer( game.renderer );
        this.renderPass = new THREE.RenderPass( game.scene, game.camera );
        game.renderPass.renderToScreen = true;
        this.composer.addPass( game.renderPass );

        //glitch
        game.glitchPass = new THREE.GlitchPass();
        game.glitchPass.renderToScreen = false;
        game.glitchPass.goWild = true;
        game.composer.addPass( game.glitchPass );


        // GAME MAP
        this.scene.add(loader.map);
        this.scene.add(loader.floors);
        this.floors = loader.floors;
        this.floors.name="floors";
        this.scene.add(loader.walls);
        this.walls = loader.walls;
        this.walls.name="walls";
        
        //RAYCAST DEBUG
        //var gem = new THREE.BoxGeometry(0.1,0.5,0.1);
        //var lineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        //this.rayInter = new THREE.Mesh(gem, lineMaterial);
        //this.rayInter.name = "DEBUG_RAY";
        //this.scene.add(this.rayInter);

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
        this.verifyPointerLock();
        
        //CRIAR O JOGADOR
        this.createPlayer();

        // STATS
        this.stats1 = new Stats();
        this.stats1.showPanel(0); // Panel 0 = fps
        this.stats1.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
        document.body.appendChild(this.stats1.domElement);
    }

    this.startGlitch = function () {
        //console.log("glitchPass " + game.glitchPass);
        game.renderPass.renderToScreen = false;
        game.glitchPass.renderToScreen = true;
    };

    this.stopGlitch = function () {
        game.renderPass.renderToScreen = true;
        game.glitchPass.renderToScreen = false;
    };

    this.animate = function() {

        requestAnimationFrame( game.animate );
        if (game.gameOver) return;

        var delta = clock.getDelta();
        if (game.controlsEnabled) {
            resetPlayer();
            
            // Update das balas
            for (var i = 0 ; i < game.bullets.length ; i++){
                game.bullets[i].update(delta,i);
            }
    
            // Update do player
            game.player.update(delta);
            
            // enemy spawns

            game.enemySpawnTimerCurrent -= delta * game.currentTimeSpeed;
            if (game.enemySpawnTimerCurrent<=0){
                var enemy = enemyPool.allocate();
                enemy.activate(getRandomEnemySpawn());
                game.enemySpawnTimerCurrent = game.enemySpawnTimer;
                game.enemySpawnTimer *= 1 - 0.5 * delta * game.currentTimeSpeed;
            }



            // Update dos inimigos
            for (var i=0; i<game.enemies.length; i++) {
                // game.enemies[i].setPlaybackRate( game.currentTimeSpeed );
                game.enemies[i].update(delta * game.currentTimeSpeed,i);
            }
        }
        
        

        game.composer.render();

        game.stats1.update();       
    }


    this.onWindowResize = function( event ) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        game.renderer.setSize( width, height );
        game.camera.aspect = width / height;
        game.camera.updateProjectionMatrix();
    }

    this.createPlayer = function() {
        this.player = new Player();
        this.player.addWeapon(new Pistol(loader.gun1, Bullet, 20, 1,  new THREE.Vector3(0, 0.15, -1)));
        this.player.addWeapon(new Automatic(loader.gun2, Bullet, 30, 10, new THREE.Vector3(0, 0.1, -0.4)));
        updateWeaponHUD(this.player.weapons[0]);
    }

    this.endGame = function(){
        document.exitPointerLock = document.exitPointerLock    ||
        document.mozExitPointerLock;
        // Attempt to unlock
        document.exitPointerLock();

        endgameDiv.style.display = "block";
        finalScore.innerHTML = this.score;
        this.gameOver = true;
        retryButton.onclick = function(){
            game.restartGame();
        };
    }

    this.restartGame = function() {
        clock.getDelta();

        endgameDiv.style.display = "none";
        this.gameOver = false;

        // reset player health
        this.player.health = 100;
        this.player.isDead = false;
        this.player.tookDamage=false;
        updateMapColor(100);

        // reset enemies and bulelts
        var i = game.bullets.length;
        while (i-- ) // esta assim porque remove se do array enquanto se esta a iterar
            game.bullets[i].destroy(i);

        var j = game.enemies.length;
        while (j-- ) // esta assim porque remove se do array enquanto se esta a iterar
            game.enemies[j].destroy(j);

        this.controls.getObject().position.set( 0, 20, 0 );
        this.createPlayer();
        
        
        this.enemySpawnTimer = 4;
        this.enemySpawnTimerCurrent = 1;
        this.score = 0;
        scoreDiv.innerHTML = "";

        document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
        document.body.requestPointerLock();
        this.animate();
    }

    this.verifyPointerLock = function(){
        var havePointerLock = 'pointerLockElement' in document 
        || 'mozPointerLockElement' in document 
        || 'webkitPointerLockElement' in document;

        //verificar se o browser suporta pointerLock
        if ( havePointerLock ) {
            var element = document.body;

            function pointerlockchange( event ) {
                if (game.gameOver) return;

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

    }
}



