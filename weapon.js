function Weapon(position) {

    this.position = position;

    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.1,0.1,0.5),
        new THREE.MeshBasicMaterial({color:0x005555}));

    //this.mesh.position.copy(posicaoOrigem);

    this.create = function () {

    };

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {

        var camPosWorld = sumVector3(controls.getObject().position,camera.getWorldDirection());//se for com vetor de direcao da camera fica centrado

        this.mesh.position.set( camPosWorld.x,
            camPosWorld.y,
            camPosWorld.z);
        //this.mesh.lookAt(camDirWorld);

        this.mesh.rotation.copy(camera.getWorldRotation());
    };



    this.render = function () {
        scene.add(this.mesh);
        objetos.push(this);
    };
}