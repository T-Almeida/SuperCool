function Player() {

    this.playerheight = 10;
    this.playerSpeed = 15;
    this.palyerMass = 25.0;
    this.jumpSpeed = 25;
    this.gravity = 2;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.jumpPress = false;

    this.isJumping = false;

    this.velocity = new THREE.Vector3();

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, this.playerheight + 1);

    this.onKeyDown = function (event) {

        switch (event.keyCode) {

            case 87: // w
                this.moveForward = true;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;

            case 32: // space
                this.jumpPress = true;
                break;

        }

    };

    this.onKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;

            case 32: // space
                this.jumpPress = false;
                break;

        }

    };

    // FUNCAO APENAS EXECUTADO 1 VEZ NO GAME LOOP
    this.create = function () {





    };

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta) {

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

            console.log("velocidade y " + this.velocity.y);
            //console.log("isJumping " + isJumping);
            //console.log("player position x " + controls.getObject().position.x + " y "+  controls.getObject().position.y +" z "+  controls.getObject().position.z);

        }
    };
    
    this.draw = function () {

    }
}