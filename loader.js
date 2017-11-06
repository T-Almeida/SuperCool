function Loader(){
    this.gun1;
    this.gun2;
    this.gun3;

    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

    var progress = document.getElementById("loading");
    var progressBar = document.getElementById("loadingBar");
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
        progressBar.style.width = (itemsLoaded / itemsTotal * 100) + '%';
    };
    manager.onError = function ( url ) {
        console.log( 'There was an error loading ' + url );
    };

    this.loadObj = function(model, obj, mtl, path) { 
        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setPath(path);
        mtlLoader.load( 
            mtl, 
            function( materials ) {
                materials.preload();
                var objLoader = new THREE.OBJLoader(manager);
                objLoader.setMaterials( materials );
                objLoader.setPath(path);
                objLoader.load( 
                    obj, 
                    function ( object ) {
                        model = object;
                    } 
                );
            }
        );
    }

    this.load3ds = function(model, tds, tga, path) {
        var tgaLoader = new THREE.TGALoader(manager);
        var glockTexture = tgaLoader.load(tga);
        //3ds files dont store normal maps
        var tdsLoader = new THREE.TDSLoader(manager);
        tdsLoader.setPath(path);
        tdsLoader.load( 
            tds, 
            function ( object ) {
                object.children[0].material.map = glockTexture;
                model = object;
            }
        );
    }

    this.loadModels = function() {
        console.log("Game.loadModels()");


        this.loadObj(this.gun1, 'M24_R_Low_Poly_Version_obj.obj', 'M24_R_Low_Poly_Version_obj.mtl', 'models/submachine/');
        this.loadObj(this.gun2, 'gun.obj', 'gun.mtl', 'models/deagle/');
        this.load3ds(this.gun3, 'models/glock/glock18c.3ds', 'models/glock/glock18c.tga','models/glock/');

        while (this.gun1!=undefined || this.gun2!=undefined || this.gun3!=undefined);
        console.log("Finished loading");
        progress.style.visibility = "hidden" ;
        progressBar.style.visibility = "hidden" ;
    }


}
