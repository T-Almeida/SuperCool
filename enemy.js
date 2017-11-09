function Enemy(position) {

    this.controls = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        attack: true
    };

    this.enemyChar = new THREE.MD2CharacterComplex();
    this.enemyChar.scale = 0.5;
    this.enemyChar.controls = this.controls;
    this.enemyChar.shareParts( loader.enemy );
    // cast and receive shadows
    this.enemyChar.setWireframe (true) ;
    this.enemyChar.enableShadows( true );
    this.enemyChar.setWeapon( 0 );
    //enemyChar.setSkin( i );
    console.log(this.enemyChar);
    this.mesh = this.enemyChar.root // redundandte, mas para manter a consistencia

    this.mesh.position.copy(position);

    this.meshBB = new THREE.Box3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0));
    this.meshBB.setFromObject(this.mesh);

    var helper = new THREE.Box3Helper( this.meshBB, 0x0000ff );
    game.scene.add( helper );

    //adicionar o disparo
    var pointBulletSpawn3 = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.1), new THREE.MeshBasicMaterial({color:0x0000ff}));// usar isto para encontrar o ponto

    this.enemyChar.weapons[0].add(pointBulletSpawn3);
    //var pointBulletSpawn = new THREE.Object3D();
    this.pointBulletSpawn = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshBasicMaterial({color:0xff0000}));
    this.pointBulletSpawn.position.set(28,13,-12);
    console.log("pos " + strVector(this.pointBulletSpawn.position));
   // this.mesh.children[1].children[0].add(pointBulletSpawn);
    this.enemyChar.meshWeapon.add(this.pointBulletSpawn);

    this.isSun = false;

    this.speed = 10;

    this.fireCooldown = 1;

    this.shoot = function (){





        var pointBulletVec = new THREE.Vector3(0,0,0);
        this.pointBulletSpawn.localToWorld(pointBulletVec);


        var direction = new THREE.Vector3( 0, 0, 1 ).applyMatrix4(new THREE.Matrix4().extractRotation( this.mesh.matrix ));

        //console.log(pointBulletVec);
        //console.log(direction);
        direction.y=0;
        var bullet = new EnemyBullet(pointBulletVec, direction, 80);
        //draw bullet
        bullet.render();

    };


    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex){




        //update animation
        this.enemyChar.update(delta*game.currentTimeSpeed);

        //this.mesh.lookAt(game.controls.getObject().position);


        this.meshBB.setFromObject(this.mesh); //update bounding box
        this.detectCollision();

        //this.mesh.rotateY(0.3*delta * superHotConstant);
        //this.mesh.translateZ(-this.speed*delta * superHotConstant);


        if (this.fireCooldown<=0) {
            this.shoot();
            this.fireCooldown = 1;
        }

        if (this.fireCooldown>0) this.fireCooldown -= delta * game.currentTimeSpeed;

    };

    this.detectCollision = function () {
        //detecao colisao com balas e futuramente outros
        for (var i = 0;i<game.objects.length ; i++){
            if (!(game.objects[i] instanceof Bullet)) continue;
            if (this.meshBB.containsPoint(game.objects[i].mesh.position)){
                console.log("Colisão");
                game.objects[i].destroy(i);
            }
        }
    };

    this.render = function () {
        game.objects.push(this);
        game.scene.add(this.mesh);
    }
}