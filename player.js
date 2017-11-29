function Player() {
    this.health = 100;
    updateMapColor(this.health);

    this.playerheight = 1.75;
    this.playerSpeed = 5;
    this.palyerMass = 5.0;
    this.jumpSpeed = 5;

    this.bbSizeX = 1;
    this.bbSizeZ = 2;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.jumpPress = false;
    this.mousePress = false;
    this.isDead = false;
    this.tookDamage = false;

    this.timeGlitchDamage= 0.5;
    this.timeGlitchDead = 3;
    this.timeCurrentGlitch = this.timeGlitch;


    this.weaponAtPreviousUpdate = -1;

    this.velocityVertical = 0;

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, this.playerheight + 1);

    this.wallDistance = 0.8;
    this.raycasterWalls = new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(),0,this.wallDistance+0.1);
    //RAYCAST DEBUG
    //this.rayWallDebug = new THREE.Mesh(new THREE.BoxGeometry(0.005,0.005,0.005), new THREE.MeshBasicMaterial({color:0xFF0000}) );
    //game.scene.add(this.rayWallDebug);

    this.directitionRay = new THREE.Vector3(0,0,0);

    this.boosts = []; //lista de boost que se aplicam ao player
    //BOOSTS
    var audio = new Audio('audio/boost.wav');
    var playerBoost = function() {
        game.player.velocityVertical = 16;
        game.player.isJumping = true;
        audio.play();
    };
    var boostPos = 17;
    var posBoostCenter = new THREE.Vector3(0,0,0);
    this.boosts.push(new Boost(posBoostCenter,playerBoost));
    posBoostCenter = new THREE.Vector3(boostPos,0,boostPos);
    this.boosts.push(new Boost(posBoostCenter,playerBoost));
    posBoostCenter = new THREE.Vector3(-boostPos,0,boostPos);
    this.boosts.push(new Boost(posBoostCenter,playerBoost));
    posBoostCenter = new THREE.Vector3(boostPos,0,-boostPos);
    this.boosts.push(new Boost(posBoostCenter,playerBoost));
    posBoostCenter = new THREE.Vector3(-boostPos,0,-boostPos);
    this.boosts.push(new Boost(posBoostCenter,playerBoost));

    var takeShotAudio = new Audio('audio/Homer_DOH.mp3');
    var gameoverAudio = new Audio('audio/gameover.wav');

    var self = this; // utilizar a referencia self para funcinar em multplas callbacks (problema dos eventos)

    //BoundingBox
    this.playerBB = new THREE.Box3(new THREE.Vector3(game.controls.getObject().position.x-this.bbSizeX, game.controls.getObject().position.y-this.playerheight ,game.controls.getObject().position.z-this.bbSizeZ),
                                    new THREE.Vector3(game.controls.getObject().position.x+this.bbSizeX, game.controls.getObject().position.y+1 ,game.controls.getObject().position.z+this.bbSizeZ));

    // ARMAS
    this.weapons = [];
    this.currentWeapon = 0;
    
    this.addWeapon = function(weapon) {
        this.weapons.push(weapon);
        game.controls.getObject().children[0].add(weapon.mesh);
    };


    this.updateWeaponGUI = function() {
        switch (this.currentWeapon){
            case 0:
                document.getElementById("weaponicon").src = "icons/pistol.png";
                break;
            case 1:
                document.getElementById("weaponicon").src = "icons/auto.png";
                break;
            
        }
    };

    // Muda a arma para a que esta no index passado
    // é necessário parar as outras armas, se estavam a recarregar e não acabaram depois tem que se recommeçar
    this.switchWeapon = function(weaponId) {
        if (!game.controlsEnabled || this.currentWeapon == weaponId)
            return;
        for (i=0; i<this.weapons.length; i++){
            var w = this.weapons[i];
            w.stopShooting();
            w.stopReloading();
            w.mesh.visible = false;
        }
        this.currentWeapon = weaponId;
        var cw = this.weapons[weaponId];
        cw.mesh.visible = true;
        cw.changeState(cw.previousState);
    };

    this.mousedown = function () {
        self.weapons[self.currentWeapon].startShooting();
    };
    this.mouseup = function () {
        self.weapons[self.currentWeapon].stopShooting();
    };

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
                self.directitionRay.z = -self.wallDistance;
                break;
            case 37: // left
            case 65: // a
                self.moveLeft = true;
                self.directitionRay.x = -self.wallDistance;
                break;
            case 40: // down
            case 83: // s
                self.moveBackward = true;
                self.directitionRay.z = self.wallDistance;
                break;
            case 39: // right
            case 68: // d
                self.moveRight = true;
                self.directitionRay.x = self.wallDistance;
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
                self.directitionRay.z = 0;
                break;
            case 37: // left
            case 65: // a
                self.moveLeft = false;
                self.directitionRay.x = 0;
                break;
            case 40: // down
            case 83: // s
                self.directitionRay.z = 0;
                self.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                self.moveRight = false;
                self.directitionRay.x = 0;
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

    this.updateGUI = function(cw) {
        
        
        
        // time speed update
        var timeBar = document.getElementById("timespeeddiv"); 
        var timeHeight = 100 - game.currentTimeSpeed / game.maxTimeSpeed * 100;
        timeBar.style.height = timeHeight + '%'; 
    };


    this.updateBB = function () {
        this.playerBB.min.set(game.controls.getObject().position.x-this.bbSizeX,game.controls.getObject().position.y-this.playerheight,game.controls.getObject().position.z-1);
        this.playerBB.max.set(game.controls.getObject().position.x+this.bbSizeX,game.controls.getObject().position.y+1,game.controls.getObject().position.z+1);
    };

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {

        if (this.isDead){
            if (this.timeCurrentGlitch<0){
                this.timeCurrentGlitch = this.timeGlitchDead;
                game.stopGlitch();
                game.endGame();
            }
            this.timeCurrentGlitch -= delta;
            return;
        }

        if (this.tookDamage){
            if (this.timeCurrentGlitch<0){
                this.timeCurrentGlitch = this.timeGlitchDamage;
                game.stopGlitch();
                this.tookDamage=false;
            }
            this.timeCurrentGlitch -= delta;
        }

        var cw = this.weapons[this.currentWeapon];
        cw.update(delta,0);
        // a arma foi trocada
        cw.mesh.visible = true;
        this.updateWeaponGUI();
        this.updateGUI(cw);

        this.velocityVertical -= game.gravity * this.palyerMass * delta; // * game.currentTimeSpeed; TODO para experimentar sem camera lenta

        this.updateBB();


        if (!this.isJumping && this.jumpPress){
            this.velocityVertical += this.jumpSpeed ; // TODO rever isto pq quando tempo para salta mais alto
            this.isJumping = true;
        }


        //TODO otimizar as variaveis e tirar o bloco de debug
        var dirCopy = new THREE.Vector3().copy(this.directitionRay);
        var vectorDir = dirCopy.applyMatrix4(new THREE.Matrix4().extractRotation(game.controls.getObject().matrix)).normalize();
        //this.rayWallDebug.position.copy(new THREE.Vector3().addVectors(game.controls.getObject().position,vectorDir.multiplyScalar(this.wallDistance)));
        this.raycasterWalls.ray.origin.copy(game.controls.getObject().position);
        this.raycasterWalls.ray.direction.copy(vectorDir);

        var intersectionWalls = this.raycasterWalls.intersectObjects(game.walls.children, true);

        if ( this.moveForward  && !(dirCopy.z!==0 && intersectionWalls.length>=1)) game.controls.getObject().translateZ(-this.playerSpeed * delta *  game.currentTimeSpeed);
        if ( this.moveBackward && !(dirCopy.z!==0 && intersectionWalls.length>=1)) game.controls.getObject().translateZ(this.playerSpeed * delta *  game.currentTimeSpeed);
        if ( this.moveLeft && !(dirCopy.x!==0 && intersectionWalls.length>=1)) game.controls.getObject().translateX(-this.playerSpeed * delta * game.currentTimeSpeed);
        if ( this.moveRight && !(dirCopy.x!==0 && intersectionWalls.length>=1)) game.controls.getObject().translateX(this.playerSpeed * delta *  game.currentTimeSpeed);

        //aplicar lógica dos boosts
        for (var i = 0;i<this.boosts.length; i++) {
            this.boosts[i].update(new THREE.Vector3().subVectors(game.controls.getObject().position,new THREE.Vector3(0,this.playerheight,0)))//ver se é preciso passar o delta
        }


        this.raycaster.ray.origin.copy(game.controls.getObject().position);
        //raycaster.ray.origin.y -= 10;

        var intersection = this.raycaster.intersectObjects(game.floors.children, true);

        //game.rayInter.visible = false; //OBJETO DO CENARIO DEBUG
        if (intersection.length>=1){
            //game.rayInter.visible = true;
            //game.rayInter.position.copy(intersection[0].point);
            if (game.controls.getObject().position.y-this.playerheight <= intersection[0].point.y) { //colisao com o chao
                if (this.velocityVertical<0) {
                    this.velocityVertical = 0;
                    game.controls.getObject().position.y = intersection[0].point.y+this.playerheight;
                    this.isJumping=false; //deteta qd n esta a salar
                }
            }
        }

        game.controls.getObject().translateY(this.velocityVertical * delta);

        
        // update da velocidade do tempo
        var acceleratingTimeStep = 5;
        var stoppingTimeStep = 2;
        if ( cw.isShooting || cw.isReloading) {
            /* TODO refazer isto, o tempo so devia andar se a arma disparar
                Esta logica provavelmente deve passar para a arma (o oponent usa a mesma arma por isso nao passei agora)
                se a arma nao tiver balas tambem nao devia parar
            */
            game.currentTimeSpeed = game.maxTimeSpeed;
        }
        else if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight || this.isJumping ) {
            var tempTimeSpeed = game.currentTimeSpeed + acceleratingTimeStep * delta ;
            game.currentTimeSpeed = Math.min(tempTimeSpeed, game.maxTimeSpeed);
        }
        else {
            var tempTimeSpeed = game.currentTimeSpeed - stoppingTimeStep * delta ;
            game.currentTimeSpeed = Math.max(tempTimeSpeed, game.minTimeSpeed);
        }
    };

    this.takeDamage = function(damage) {
        this.health -= damage;
        game.startGlitch();

        if (this.health <= 0) {
            game.currentTimeSpeed = game.minTimeSpeed;
            this.isDead = true;
            gameoverAudio.play();
            this.timeCurrentGlitch = this.timeGlitchDead;
            return ;
        }

        takeShotAudio.play();
        this.tookDamage = true;
        this.timeCurrentGlitch = this.timeGlitchDamage;
        updateMapColor(this.health);
    };
}