// cores a usar
var hexMain = "#ff6e00";

var c_1 = "#f5f5f5";
var c_2 = "#efa93a";
var c_3 = "#662200";
var c_4 = "#550000";
var c_5 = "#000000";

var colorDark = new THREE.Color("#111111");
var colorBlack = new THREE.Color("#050505");
var colorAccent = new THREE.Color("#037e93");
var colorSecondary = new THREE.Color(hexMain);
var colorWhite = new THREE.Color("#ffffff");



// game systems code
var min_box = new THREE.Vector3(-30,-5,-30);
var max_box = new THREE.Vector3(30,40,30);

function resetPlayer() {
    if( game.controls.getObject().position.y < -10 ) {

        game.controls.getObject().position.set( 1, 20, 1 );
        game.player.velocityVertical = 0;

        game.player.jumpDirection = [false,false,false,false];
    }
}

function outsideMap(position){
    return !(new THREE.Box3(min_box,max_box)).containsPoint(position);
}

function strVector(v) {
    return v.x + " " + v.y + " " + v.z;
}


function updateMapColor(health) {
    var color;
    if (health>80) 
        color = c_1;
    else if (health>60)
        color = c_2;
    else if (health>40)
        color = c_3;
    else if (health>20)
        color = c_4;
    else
        color = c_5;
    
    loader.mapAccentMaterial.color = new THREE.Color("#000000");
    loader.mapAccentMaterial.emissive = new THREE.Color(color);
}