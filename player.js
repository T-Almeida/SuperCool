function Player() {

    this.playerheight = 10;
    this.playerSpeed = 15;
    this.palyerMass = 25.0;
    this.jumpSpeed = 25;
    this.gravity = 2;
    this.bulletSpeed = 20;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.jumpPress = false;

    this.mousePress = false;

    this.velocity = new THREE.Vector3();

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, this.playerheight + 1);

    var self = this; // utilizar a referencia self para funcinar em multplas callbacks (problema dos eventos)

    this.mousedown = function () {
        self.mousePress = true;
    };
    this.mouseup = function () {
        self.mousePress = false;
    };


    this.onKeyDown = function (event) {

        switch (event.keyCode) {

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

    // FUNCAO APENAS EXECUTADO 1 VEZ NO GAME LOOP
    this.create = function () {
        //binding de eventos
        document.addEventListener('keydown', this.onKeyDown , false);
        document.addEventListener('keyup', this.onKeyUp , false);
        document.addEventListener('mousedown', this.mousedown , false);
        document.addEventListener('mouseup', this.mouseup , false);
    };

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {

        if ( controlsEnabled ) {

            this.velocity.y -= this.gravity * this.palyerMass * delta; // 100.0 = mass

            if ( this.moveForward ) controls.getObject().translateZ(-this.playerSpeed * delta);
            if ( this.moveBackward ) controls.getObject().translateZ(this.playerSpeed * delta)

            if ( this.moveLeft ) controls.getObject().translateX(-this.playerSpeed * delta);
            if ( this.moveRight ) controls.getObject().translateX(this.playerSpeed * delta);

            if (this.mousePress) this.shootBullet();

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


    this.shootBullet = function () {
        console.log("Shot ")
        //criar bala

        var dir = camera.getWorldDirection();
        var bullet = new Bullet(controls.getObject().position,dir,this.bulletSpeed);
        //draw bullet
        scene.add(bullet.draw());

        objetos.push(bullet); // para sofrer update no gameloop

    };
}