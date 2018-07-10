var canvas = document.getElementById("renderCanvas");

var engine = new BABYLON.Engine(canvas, true);


var createScene = function() {

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 90, BABYLON.Vector3.Zero(), scene);
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 150;
    camera.attachControl(canvas, true);


    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
    light.position = new BABYLON.Vector3(20, 40, 20);
    light.intensity = 1;

    var myGround = BABYLON.MeshBuilder.CreateGround("myGround", {width: 100, height: 100, subdivsions: 4}, scene);
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("21f28eaf0b29268898fed9749823ece9.jpg", scene);
    groundMaterial.diffuseTexture.uScale = 6;
    groundMaterial.diffuseTexture.vScale = 6;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    myGround.position.y = -2.05;
    myGround.material = groundMaterial;
    var myBox = BABYLON.MeshBuilder.CreateBox("myBox", {height: 10, width: 10, depth: 10}, scene);
    myBox.position.y = 2.95;
    var boxMaterial = new BABYLON.StandardMaterial('mybox',scene);
    boxMaterial.diffuseTexture = new BABYLON.Texture('f745670374d09e2b0f71bab78dea3253.png',scene);
    boxMaterial.specularColor = new BABYLON.Color3(0,0,0);
    boxMaterial.alpha = 1;
    myBox.material = boxMaterial;


    // Sky material
    var skyboxMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    //skyboxMaterial._cachedDefines.FOG = true;

    // Sky mesh (box)
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 200.0, scene);
    skybox.material = skyboxMaterial;

    var setSkyConfig = function (property, from, to) {
        var keys = [
            { frame: 0, value: from },
            { frame: 100, value: to }
        ];
        
        var animation = new BABYLON.Animation("animation", property, 100, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys(keys);
        
        scene.stopAnimation(skybox);
        scene.beginDirectAnimation(skybox, [animation], 0, 100, false, 1);
    };

    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);

    shadowGenerator.addShadowCaster(myBox);

    myGround.receiveShadows = true;


    var startingPoint;
    var currentMesh;

    var getGroundPosition = function () {
        // Use a predicate to get position on the ground
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == myGround; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var onPointerDown = function (evt) {
        if (evt.button !== 0) {
            return;
        }

        // check if we are under a mesh
        var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== myGround && mesh !== skybox; });
        if (pickInfo.hit) {
            currentMesh = pickInfo.pickedMesh;
            startingPoint = getGroundPosition(evt);

            if (startingPoint) { // we need to disconnect camera from canvas
                setTimeout(function () {
                    camera.detachControl(canvas);
                }, 0);
            }
        }
    }

    var onPointerUp = function () {
        if (startingPoint) {
            camera.attachControl(canvas, true);
            startingPoint = null;
            return;
        }
    }

    var onPointerMove = function (evt) {
        if (!startingPoint) {
            return;
        }

        var current = getGroundPosition(evt);

        if (!current) {
            return;
        }

        var diff = current.subtract(startingPoint);
        currentMesh.position.addInPlace(diff);

        startingPoint = current;

    }

    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);


    setSkyConfig("material.inclination", skyboxMaterial.inclination, 0);
    return scene;
};


var scene = createScene();

engine.runRenderLoop(function() {
    scene.render();
});


window.addEventListener("resize", function() {
    engine.resize();
});