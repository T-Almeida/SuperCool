//funções e constantes auxiliares
var controlsEnabled = false;


function pointerlockchange( event ) {

    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

        controlsEnabled = true;
        controls.enabled = true;


    } else {

        controls.enabled = false;

        container.style.display = '-webkit-box';
        container.style.display = '-moz-box';
        container.style.display = 'box';

    }
}

// resize
function gameViewportSize() { return {
    width: window.innerWidth, height: window.innerHeight
}}

function resize() {
    var viewport = gameViewportSize();
    renderer.setSize( viewport.width, viewport.height );
    camera.aspect = viewport.width / viewport.height;
    camera.updateProjectionMatrix();
}


// game systems code
var min_box = new THREE.Vector3(-80,-80,-80);
var max_box = new THREE.Vector3(80,80,80);

function resetPlayer() {
    if( controls.getObject().position.y < -10 ) {
        controls.getObject().position.set( -2, 40, 15 );
        objPlayer.velocity.multiplyScalar( 0 );
        objPlayer.jumpDirection = [false,false,false,false];
    }
}

function outsideMap(position){
    return !(new THREE.Box3(min_box,max_box)).containsPoint(position);
}

function strVector(v) {
    return v.x + " " + v.y + " " + v.z;
}