


// game systems code
var min_box = new THREE.Vector3(-500,-20,-500);
var max_box = new THREE.Vector3(500,100,500);

function resetPlayer() {
    if( game.controls.getObject().position.y < -10 ) {

        game.controls.getObject().position.set( 1, 20, 1 );
        game.player.velocity.multiplyScalar( 0 );

        game.player.jumpDirection = [false,false,false,false];
    }
}

function outsideMap(position){
    return !(new THREE.Box3(min_box,max_box)).containsPoint(position);
}

function strVector(v) {
    return v.x + " " + v.y + " " + v.z;
}