function Enemy() {

    this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(2,6,3),
        new THREE.MeshBasicMaterial({color:0x0f0fff}));

    this.meshBB = new THREE.Box3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0));
    this.meshBB.setFromObject(this.mesh);

    //FUNCAO CHAMADA EM TODOS OS FRAMES
    this.update = function (delta,objectIndex) {

        //detecao colisao com balas
        for (var i = 0;i<objetos.length ; i++){
            if (!(objetos[i] instanceof Bullet)) continue;
            if (this.meshBB.containsPoint(objetos[i].mesh.position)){
                console.log("Colisão");
                objetos[i].destroy(i);
            }
        }

    };

    this.render = function () {
        objetos.push(this);
        scene.add(this.mesh);
    }
}