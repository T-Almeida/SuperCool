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
var colorSecondary = new THREE.Color("#ff6e00");
var colorWhite = new THREE.Color("#ffffff");
var colorRed = new THREE.Color("#ff0000");

var container = document.getElementById("container");
var blocker = document.getElementById("blocker");
var instructions = document.getElementById( 'instructions' );
var bulletPoolInfo = document.getElementById( 'bulletPoolDiv' );
var enemyPoolInfo = document.getElementById( 'enemyPoolDiv' );
var endgameDiv = document.getElementById( 'endgameDiv' );
var finalScore = document.getElementById( 'finalScore' );
var scoreDiv = document.getElementById( 'scoreDiv' );
var retryButton = document.getElementById( 'retryButton' );
var crosshair = document.getElementById("crosshaircircle").style;
var currentAmmoDiv = document.getElementById("currentAmmo");
var maxAmmoDiv = document.getElementById("maxAmmo");
var reloadBar = document.getElementById("currentreload"); 



// game systems code
var min_box = new THREE.Vector3(-30,-5,-30);
var max_box = new THREE.Vector3(30,40,30);

function resetPlayer() {
    if( game.controls.getObject().position.y < -1 ) {

        game.controls.getObject().position.set( 0, 20, 0 );
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
    
    loader.mapAccentMaterial.color = new THREE.Color(color);
    loader.mapAccentMaterial.emissive = new THREE.Color(color);
}


var enemySpawns = [
    new THREE.Vector3(0,0,-13),
    new THREE.Vector3(-13,0,0),
    new THREE.Vector3(13,0,0),
    new THREE.Vector3(0,0,13),
    new THREE.Vector3(17,0,17),
    new THREE.Vector3(17,0,-17),
    new THREE.Vector3(-17,0,17),
    new THREE.Vector3(-17,0,-17),
    new THREE.Vector3(7,10,7),
    new THREE.Vector3(7,10,-7),
    new THREE.Vector3(-7,10,7),
    new THREE.Vector3(-7,10,-7),
    new THREE.Vector3(16,8,0),
    new THREE.Vector3(-16,8,0),
    new THREE.Vector3(0,8,16),
    new THREE.Vector3(0,8,-16),
    new THREE.Vector3(0,0,0),
]
function getRandomEnemySpawn() {
    var r = Math.floor(Math.random() * enemySpawns.length);
    return enemySpawns[r];
}


function updateWeaponHUD(weapon) {
    currentAmmoDiv.innerHTML = weapon.currentAmmo;
    if (weapon.maxAmmo == -1)
        maxAmmoDiv.innerHTML = "∞";
    else
        maxAmmoDiv.innerHTML = weapon.maxAmmo;
}

function updateReloadHUD(weapon){
    // update da div que diz se esta a recarregar
    var relProg = 100 - weapon.reloadCooldown / weapon.reloadTime * 100;
    reloadBar.style.width = relProg + '%'; 
}