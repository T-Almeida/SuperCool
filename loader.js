function Loader(){
    this.gun1;
    this.gun2;
    this.gun3;
    this.enemy;

    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

    // Loading manager para o progress bar
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
        document.getElementById("loadingBar").style.width = (itemsLoaded / itemsTotal * 100) + '%';
    };
    manager.onError = function ( url ) {
        console.log( 'There was an error loading ' + url );
    };

    this.loadGun1 = function() {
        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setPath('models/submachine/');
        mtlLoader.load( 
            'M24_R_Low_Poly_Version_obj.mtl', 
            function( materials ) {
                materials.preload();
                var objLoader = new THREE.OBJLoader(manager);
                objLoader.setMaterials( materials );
                objLoader.setPath('models/submachine/');
                objLoader.load( 
                    'M24_R_Low_Poly_Version_obj.obj', 
                    function ( object ) {
                        object.rotation.y = 180 * Math.PI / 180;
                        object.rotation.x =  0 * Math.PI / 180;
        -                //obj.rotateY(185 * Math.PI / 180); // 185 graus
        -                //obj.rotateX(-2 * Math.PI / 180); // -2 graus
                        object.position.set(1.2,-2, -2);
                        loader.gun1 = object;
                    } 
                );
            }
        );
    }

    this.loadGun2 = function() {
        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setPath('models/deagle/');
        mtlLoader.load( 
            'gun.mtl', 
            function( materials ) {
                materials.preload();
                var objLoader = new THREE.OBJLoader(manager);
                objLoader.setMaterials( materials );
                objLoader.setPath('models/deagle/');
                objLoader.load( 
                    'gun.obj', 
                    function ( object ) {
                        object.scale.set(0.3,0.3,0.3);
                        object.rotation.y =  180 * Math.PI / 180;
                        object.position.set(1,-2, -2);
                        loader.gun2 = object;
                    } 
                );
            }
        );
    }
    
    this.loadGun3 = function() {
        var tgaLoader = new THREE.TGALoader(manager);
        var glockTexture = tgaLoader.load('models/glock/glock18c.tga');
        //3ds files dont store normal maps
        var tdsLoader = new THREE.TDSLoader(manager);
        tdsLoader.setPath('models/glock/');
        tdsLoader.load( 
            'models/glock/glock18c.3ds', 
            function ( object ) {
                object.children[0].material.map = glockTexture;
                loader.gun3 = object;
            }
        );
    }

    this.loadEnemy = function() {
        
        var configOgro = {
            baseUrl: "models/ogro/",
            body: "ogro.md2",
            skins: [ "grok.jpg", "ogrobase.png", "arboshak.png", "ctf_r.png", "ctf_b.png", "darkam.png", "freedom.png",
                     "gib.png", "gordogh.png", "igdosh.png", "khorne.png", "nabogro.png",
                     "sharokh.png" ],
            weapons:  [ [ "weapon.md2", "weapon.jpg" ] ],
            animations: {
                move: "run",
                idle: "stand",
                jump: "jump",
                attack: "attack",
                crouchMove: "cwalk",
                crouchIdle: "cstand",
                crouchAttach: "crattack"
            },
            walkSpeed: 350,
            crouchSpeed: 175
        };
        var baseCharacter = new THREE.MD2CharacterComplex();
        baseCharacter.onLoadComplete = function () {
            baseCharacter.setWireframe( true );
            baseCharacter.enableShadows( true );
            // baseCharacter.setWeapon( 0 );
            //baseCharacter.setSkin( 0 );
            loader.enemy = baseCharacter;
            console.log(loader.enemy);
        };
        baseCharacter.loadParts( configOgro );

        

        /*
        // CHARACTER
        var config = {
            baseUrl: "models/ratamahatta/",
            body: "ratamahatta.md2",
            skins: [ "ratamahatta.png", "ctf_b.png", "ctf_r.png", "dead.png", "gearwhore.png" ],
            weapons:  [  [ "weapon.md2", "weapon.png" ],
                            [ "w_bfg.md2", "w_bfg.png" ],
                            [ "w_blaster.md2", "w_blaster.png" ],
                            [ "w_chaingun.md2", "w_chaingun.png" ],
                            [ "w_glauncher.md2", "w_glauncher.png" ],
                            [ "w_hyperblaster.md2", "w_hyperblaster.png" ],
                            [ "w_machinegun.md2", "w_machinegun.png" ],
                            [ "w_railgun.md2", "w_railgun.png" ],
                            [ "w_rlauncher.md2", "w_rlauncher.png" ],
                            [ "w_shotgun.md2", "w_shotgun.png" ],
                            [ "w_sshotgun.md2", "w_sshotgun.png" ]
                        ]
        };
        var enemyChar = new THREE.MD2Character();
        enemyChar.loadParts( config );
        enemyChar.scale = 0.5;

        enemyChar.onLoadComplete = function() {
            
            enemyChar.setWireframe( true );
            enemyChar.setSkin( 0 );
            //this.enemyChar.setWeapon( 6 ); 
            //var animation = game.enemyChar.meshBody.geometry.animations[6];
            enemyChar.setAnimation( "crattack" );
            loader.enemy = enemyChar;
        };    */    
    }

    this.loadModels = function() {
        console.log("Game.loadModels()");
        this.loadGun1();
        this.loadGun2();
        this.loadGun3();
        this.loadEnemy();
    }
}
