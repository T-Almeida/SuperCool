function Weapon(position) {

    this.position = position;

    this.bulletSpeed = 50;
    this.rpm = 650;

    this.coolDown = 0;

    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.1,0.1,0.5),
        new THREE.MeshBasicMaterial({color:0x005555}));

    this.mesh.position.copy(position);

    objetos.push(this);

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {
        //update  coolDown
        if (this.coolDown>0) this.coolDown -= delta;
    };

    this.shootBullets = function (delta) {
        var worldVec = new THREE.Vector3(0,0,0);
        this.mesh.localToWorld(worldVec);


        if (this.coolDown <= 0) {
            //criar bala
            var bullet = new Bullet(worldVec, camera.getWorldDirection(), this.bulletSpeed);
            //draw bullet
            bullet.render();
            this.coolDown = 60/this.rpm;
        }


    }


}