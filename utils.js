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
}};

function resize() {
    var viewport = gameViewportSize();
    renderer.setSize( viewport.width, viewport.height );
    camera.aspect = viewport.width / viewport.height;
    camera.updateProjectionMatrix();
};


// game systems code
function resetPlayer() {
    if( controls.getObject().position.y < -10 ) {
        controls.getObject().position.set( -2, 40, 15 );
        objPlayer.velocity.multiplyScalar( 0 );
    }
}