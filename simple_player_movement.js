var playerheight = 5;
var playerJumping = false;
var playerSpeed = 10;
var playerJumpSpeed = 75.0;
var palyerMass = 25.0;

var playerMinThreashool = 1;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

function keybiding() {
    var onKeyDown = function (event) {
        console.log("key press " + event.keyCode)
        switch (event.keyCode) {
            case 80:
                pause = !pause;
                break;
            case 38: // up
                if (canJump === true) velocity.y += 350;
                canJump = false;
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
                if (canJump === true) {
                    velocity.y += playerJumpSpeed;
                    playerJumping = true;
                }
                canJump = false;
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

        }

    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    //colisao com o chao
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 100 );
}

function movement() {
    if ( controlsEnabled ) {
        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;


        velocity.y -= 9.8 * palyerMass * delta; // 100.0 = mass

        if ( moveForward ) controls.getObject().translateZ(-playerSpeed * delta);
        if ( moveBackward ) controls.getObject().translateZ(playerSpeed * delta)

        if ( moveLeft ) controls.getObject().translateX(-playerSpeed * delta);
        if ( moveRight ) controls.getObject().translateX(playerSpeed * delta);


        raycaster.ray.origin.copy(controls.getObject().position);
        //raycaster.ray.origin.y -= 10;


        var intersection = raycaster.intersectObject(platform);


        if (intersection.length>=1){
            if (controls.getObject().position.y <= intersection[0].point.y+playerheight+1) { //colisao com o chao

                if (!playerJumping) {
                    velocity.y = 0;
                }
                playerJumping = false;

                controls.getObject().position.y = intersection[0].point.y+playerheight;

                canJump = true;

            }
        }

        controls.getObject().translateY(velocity.y * delta);

        console.log("forca gravitica " + velocity.y);
        console.log("player position x " + controls.getObject().position.x + " z "+  controls.getObject().position.z);

        prevTime = time;
    }
}