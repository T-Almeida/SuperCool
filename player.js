function Player() {
    this.playerheight = 5;
    this.playerSpeed = 20;
    this.palyerMass = 25.0;
    this.jumpSpeed = 25;
    this.gravity = 2;


    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.jumpPress = false;

    this.mousePress = false;

    this.velocity = new THREE.Vector3();

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, this.playerheight + 1);

    var self = this; // utilizar a referencia self para funcinar em multplas callbacks (problema dos eventos)
    
    // ARMAS
    this.weapons = [];

    var w1 = new Pistol(new THREE.Vector3(0.4,-0.2,-0.5));
    this.weapons.push(w1);
    objetos.push(w1);
    controls.getObject().children[0].add(w1.mesh);

    var w2 = new Automatic(new THREE.Vector3(0.4,-0.2,-0.5));
    this.weapons.push(w2);
    objetos.push(w2);
    controls.getObject().children[0].add(w2.mesh);

    this.currentWeapon = 0;
    this.weapons[0].mesh.visible = true;

    this.switchWeapon = function(weaponId) {
        if (this.currentWeapon == weaponId)
            return;
        for (i=0; i<this.weapons.length; i++){
            var w = this.weapons[i];
            w.stopShooting();
            w.stopReloading();
            w.mesh.visible = false;
        }

        this.weapons[weaponId].mesh.visible = true;
        this.currentWeapon = weaponId;
    }

    //adicionar o objeto como objeto ativo
    objetos.push(this);

    this.mousedown = function () {
        self.weapons[self.currentWeapon].startShooting();
    };
    this.mouseup = function () {
        self.weapons[self.currentWeapon].stopShooting();
    };

    // Muda a arma para a que esta no index passado
    // é necessário parar as outras armas, se estavam a recarregar e não acabaram depois tem que se recommeçar
    

    this.onKeyDown = function (event) {
        switch (event.keyCode) {
            case 49: // 1 weapon
                self.switchWeapon(0);
                break;
            case 50: // 2 weapon
                self.switchWeapon(1);
                break;
            case 82: // r  reload
                self.weapons[self.currentWeapon].reload();
                break;
            case 38: // up
            case 87: // w
                self.moveForward = true;
                break;

            case 37: // left
            case 65: // a
                self.moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                self.moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                self.moveRight = true;
                break;

            case 32: // space
                self.jumpPress = true;
                break;

        }

    };

    this.onKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                self.moveForward = false;
                break;

            case 37: // left
            case 65: // a
                self.moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                self.moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                self.moveRight = false;
                break;

            case 32: // space
                self.jumpPress = false;
                break;

        }

    };


    //binding de eventos
    document.addEventListener('keydown', this.onKeyDown , false);
    document.addEventListener('keyup', this.onKeyUp , false);
    document.addEventListener('mousedown', this.mousedown , false);
    document.addEventListener('mouseup', this.mouseup , false);

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {

        // update do div com as balas
        var cw = this.weapons[this.currentWeapon];
        document.getElementById("ammodiv").innerHTML = cw.currentAmmo + " / " + cw.maxAmmo;
        // update da div que diz se esta a recarregar
        if (cw.isReloading)
            document.getElementById("reloadingdiv").innerHTML = "RELOADING";
        else
            document.getElementById("reloadingdiv").innerHTML = "";
        

        if ( controlsEnabled ) {

            this.velocity.y -= this.gravity * this.palyerMass * delta; // 100.0 = mass

            if ( this.moveForward ) controls.getObject().translateZ(-this.playerSpeed * delta);
            if ( this.moveBackward ) controls.getObject().translateZ(this.playerSpeed * delta)

            if ( this.moveLeft ) controls.getObject().translateX(-this.playerSpeed * delta);
            if ( this.moveRight ) controls.getObject().translateX(this.playerSpeed * delta);

            if (this.jumpPress && !this.isJumping) {
                this.velocity.y += this.jumpSpeed;
                this.isJumping = true;
            }

            this.raycaster.ray.origin.copy(controls.getObject().position);
            //raycaster.ray.origin.y -= 10;



            var intersection = this.raycaster.intersectObject(platform);


            rayInter.visible = false; //OBJETO DO CENARIO DEBUG
            if (intersection.length>=1){
                rayInter.visible = true;
                rayInter.position.copy(intersection[0].point);
                if (controls.getObject().position.y-this.playerheight <= intersection[0].point.y) { //colisao com o chao
                    if (this.velocity.y<0) {
                        this.velocity.y = 0;
                        controls.getObject().position.y = intersection[0].point.y+this.playerheight;
                        this.isJumping=false; //deteta qd n esta a salar
                    }


                }
            }

            controls.getObject().translateY(this.velocity.y * delta);

            //console.log("velocidade y " + this.velocity.y);
            //console.log("isJumping " + isJumping);
            //console.log("player position x " + controls.getObject().position.x + " y "+  controls.getObject().position.y +" z "+  controls.getObject().position.z);

        }
    };
    
    this.draw = function () {

    };

}