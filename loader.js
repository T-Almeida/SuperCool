function Loader(){
    this.gun1;
    this.gun2;
    this.enemy;
    this.map;

    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

    // Loading manager para o progress bar
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
        document.getElementById("loadingBar").style.width = (itemsLoaded / itemsTotal * 100) + '%';
    };
    manager.onError = function ( url ) {
        console.log( 'There was an error loading ' + url );
    };

    this.loadScene = function() {
        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setPath('models/cena/');
        mtlLoader.load( 
            'cena.mtl', 
            function( materials ) {
                materials.preload();
                var objLoader = new THREE.OBJLoader(manager);
                objLoader.setMaterials( materials );
                objLoader.setPath('models/cena/');
                objLoader.load( 
                    'cena.obj', 
                    function ( object ) {
                        loader.map = object;
                        loader.processMaterial(object);
                    } 
                );
            }
        );
    }

    this.loadGun1 = function() {
        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setPath('models/pistol/');
        mtlLoader.load( 
            'pistol.mtl', 
            function( materials ) {
                materials.preload();
                var objLoader = new THREE.OBJLoader(manager);
                objLoader.setMaterials( materials );
                objLoader.setPath('models/pistol/');
                objLoader.load( 
                    'pistol.obj', 
                    function ( object ) {
                        object.position.set(0.15, -0.25, -0.3);
                        loader.gun1 = object;
                        loader.processMaterial(object);
                    } 
                );
            }
        );
    }

    this.loadGun2 = function() {
        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setPath('models/rifle/');
        mtlLoader.load( 
            'rifle.mtl', 
            function( materials ) {
                materials.preload();
                var objLoader = new THREE.OBJLoader(manager);
                objLoader.setMaterials( materials );
                objLoader.setPath('models/rifle/');
                objLoader.load( 
                    'rifle.obj', 
                    function ( object ) {
                        object.position.set(0.15, -0.25, -0.3);
                        loader.gun2 = object;
                        loader.processMaterial(object);
                    } 
                );
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
        this.loadScene();
        this.loadGun1();
        this.loadGun2();
        this.loadEnemy();
    }

    this.processMaterial = function(object) {
        /*var material = new THREE.MeshBasicMaterial(colorWhite);

        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                if (child.material instanceof THREE.Material && child.material.name == "myBlack")
                    child.material = material;
            }
        } );*/


        for (i=0; i<object.children.length; i++){
            var child = object.children[i];
            var mat;
            if (child.material instanceof THREE.MeshPhongMaterial){
                mat = child.material;
                if (mat.name == "myAccent1") {
                    mat.emissive =  colorAccent;
                }
                else if (mat.name == "mySecondary1") {
                    mat.emissive =  colorSecondary;
                }
                else if (mat.name == "myBlack"){
                    mat.color = colorBlack;
                    mat.snininess = 0;
                    mat.specular = colorBlack;
                } 
                else if (mat.name == "myDark") {
                    mat.color = colorDark;
                }
            }
            else {
                for (j=0; j<child.material.length; j++) {
                    mat = child.material[j];
                    if (mat.name == "myAccent1") {
                        mat.emissive =  colorAccent;
                    }
                    else if (mat.name == "mySecondary1") {
                        mat.emissive =  colorSecondary;
                    }
                    else if (mat.name == "myBlack"){
                        mat.color = colorBlack;
                        mat.snininess = 0;
                        mat.specular = colorBlack;
                    } 
                    else if (mat.name == "myDark") {
                        mat.color = colorDark;
                        mat.snininess = 100;
                        mat.specular = colorBlack;
                        
                    }
                }
            }
            
        }
    }
}
