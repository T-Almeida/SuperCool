function Loader(){
    this.gun1;
    this.gun2;
    this.gun3;

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

    this.loadModels = function() {
        console.log("Game.loadModels()");
        this.loadGun1();
        this.loadGun2();
        this.loadGun3();
    }
}
