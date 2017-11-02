var playerheight = 10;
var playerSpeed = 15;
var palyerMass = 25.0;
var jumpSpeed = 25;
var gravity = 2;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var jumpPress = false;

var isJumping = false;


var prevTime = performance.now();
var velocity = new THREE.Vector3();

function keybiding() {
    var onKeyDown = function (event) {
        console.log("key press " + event.keyCode)
        switch (event.keyCode) {
            case 80:
                pause = !pause;
                break;
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                jumpPress = true;
                break;

        }

    };

    var onKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

            case 32: // space
                jumpPress = false;
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    //colisao com o chao
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, playerheight + 0.5);
}

function movement() {
    if ( controlsEnabled ) {
        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;


        velocity.y -= gravity * palyerMass * delta; // 100.0 = mass

        if ( moveForward ) controls.getObject().translateZ(-playerSpeed * delta);
        if ( moveBackward ) controls.getObject().translateZ(playerSpeed * delta)

        if ( moveLeft ) controls.getObject().translateX(-playerSpeed * delta);
        if ( moveRight ) controls.getObject().translateX(playerSpeed * delta);

        if (jumpPress && !isJumping) {
            velocity.y += jumpSpeed;
            isJumping = true;
        }

        raycaster.ray.origin.copy(controls.getObject().position);
        //raycaster.ray.origin.y -= 10;



        var intersection = raycaster.intersectObject(platform);


        rayInter.visible = false;
        if (intersection.length>=1){
            rayInter.visible = true;
            rayInter.position.copy(intersection[0].point);
            if (controls.getObject().position.y-playerheight <= intersection[0].point.y) { //colisao com o chao
                if (velocity.y<0) {
                    velocity.y = 0;
                    controls.getObject().position.y = intersection[0].point.y+playerheight;
                    isJumping=false; //deteta qd n esta a salar
                }


            }
        }

        controls.getObject().translateY(velocity.y * delta);

        console.log("velocidade y " + velocity.y);
        //console.log("isJumping " + isJumping);
        //console.log("player position x " + controls.getObject().position.x + " y "+  controls.getObject().position.y +" z "+  controls.getObject().position.z);

        prevTime = time;
    }
}