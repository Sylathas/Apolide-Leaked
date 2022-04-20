import {convsMale} from './texts.js';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/EffectComposer.js';
import { BloomPass } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/BloomPass.js';
import { AnaglyphEffect } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/effects/AnaglyphEffect.js';

var game;
document.addEventListener("DOMContentLoaded", function(){ game = new Game(); });

class Game{
	constructor(){
		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
		this.modes = Object.freeze({
			NONE:   Symbol("none"),
			PRELOAD: Symbol("preload"),
			INITIALISING:  Symbol("initialising"),
			CREATING_LEVEL: Symbol("creating_level"),
			ACTIVE: Symbol("active"),
			GAMEOVER: Symbol("gameover")
		});
		this.mode = this.modes.NONE;

		this.loaded;

		this.effect;
		this.renderPass;
		this.composer;
		this.bloomPass
		this.container;
		this.player;
		this.barman;
		this.storeOwner;
		this.groupie;
		this.dealer;
		this.hater;
		this.fashionNerd;
		this.controls;
		this.cameras;
		this.camera;
		this.scene;
		this.cssScene;
		this.renderer;
		this.cssRenderer;
		this.animations = {};
		this.assetsPath = 'assets/';
		this.forward = 0;
		this.turn = 0;
		this.emote;
		this.options;
		this.video;
    	this.convCounter = 0;
    	this.convCounterDue = 0;
		this.timerFirst;
		this.lightsPalco = [];
		this.mouseIsDown = false;
		this.stageCam = false;
		this.firstFrameOrbiter = 0;
		this.Elettro;

		this.remotePlayers = [];
		this.remoteColliders = [];
		this.remoteNPCsColliders = [];
		this.npcs = [];
		this.initialisingPlayers = [];
		this.remoteData = [];

		this.loadProgress = 0;

		this.messages = {
			text:[
			"Benvenuto nel teatro di Covo Hotel",
			"Prenditi un posto"
			],
			index:0
		}

		this.container = document.createElement( 'div' );
		this.container.style.height = '100%';
		document.body.appendChild( this.container );

		const sfxExt = SFX.supportsAudioType('mp3') ? 'mp3' : 'ogg';

		const game = this;
		this.anims = ["Naruto", "Dance", 'Turn', 'Running', 'Talking'];

		const options = {
			assets:[
				`${this.assetsPath}images/nx.png`,
				`${this.assetsPath}images/px.png`,
				`${this.assetsPath}images/ny.png`,
				`${this.assetsPath}images/py.png`,
				`${this.assetsPath}images/nz.png`,
				`${this.assetsPath}images/pz.png`
			],
			oncomplete: function(){
				this.options = options;
				game.init();
			}
		}

		this.anims.forEach( function(anim){ options.assets.push(`${game.assetsPath}fbx/anims/${anim}.fbx`)});
		//options.assets.push(`${game.assetsPath}fbx/town.gltf`);
		//options.assets.push(`${game.assetsPath}fbx/people/elpucios.fbx`);
		//options.assets.push('./concert.mp4')

		this.mode = this.modes.PRELOAD;

		this.clock = new THREE.Clock();

		this.addKeyboardControl;

		const preloader = new Preloader(options);

		window.onError = function(error){
			console.error(JSON.stringify(error));
		}
	}

	initSfx(){
		this.sfx = {};
		this.sfx.context = new (window.AudioContext || window.webkitAudioContext)();
		this.sfx.gliss = new SFX({
			context: this.sfx.context,
			src:{mp3:`${this.assetsPath}sfx/gliss.mp3`, ogg:`${this.assetsPath}sfx/gliss.ogg`},
			loop: false,
			volume: 0.3
		});
	}

	set activeCamera(object){
		this.cameras.active = object;
	}

	init() {
		this.loaded = false;
		let convOpen = false;
		this.mode = this.modes.INITIALISING;
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 400, 100000 );
		console.log("Inizializzo");
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.Fog( 0x000000, 0.0, 50000.0 );
		this.scene.background = new THREE.Color( 0x15181c );

		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", "http://worldclockapi.com/api/json/utc/now", false ); // false for synchronous request
		xmlHttp.send( null );
		console.log(xmlHttp.responseText);

		//console.log(process.argv.slice(2));

		const lightSize = 20000;

		const ambient = new THREE.AmbientLight( 0xeaeaea, 0.05);

		this.scene.add( ambient );

        /*const light = new THREE.DirectionalLight( 0x404040, 4);
        light.position.set( 100, 100, 40 );
        //light.target.position.set( 0, 0, 0 );

		this.cssScene = new THREE.Scene();

        light.castShadow = true;

        light.shadow.camera.near = 1;
        light.shadow.camera.far = 500;
		light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
		light.shadow.camera.right = light.shadow.camera.top = lightSize;

        light.shadow.bias = 0.0039;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

		this.sun = light;
		//this.scene.add(light);*/

		this.stageCam = false;


		const lightStore = new THREE.PointLight( 0xFFFFFF, 0.8);
		lightStore.position.set( 6546, 1000, -2627);
		//lightStore.target.position.set( 6546, -57, -2627);

		lightStore.castShadow = false;
		lightStore.shadow.camera.near = 1;
		lightStore.shadow.camera.far = 2000;
		lightStore.shadow.camera.left = lightStore.shadow.camera.bottom = -lightSize;
		lightStore.shadow.camera.right = lightStore.shadow.camera.top = lightSize;

		lightStore.shadow.bias = 0.0009;
		lightStore.distance = 3000;
		lightStore.shadow.mapSize.width = 1024;
		lightStore.shadow.mapSize.height = 1024;

		//this.scene.add(lightStore);
		//this.scene.add(lightStore.target);

		const helper2 = new THREE.PointLightHelper( lightStore, 400 );
		//this.scene.add(helper2);

		const lightStore3 = new THREE.PointLight( 0xFFFFFF, 0.8);
		lightStore3.position.set( 272, 820, 6355);
		//lightStore.target.position.set( 6546, -57, -2627);

		lightStore3.castShadow = false;
		lightStore3.shadow.camera.near = 1;
		lightStore3.shadow.camera.far = 2000;
		lightStore3.shadow.camera.left = lightStore.shadow.camera.bottom = -lightSize;
		lightStore3.shadow.camera.right = lightStore.shadow.camera.top = lightSize;

		lightStore3.shadow.bias = 0.0009;
		lightStore3.distance = 3000;
		lightStore3.shadow.mapSize.width = 1024;
		lightStore3.shadow.mapSize.height = 1024;

		this.scene.add(lightStore3);
		//this.scene.add(lightStore.target);

		const helper7 = new THREE.PointLightHelper( lightStore3, 400 );
		//this.scene.add(helper7);

		const lightStore2 = new THREE.DirectionalLight( 0x37a7f2, 1);
		//lightStore2.position.set( 626, 3263, 8729);
		lightStore2.position.set(0, 4263, 0);
		//lightStore.target.position.set( 6546, -57, -2627);

		lightStore2.castShadow = false;
		lightStore2.shadow.camera.near = 1;
		lightStore2.shadow.camera.far = 2000;
		lightStore2.shadow.camera.left = lightStore2.shadow.camera.bottom = -lightSize;
		lightStore2.shadow.camera.right = lightStore2.shadow.camera.top = lightSize;

		lightStore2.shadow.bias = 0.0009;
		lightStore2.shadow.mapSize.width = 1024;
		lightStore2.shadow.mapSize.height = 1024;

		this.scene.add(lightStore2);
		//this.scene.add(lightStore.target);

		const helper6 = new THREE.PointLightHelper( lightStore2, 400 );
		//this.scene.add(helper6);

		const lightStore4 = new THREE.PointLight( 0xFFFFFF, 0.8);
		lightStore4.position.set( 1680, 820, 6355);
		//lightStore.target.position.set( 6546, -57, -2627);

		lightStore4.castShadow = false;
		lightStore4.shadow.camera.near = 1;
		lightStore4.shadow.camera.far = 2000;
		lightStore4.shadow.camera.left = lightStore4.shadow.camera.bottom = -lightSize;
		lightStore4.shadow.camera.right = lightStore4.shadow.camera.top = lightSize;

		lightStore4.shadow.bias = 0.0009;
		lightStore4.distance = 3000;
		lightStore4.shadow.mapSize.width = 1024;
		lightStore4.shadow.mapSize.height = 1024;

		this.scene.add(lightStore4);
		//this.scene.add(lightStore.target);

		const helper8 = new THREE.PointLightHelper( lightStore4, 400 );
		//this.scene.add(helper8);

		const lightStore5 = new THREE.PointLight( 0xFFFFFF, 0.8);
		lightStore5.position.set( -1806, 820, 6355);
		//lightStore.target.position.set( 6546, -57, -2627);

		lightStore5.castShadow = false;
		lightStore5.shadow.camera.near = 1;
		lightStore5.shadow.camera.far = 2000;
		lightStore5.shadow.camera.left = lightStore2.shadow.camera.bottom = -lightSize;
		lightStore5.shadow.camera.right = lightStore2.shadow.camera.top = lightSize;

		lightStore5.shadow.bias = 0.0009;
		lightStore5.distance = 3000;
		lightStore5.shadow.mapSize.width = 1024;
		lightStore5.shadow.mapSize.height = 1024;

		this.scene.add(lightStore5);
		//this.scene.add(lightStore.target);

		const helper9 = new THREE.PointLightHelper( lightStore5, 400 );
		//this.scene.add(helper9);

		const lightBuild = new THREE.SpotLight( 0x04b100, 4);
		//lightBuild.position.set( 64817, 2000, -8730);
		lightBuild.position.set( 6527, 800, -8600 );
		lightBuild.target.position.set( 3805, 0, -7651);
		lightBuild.penumbra = 1;
		lightBuild.angle = 0.674;
		lightBuild.distance = 4000;

		lightBuild.castShadow = true;
		lightBuild.shadow.camera.near = 1;
		lightBuild.shadow.camera.far = 2000;
		lightBuild.shadow.camera.left = lightBuild.shadow.camera.bottom = -lightSize;
		lightBuild.shadow.camera.right = lightBuild.shadow.camera.top = lightSize;

		lightBuild.shadow.bias = 0;
		lightBuild.shadow.mapSize.width = 1024;
		lightBuild.shadow.mapSize.height = 1024;


		this.scene.add(lightBuild);
		//this.scene.add(lightBuild.target);

		const helper1 = new THREE.SpotLightHelper( lightBuild, 400 );
		//this.scene.add(helper1);

		const lightBuild2 = new THREE.SpotLight( 0x04b100, 4);
		//lightBuild.position.set( 64817, 2000, -8730);
		lightBuild2.position.set( 7347, 800, -6352 );
		lightBuild2.target.position.set( 3805, 0, -7651);
		lightBuild2.penumbra = 1;
		lightBuild2.angle = 0.674;
		lightBuild2.distance = 4000;

		lightBuild2.castShadow = true;
		lightBuild2.shadow.camera.near = 1;
		lightBuild2.shadow.camera.far = 2000;
		lightBuild2.shadow.camera.left = lightBuild2.shadow.camera.bottom = -lightSize;
		lightBuild2.shadow.camera.right = lightBuild2.shadow.camera.top = lightSize;

		lightBuild2.shadow.bias = 0;
		lightBuild2.shadow.mapSize.width = 1024;
		lightBuild2.shadow.mapSize.height = 1024;


		this.scene.add(lightBuild2);
		//this.scene.add(lightBuild2.target);

		const helper5 = new THREE.SpotLightHelper( lightBuild2, 400 );
		//this.scene.add(helper5);


		const lightPalco = new THREE.SpotLight( 0x7b00ff, 4);
		lightPalco.position.set( -1642, 3000, -22000);
		lightPalco.target.position.set( 291, 0, -10000);

		lightPalco.penumbra = 1;
		lightPalco.angle = 0.9;
		lightPalco.distance = 20000;
		lightPalco.decay = 0.4;

		lightPalco.castShadow = false;
		lightPalco.shadow.camera.near = 1;
		lightPalco.shadow.camera.far = 2000;
		lightPalco.shadow.camera.left = lightPalco.shadow.camera.bottom = -lightSize;
		lightPalco.shadow.camera.right = lightPalco.shadow.camera.top = lightSize;

		lightPalco.shadow.bias = 0.003;
		lightPalco.shadow.mapSize.width = 1024;
		lightPalco.shadow.mapSize.height = 1024;

		//this.lightsPalco[i] = lightPalco;
		this.scene.add(lightPalco);
		//this.scene.add(lightPalco.target);

		const helper3 = new THREE.PointLightHelper( lightPalco, 400 );
		//this.scene.add(helper3);

		const lightPalco2 = new THREE.SpotLight( 0xff6100, 4);
		lightPalco2.position.set( 2012, 3000, -22000);
		lightPalco2.target.position.set( 291, 0, -10000);

		lightPalco2.penumbra = 1;
		lightPalco2.angle = 0.9;
		lightPalco2.distance = 20000;
		lightPalco2.decay = 0.4;

		lightPalco2.castShadow = false;
		lightPalco2.shadow.camera.near = 1;
		lightPalco2.shadow.camera.far = 2000;
		lightPalco2.shadow.camera.left = lightPalco2.shadow.camera.bottom = -lightSize;
		lightPalco2.shadow.camera.right = lightPalco2.shadow.camera.top = lightSize;

		lightPalco2.shadow.bias = 0.003;
		lightPalco2.shadow.mapSize.width = 1024;
		lightPalco2.shadow.mapSize.height = 1024;

		//this.lightsPalco[i] = lightPalco;
		this.scene.add(lightPalco2);
		//this.scene.add(lightPalco2.target);

		const helper4 = new THREE.PointLightHelper( lightPalco2, 400 );
		//this.scene.add(helper4);

		this.Elettro = false;

		// model

		var manager = new THREE.LoadingManager();

		var divideLoaded = 1;
		var firstProgress = 1;
		var loadingLeft = 0;
		var loadingAtm = 0;

		manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
			if (firstProgress == 1){
				clearInterval(game.timerFirst);
				loadingLeft = 100 - game.loadProgress;
				loadingAtm = game.loadProgress
				divideLoaded = 100/loadingLeft;
				firstProgress++;
			}
			this.loadProgress =  loadingAtm + Math.floor(itemsLoaded / itemsTotal * 100 /divideLoaded);
			console.log(this.loadProgress);
			$("#loadingBarFill").css({
				"width": this.loadProgress / 1.25 + "vw"
			});
			$("#loading p").text(this.loadProgress + "%");
		};

		const loader = new GLTFLoader(manager);

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath( 'draco/' );
		loader.setDRACOLoader( dracoLoader );

		const game = this;

		this.player = new PlayerLocal(this);
		this.barman = new Npc(this, this.options, "barman", 0, 185, 0, -Math.PI/2, false, "Bartender");
    	this.groupie = new Npc(this, this.options, "Groupie", 0, -185, 20, -Math.PI/2, true, "Fan");
		this.storeOwner = new Npc(this, this.options, "StoreOwner", 0, 185, 0, -Math.PI, false, "ShopOwner");
		//this.hater = new Npc(this, this.options, "Groupie", 3700, -185, -1273, true, "Fan");
		//this.fashionNerd = new Npc(this, this.options, "Groupie", 3900, -185, -1273, true, "Fan");
		//this.dealer = new Npc(this, this.options, "Groupie", 4100, -185, -1273, true, "Fan");
		/*var x,y,z;
			x = Math.random() * 2000;
			x *= Math.round(Math.random()) ? 1 : -1;
			z = Math.random() * (19000-8000)+8000;
			let smurf = new Npc(this, this.options, "Groupie", x, -190, -z, false, "Fan");
			this.npcs.push(smurf);
			this.remoteNPCsColliders.push(smurf);

			x = Math.random() * 2000;
			x *= Math.round(Math.random()) ? 1 : -1;
			z = Math.random() * (19000-8000)+8000;
			let smurf2 = new Npc(this, this.options, "Groupie", x, -190, -z, false, "Fan");
			this.npcs.push(smurf2);
			this.remoteNPCsColliders.push(smurf2);

			x = Math.random() * 2000;
			x *= Math.round(Math.random()) ? 1 : -1;
			z = Math.random() * (19000-8000)+8000;
			let smurf3 = new Npc(this, this.options, "Groupie", x, -190, -z, false, "Fan");
			this.npcs.push(smurf3);
			this.remoteNPCsColliders.push(smurf3);
			x = Math.random() * 2000;
			x *= Math.round(Math.random()) ? 1 : -1;
			z = Math.random() * (19000-8000)+8000;
			let smurf4 = new Npc(this, this.options, "Groupie", x, -190, -z, false, "Fan");
			this.npcs.push(smurf4);
			this.remoteNPCsColliders.push(smurf4);
			x = Math.random() * 2000;
			x *= Math.round(Math.random()) ? 1 : -1;
			z = Math.random() * (19000-8000)+8000;
			let smurf5 = new Npc(this, this.options, "Groupie", x, -190, -z, false, "Fan");
			this.npcs.push(smurf5);
			this.remoteNPCsColliders.push(smurf5);
			x = Math.random() * 2000;
			x *= Math.round(Math.random()) ? 1 : -1;
			z = Math.random() * (19000-8000)+8000;
			let smurf6 = new Npc(this, this.options, "Groupie", x, -190, -z, false, "Fan");
			this.npcs.push(smurf6);
			this.remoteNPCsColliders.push(smurf6);*/
    	this.npcs.push(this.barman);
   		this.npcs.push(this.groupie);
			this.npcs.push(this.storeOwner);
		//this.npcs.push(this.hater);
    	//this.npcs.push(this.fashionNerd);
		//this.npcs.push(this.dealer);
    	this.remoteNPCsColliders.push(this.barman.collider);
    	this.remoteNPCsColliders.push(this.groupie.collider);
			this.remoteNPCsColliders.push(this.storeOwner.collider);
		//this.remoteNPCsColliders.push(this.hater.collider);
    	//this.remoteNPCsColliders.push(this.fashionNerd.collider);
		//this.remoteNPCsColliders.push(this.dealer.collider);

		/*for (let i = 0; i < 50; i++) {
			var x,y,z;
			x = Math.random() * 2000;
			x *= Math.round(Math.random()) ? 1 : -1;
			z = Math.random() * (19000-8000)+8000;
			let smurf = new Npc(this, this.options, "Groupie", x, -190, -z, -Math.PI, true, "pgfem");
			this.npcs.push(smurf);
			this.remoteNPCsColliders.push(smurf);
			//smurf.action = "Pointing";
			//if (smurf.mixer!=undefined) smurf.mixer.update(dt);
		}*/

		this.video = document.getElementById( 'video' );
		let texture = new THREE.VideoTexture( video );
		let texture2 = new THREE.VideoTexture( video );
		texture2.repeat.set(0.4, 1);
		texture2.offset.set(0.3, 0.0);

		//const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
		//pmremGenerator.compileCubemapShader() ;

		var materials = [
       new THREE.MeshBasicMaterial({color: 0x000000}),
       new THREE.MeshBasicMaterial({color: 0x000000}),
       new THREE.MeshBasicMaterial({color: 0x000000}),
       new THREE.MeshBasicMaterial({color: 0x000000}),
       new THREE.MeshBasicMaterial({color: 0xffffff, map: texture}),
       new THREE.MeshBasicMaterial({color: 0x000000})
    ];

		var materials2 = [
       new THREE.MeshBasicMaterial({color: 0x000000}),
       new THREE.MeshBasicMaterial({color: 0x000000}),
       new THREE.MeshBasicMaterial({color: 0x000000}),
       new THREE.MeshBasicMaterial({color: 0x000000}),
       new THREE.MeshBasicMaterial({color: 0xffffff, map: texture2}),
       new THREE.MeshBasicMaterial({color: 0x000000})
    ];

		const geometry = new THREE.BoxGeometry( 3500, 2600, 20);
		const geometry2 = new THREE.BoxGeometry( 1500, 2600, 20);
		const cube = new THREE.Mesh( geometry, materials );
		this.screen = cube;
		const cube2 = new THREE.Mesh( geometry2, materials2 );
		const cube3 = new THREE.Mesh( geometry2, materials2 );
		cube.position.set(0,1600,-22000);
		cube2.position.set(-2500,1800,-22000);
		cube3.position.set(2500,1800,-22000);
		cube2.rotation.y = Math.PI / 6;
		cube3.rotation.y = -Math.PI / 6;
		this.scene.add(cube, cube2, cube3);


		this.loadEnvironment(loader);

		this.joystick = new JoyStick({
			onMove: this.playerControl,
			game: this
		});

		game.emote = false;

		window.addEventListener("keydown", function(event) {
			if (event.code === 'KeyW') {
				game.forward = 1;
			}
			if (event.code === 'KeyA') {
				game.turn = -1;
			}
			if (event.code === 'KeyS') {
				game.forward = -1;
			}
			if (event.code === 'KeyD') {
				game.turn = 1;
			}
			if (event.code === 'KeyP') {
				if (game.stageCam == false ){
					game.stageCam = true;
					$('#changeView').css("background-image", "url('./assets/images/UI/view/personal_view.png')");
				}
				else{
					game.stageCam = false;
					$('#changeView').css("background-image", "url('./assets/images/UI/view/concert_view.png')");
				}
			}
			if (event.code === 'KeyL') {
				if (game.Elettro == false ){
					game.Elettro = true;
				}
				else{
					game.Elettro = false;
				}
			}
			if (event.code === 'Space') {
				game.emote = true;
				console.log("balla")
			}
			game.playerControl(game.forward,game.turn, game.emote);
		});

		window.addEventListener("keyup", function(event) {
			if (event.code === 'KeyW') {
				game.forward = 0;
			}
			if (event.code === 'KeyA') {
				game.turn = 0;
			}
			if (event.code === 'KeyS') {
				game.forward = 0;
			}
			if (event.code === 'KeyD') {
				game.turn = 0;
			}
			if (event.code === 'Space') {
				game.emote = false;
				console.log("balla ma anche basta")
			}
			game.playerControl(game.forward,game.turn, game.emote);
		});

		document.getElementById('menuButton').onclick = function(){
			const parent = document.createElement('div');
			parent.id = 'parentOverlay';
			document.querySelector('body').appendChild(parent);
			var menuButton = document.getElementById('menuButton');
			menuButton.style.display = "none";
			var menu = document.getElementById('menu');
			menu.style.display = "block";
			game.video.muted = false;
		}
		document.getElementById('closeButton').onclick = function(){
			$("#parentOverlay").remove();
			var menu = document.getElementById('menu');
			var menuButton = document.getElementById('menuButton');
			menuButton.style.display = "inline";
			menu.style.display = "none";
		}

		$(".infonavSection").click(function(event) {
			if(event.target.id == "navAvatar"){
				$("#obbiettivi, #comandi, #luoghi, #contatti, #start").css("display", "none");
				$("#avatar").css("display", "block");
			} else if(event.target.id == "navObbiettivi"){
				$("#avatar, #comandi, #luoghi, #contatti, #start").css("display", "none");
				$("#obbiettivi").css("display", "block");
			} else if(event.target.id == "navComandi"){
				$("#avatar, #obbiettivi, #luoghi, #contatti, #start").css("display", "none");
				$("#comandi").css("display", "block");
			} else if(event.target.id == "navLuoghi"){
				$("#avatar, #obbiettivi, #luoghi, #contatti, #start").css("display", "none");
				$("#luoghi").css("display", "block");
			} else if(event.target.id == "navContatti"){
				$("#avatar, #obbiettivi, #luoghi, #comandi, #start").css("display", "none");
				$("#contatti").css("display", "block");
			}
		});

		$(".infoBack").click(function(event) {
			$("#obbiettivi, #comandi, #luoghi, #contatti, #avatar").css("display", "none");
			$("#start").css("display", "block");
		});

		document.getElementById('changeView').onclick = function(){
			if (game.stageCam == false ){
				game.stageCam = true;
				$('#changeView').css("background-image", "url('./assets/images/UI/view/personal_view.png')");
			}
			else{
				game.stageCam = false;
				$('#changeView').css("background-image", "url('./assets/images/UI/view/concert_view.png')");
			}
		}

		var slider = document.getElementById("myRange");
		var output = document.getElementById("demo");
		output.innerHTML = "Media"; // Display the default slider value

		// Update the current slider value (each time you drag the slider handle)
		slider.oninput = function() {
			var quality = this.value;
			if (quality == 1) {
				game.scene.fog.far = 5000;
				output.innerHTML = "Scarsa";
				game.camera.far = 100000;
				game.camera.updateProjectionMatrix();
				$('#myRange').css("background-image", "url('./assets/images/UI/slider/1.png')");
			}
			if (quality == 2) {
				game.scene.fog.far = 10000;
				output.innerHTML = "Bassa";
				game.camera.far = 100000;
				game.camera.updateProjectionMatrix();
				$('#myRange').css("background-image", "url('./assets/images/UI/slider/2.png')");
			}
			if (quality == 3) {
				game.scene.fog.far = 15000;
				output.innerHTML = "Media";
				game.camera.far = 100000;
				game.camera.updateProjectionMatrix();
				$('#myRange').css("background-image", "url('./assets/images/UI/slider/3.png')");
			}
			if (quality == 4) {
				game.scene.fog.far = 30000;
				output.innerHTML = "Alta";
				game.camera.far = 100000;
				game.camera.updateProjectionMatrix();
				$('#myRange').css("background-image", "url('./assets/images/UI/slider/4.png')");
			}
			if (quality == 5) {
				game.scene.fog.far = 50000;
				output.innerHTML = "Ultra";
				game.camera.far = 100000;
				game.camera.updateProjectionMatrix();
				$('#myRange').css("background-image", "url('./assets/images/UI/slider/5.png')");
			}
		}

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.controls = new OrbitControls ( this.camera, this.renderer.domElement );
		this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		this.controls.dampingFactor = 0.1; // friction
		this.controls.rotateSpeed = 0.5;
		this.controls.screenSpacePanning = false;
		this.controls.maxDistance = 1000;
		this.controls.minDistance = 800;
		this.controls.enableZoom = true;
		this.controls.enablePan = false;
		this.controls.maxPolarAngle = Math.PI / 2;
		this.controls.enabled = false;

		game.mouseIsDown = false;

		this.renderer.domElement.style.zIndex = '0';

		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setClearColor( 0x000000, 0 );

		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.autoUpdate = false;
		this.renderer.shadowMap.type = THREE.BasicShadowMap;
		this.renderer.toneMapping = THREE.ReinhardToneMapping;
		this.renderer.toneMappingExposure = 2.3;
		this.renderer.domElement.style.top = 0;
		this.renderer.domElement.style.zIndex = '1';

		//this.renderer.outputEncoding = THREE.sRGBEncoding;
		document.querySelector('#webgl').appendChild( this.renderer.domElement );

		this.effect = new AnaglyphEffect( this.renderer );
		this.effect.setSize( window.innerWidth, window.innerHeight );

		if ('ontouchstart' in window){
			window.addEventListener( 'touchdown', (event) => convOpen = game.onMouseDown(event, convOpen), false );
		}else{
			window.addEventListener( 'mousedown', (event) => convOpen = game.onMouseDown(event, convOpen), false );
		}
		window.addEventListener( 'resize', () => game.onWindowResize(), false );
		/*document.addEventListener('pointerup', function(event) {
			game.mouseIsDown = false;


			console.log("COVO IS NOT A MAD SOCIETY")
		});
		document.addEventListener('pointerdown', function(event) {
			game.mouseIsDown = true;
			//game.camera.position.lerp(game.cameras.active.getWorldPosition(new THREE.Vector3()), 0.3);
			console.log("COVO DEVS ARE BORED")
		});*/
	}

	loadEnvironment(loader){
		const game = this;
		loader.load(`${this.assetsPath}fbx/town.gltf`, function(object){
			game.environment = object.scene;
			game.colliders = [];
			object.scene.scale.set(100, 100, 100);
			//object.scene.castShadow = true;
			//object.scene.receiveShadow = false;
			game.scene.add(object.scene);

			//game.scene.add(object.lights);

			object.scene.traverse( function ( child ) {
				if ( child.isMesh ) {
					//roughnessMipmapper.generateMipmaps( child.material );
					if (child.name.startsWith("proxy")){
						game.colliders.push(child);
						child.material.visible = false;
					}else{
						child.castShadow = true;
						child.receiveShadow = true;
					}
				}
			});

			/*const pmremGenerator = new THREE.PMREMGenerator( game.renderer );
			pmremGenerator.compileEquirectangularShader();

			var rgbloader = new THREE.RGBELoader();
			rgbloader.setDataType(THREE.UnsignedByteType);
			rgbloader
			.setDataType( THREE.UnsignedByteType )
			.setPath( './' )
			.load( 'hdr.pic', function ( texture ){

				console.log("i'am here!!!!!");

				var envMap = pmremGenerator.fromEquirectangular(texture).texture;

				game.scene.background = envMap;
				game.scene.environment = envMap;

				texture.dispose();
				pmremGenerator.dispose();

			});*/

			const tloader = new THREE.CubeTextureLoader();
			tloader.setPath( `${game.assetsPath}/images/` );

			var textureCube = tloader.load( [
				'px.png', 'nx.png',
				'py.png', 'ny.png',
				'pz.png', 'nz.png'
			] );

			game.scene.background = textureCube;
			game.scene.environment = textureCube;

			textureCube.dispose();
			//pmremGenerator.dispose();

			const textureLoader = new THREE.TextureLoader();

			var textureEquirec = textureLoader.load( './assets/Nebula.png' );
			textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
			textureEquirec.encoding = THREE.sRGBEncoding;
			//game.scene.background = textureEquirec;

			//this.roughnessMipmapper.dispose();

			const loaderFBX = new FBXLoader();

			console.log("MAP LOADED");

			game.loadNextAnim(loaderFBX);
		})
	}

	loadNextAnim(loader){
		let anim = this.anims.pop();
		const game = this;
		loader.load( `${this.assetsPath}fbx/anims/${anim}.fbx`, function( object ){
			game.player.animations[anim] = object.animations[0];
			console.log(game.player.animations, object.animations);
			if (game.anims.length>0){
				game.loadNextAnim(loader);
			}else{
				delete game.anims;
				game.action = "Idle";
				game.mode = game.modes.ACTIVE;
				game.animate();
			}
		});
		console.log("ANIMATION LOADED");
		game.loadProgress = 100;
		console.log(game.loadProgress);

		setInterval(function() {
			var loading = document.getElementById("loading")
			loading.style.display = "none";
			game.loaded == true;
		}, 5000);
	}

	distantAudio(objemitter, audio) {
		let vol = 0.1;
		if (this.player!==undefined && this.player.object!==undefined){
			const dist = objemitter.position.distanceTo(this.player.object.position);
			const tmpVol = 1.5 - dist/10000;
			if(tmpVol > vol) vol = tmpVol;
			if(vol<0.1) vol = 0.1;
			if(vol>1) vol = 1;
			console.log(vol);
		}
		audio.volume = vol;
	}

	playerControl(forward, turn, emote){
		game.mouseIsDown = false;
		turn = -turn;

		if (forward>0){
			if (this.player.action!='Running') {
				game.emote = false;
				if (game.Elettro){
					this.player.action = 'Naruto';
				}
				else {this.player.action = 'Running';}
				}
		}else if (forward<0){
			if (this.player.action!='Walking Backwards') {
				this.player.action = 'Walking Backwards';
				game.emote = false;}
		}else{
			forward = 0;
			if (Math.abs(turn)>0.1){
				if (this.player.action != 'Walking Backwards') {
					game.emote = false;
					this.player.action = 'Walking Backwards';}
			}
			else if (this.player.action !="Dance" && game.emote == true){
				this.player.action = 'Dance';
			} else if (Math.abs(turn)>0.1 == 0 && game.emote == false) {
				console.log("culin culetto");
				this.player.action = 'Idle';
				game.emote = false;
			}
		}

		if (forward==0 && turn==0){
			delete this.player.motion;
		}else{
			this.player.motion = { forward, turn };
		}

		this.player.updateSocket();
	}

	createCameras(){
		const offset = new THREE.Vector3(0, 80, 0);
		const front = new THREE.Object3D();
		front.position.set(112, 100, 600);
		front.parent = this.player.object;
		const back = new THREE.Object3D();
		back.position.set(0, 300, -500);
		back.parent = this.player.object;
		const chat = new THREE.Object3D();
		chat.position.set(0, 200, -450);
		chat.parent = this.player.object;
		const wide = new THREE.Object3D();
		wide.position.set(178, 139, 1665);
		wide.parent = this.player.object;
		const overhead = new THREE.Object3D();
		overhead.position.set(0, 400, 0);
		overhead.parent = this.player.object;
		const collect = new THREE.Object3D();
		collect.position.set(40, 82, 94);
		collect.parent = this.player.object;
		this.cameras = { front, back, wide, overhead, collect, chat };
		this.activeCamera = this.cameras.back;
	}

	showMessage(msg, fontSize=20, onOK=null){
		const txt = document.getElementById('message_text');
		txt.innerHTML = msg;
		txt.style.fontSize = fontSize + 'px';
		const btn = document.getElementById('message_ok');
		const panel = document.getElementById('message');
		const game = this;
		if (onOK!=null){
			btn.onclick = function(){
				panel.style.display = 'none';
				onOK.call(game);
			}
		}else{
			btn.onclick = function(){
				panel.style.display = 'none';
			}
		}
		panel.style.display = 'flex';
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.controls.update();

		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.effect.setSize( window.innerWidth, window.innerHeight );

	}

	updateRemotePlayers(dt){
		if (this.remoteData===undefined || this.remoteData.length == 0 || this.player===undefined || this.player.id===undefined) return;

		const newPlayers = [];
		const game = this;
		//Get all remotePlayers from remoteData array
		const remotePlayers = [];
		const remoteColliders = [];

		this.remoteData.forEach( function(data){
			if (game.player.id != data.id){
				//Is this player being initialised?
				let iplayer;
				game.initialisingPlayers.forEach( function(player){
					if (player.id == data.id) iplayer = player;
				});
				//If not being initialised check the remotePlayers array
				if (iplayer===undefined){
					let rplayer;
					game.remotePlayers.forEach( function(player){
						if (player.id == data.id) rplayer = player;
					});
					if (rplayer===undefined){
						//Initialise player
						game.initialisingPlayers.push( new Player( game, data ));
					}else{
						//Player exists
						remotePlayers.push(rplayer);
						remoteColliders.push(rplayer.collider);
					}
				}
			}
		});

		this.scene.children.forEach( function(object){
			if (object.userData.remotePlayer && game.getRemotePlayerById(object.userData.id)==undefined){
				game.scene.remove(object);
			}
		});

		this.remotePlayers = remotePlayers;
		this.remoteColliders = remoteColliders;
		this.remotePlayers.forEach(function(player){ player.update( dt ); });
	}

	onMouseDown(event, convOpen) {

    if (this.remoteNPCsColliders === undefined || this.remoteNPCsColliders.length == 0) return;
    if (convOpen) {
      if (convsMale[document.getElementById("dialogue").innerHTML.split(":<br>")[0]][this.convCounterDue][this.convCounter] === undefined) {
        this.convCounter = 0;
        document.getElementById("parentOverlay").style.opacity = "0";
        setTimeout(function() {
          document.getElementById("parentOverlay").remove();
        }, 1000);
				if(this.convCounterDue < convsMale[document.getElementById("dialogue").innerHTML.split(":<br>")[0]].length - 1){this.convCounterDue++;}
        return false;
      } else {
        document.getElementById("dialogue").innerHTML = convsMale[document.getElementById("dialogue").innerHTML.split(":<br>")[0]][this.convCounterDue][this.convCounter];
        this.convCounter++;
        return true;
      }
    }
	console.log("COVO ARGUED ABOUT A LOT OF THINGS")

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.remoteNPCsColliders);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      const nearbyNpcs = this.npcs.filter(function(player) {
        return true;
      });
      if (nearbyNpcs.length > 0) {
        if (object.parent.children[0].conv) {
          if (!convOpen && (object.parent.children[0].identifier != "barman" || object.parent.children[0].identifier != "StoreOwner")) {
            const parent = document.createElement('div');
            parent.id = 'parentOverlay';
            document.querySelector('body').appendChild(parent);
            const character = document.createElement('div');
            character.id = 'characterOverlay';
            character.style.backgroundImage = "url('./assets/images/NPC/" + object.parent.children[0].name + ".png')";
            const dialoguebox = document.createElement('div');
            dialoguebox.id = 'dialogueOverlay';
            const dialogue = document.createElement('p');
            dialogue.id = 'dialogue';
            parent.appendChild(character);
            parent.appendChild(dialoguebox);
            parent.appendChild(dialogue);
            parent.style.opacity = "1";
            setTimeout(function() {
              parent.style.opacity = "1";
            }, 100);
            setTimeout(function() {
              character.style.opacity = "1";
              dialoguebox.style.opacity = "1";
              dialogue.style.opacity = "1";
            }, 500);
            dialogue.innerHTML = convsMale[object.parent.children[0].name][this.convCounterDue][this.convCounter];
            this.convCounter++;
            return true;
          }
        } else if (object.parent.children[0].name == "barman") {
			var menuButton = document.getElementById('menuButton');
			menuButton.style.display = "none";
			var bar = document.getElementById('bar');
			bar.style.display = "block";
        }
		else if (object.parent.children[0].name == "StoreOwner") {
			var menuButton = document.getElementById('menuButton');
			menuButton.style.display = "none";
			var store = document.getElementById('store');
			store.style.display = "block";
        }
      }
    }
    else {
		this.activeCamera = this.cameras.back;
	}
  }

	getRemotePlayerById(id){
		if (this.remotePlayers===undefined || this.remotePlayers.length==0) return;

		const players = this.remotePlayers.filter(function(player){
			if (player.id == id) return true;
		});

		if (players.length==0) return;

		return players[0];
	}

	animate() {
		const game = this;
		const dt = this.clock.getDelta();

		//console.log(game.mouseIsDown);

		requestAnimationFrame( function(){ game.animate(); } );

		this.updateRemotePlayers(dt);

		if (this.player.mixer!=undefined && this.mode==this.modes.ACTIVE) this.player.mixer.update(dt);
		if (this.groupie.mixer!=undefined) this.groupie.mixer.update(dt);
		if (this.barman.mixer!=undefined) this.barman.mixer.update(dt);
		if (this.storeOwner.mixer!=undefined) this.storeOwner.mixer.update(dt);

		if (this.player.action=='Walking'){
			const elapsedTime = Date.now() - this.player.actionTime;
			if (elapsedTime>1000 && this.player.motion.forward>0){
				this.player.action = 'Running';
			}
		}

		var vid = document.getElementById("video");
		this.distantAudio(this.screen, vid);

		if (this.player.motion !== undefined) this.player.move(dt);



		if (game.mouseIsDown == false){
			game.firstFrameOrbiter = 0;
			if (this.cameras!=undefined && this.cameras.active!=undefined && this.player!==undefined && this.player.object!==undefined){
				this.camera.position.lerp(this.cameras.active.getWorldPosition(new THREE.Vector3()), 0.7);
				//this.controls.update();
				const pos = this.player.object.position.clone();
				if (this.cameras.active==this.cameras.chat){
					pos.y += 200;
				}else{
					pos.y += 200;

				}
				if (game.stageCam==true){
					pos.y = 1000;
					pos.x = 300;
					pos.z = -20000;
					this.camera.position.z = this.player.object.position.z + 1500;
					this.camera.position.x = this.player.object.position.x;
					this.camera.lookAt(pos);
				} else{this.camera.lookAt(pos);}
			}
		} else if (game.mouseIsDown == true && game.stageCam == false) {
			const pos = this.player.object.position.clone();
			pos.y += 200
			game.controls.target.copy(pos);
			game.controls.update();
			/*if (game.firstFrameOrbiter == 0){
				this.camera.position.lerp(this.cameras.active.getWorldPosition(new THREE.Vector3()), 0.3);
				game.firstFrameOrbiter += 1;
			}*/
		}

		//game.controls.update();

		/*if (this.sun !== undefined){
			this.sun.position.copy( this.camera.position );
			this.sun.position.y += 10;
			this.sun.position.z += 50;
		}*/
		console.log(game.player.action, game.emote);
		console.log(this.player.object.position, this.camera.position);

		if (game.Elettro == true){this.effect.render( this.scene, this.camera );}
		else {this.renderer.render( this.scene, this.camera );}
	}
}

class Player{
	constructor(game, options){
		this.local = true;
		let model, colour;

		const colours = ['pgfem'];
		colour = colours[Math.floor(Math.random()*colours.length)];

		if (options===undefined){
			const people = ['pgfem'];
			model = people[Math.floor(Math.random() * people.length)];
		}else if (typeof options =='object'){
			this.local = false;
			this.options = options;
			this.id = options.id;
			model = options.model;
			colour = options.colour;
		}else{
			model = options;
		}
		this.model = model;
		this.colour = colour;
		this.game = game;
		this.animations = this.game.animations;

		const loader = new FBXLoader();
		const player = this;

		loader.load( `${game.assetsPath}fbx/people/${model}.fbx`, function ( object ) {

			object.mixer = new THREE.AnimationMixer( object );
			player.root = object;
			player.mixer = object.mixer;

			object.name = "Person";


			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			} );


			const textureLoader = new THREE.TextureLoader();

			textureLoader.load(`${game.assetsPath}/images/${model}.png`, function(texture){
				object.traverse( function ( child ) {
					if ( child.isMesh ){
						console.log( child.geometry.attributes.uv );
						child.material.map = texture;
						child.material.transparent = true;
						child.material.alphaTest = 0.2;
					}
				});
			});

			player.object = new THREE.Object3D();
			player.object.position.set(0, -185, 0);
			player.object.rotation.set(0, -3.14, 0);
			//player.object.scale.set(0.7, 0.7, 0.7);
			player.object.scale.set(1, 1, 1);

			player.object.add(object);
			if (player.deleted===undefined) game.scene.add(player.object);

			if (player.local){
				game.createCameras();
				//game.sun.target = game.player.object;
				game.animations.Idle = object.animations[0];
				if (player.initSocket!==undefined) player.initSocket();
			}else{
				const geometry = new THREE.BoxGeometry(100,300,100);
				const material = new THREE.MeshBasicMaterial({visible:false});
				const box = new THREE.Mesh(geometry, material);
				box.name = "Collider";
				box.position.set(0, 150, 0);
				player.object.add(box);
				player.collider = box;
				player.object.userData.id = player.id;
				player.object.userData.remotePlayer = true;
				const players = game.initialisingPlayers.splice(game.initialisingPlayers.indexOf(this), 1);
				game.remotePlayers.push(players[0]);
			}

			if (game.animations.Idle!==undefined) player.action = "Idle";
		});
	}

	set action(name){
		//Make a copy of the clip if this is a remote player
		if (this.actionName == name) return;
		const clip = (this.local) ? this.animations[name] : THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(this.animations[name]));
		const action = this.mixer.clipAction( clip );
        action.time = 0;
		this.mixer.stopAllAction();
		this.actionName = name;
		this.actionTime = Date.now();
		if (name=="Dance" && game.emote == true){
			action.loop = THREE.LoopRepeat;
			game.player.action = "Dance";
		}
		action.fadeIn(0.5);
		action.reset();
		action.play();
		if (this.curAction){
		if (nofade){
			this.curAction.enabled = false;
		}else{
			this.curAction.crossFadeTo(action, 0.5);
		}
		this.curAction = action;}
	}

	get action(){
		return this.actionName;
	}

	update(dt){
		this.mixer.update(dt);
		console.log("update")
		if (this.game.remoteData.length>0){
			let found = false;
			for(let data of this.game.remoteData){
				if (data.id != this.id) continue;
				//Found the player
				this.object.position.set( data.x, data.y, data.z );
				const euler = new THREE.Euler(data.pb, data.heading, data.pb);
				this.object.quaternion.setFromEuler( euler );
				this.action = data.action;
				found = true;
			}
			if (!found) this.game.removePlayer(this);
		}
	}
}

class Npc {
  constructor(game, options, identifier, x, y, z, rot, conv, type) {
    let model, colour;

    const colours = ['Black', 'Brown', 'White'];
    colour = colours[Math.floor(Math.random() * colours.length)];

    if (options === undefined) {
      const people = ['BeachBabe', 'BusinessMan', 'Doctor', 'FireFighter', 'Housewife', 'Policeman', 'Prostitute', 'Punk', 'RiotCop', 'Roadworker', 'Robber', 'Sheriff', 'Streetman', 'Waitress'];
      model = people[Math.floor(Math.random() * people.length)];
    }
    this.model = model;
    this.colour = colour;
    this.game = game;
    this.animations = this.game.animations;

    const geometry = new THREE.BoxGeometry(100, 300, 100);
    const material = new THREE.MeshBasicMaterial({
      visible: false
    });
    const box = new THREE.Mesh(geometry, material);
    box.name = "Collider";
    box.position.set(0, 150, 0);
    this.collider = box;

    const loader = new FBXLoader();
    const npc = this;


    loader.load(`${game.assetsPath}fbx/people/${type}.fbx`, function(object) {

      object.mixer = new THREE.AnimationMixer(object);
      npc.root = object;
      npc.mixer = object.mixer;

      object.name = identifier;
      object.conv = conv;

      object.traverse(function(child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const textureLoader = new THREE.TextureLoader();

      textureLoader.load(`${game.assetsPath}images/${type}.png`, function(texture) {
        object.traverse(function(child) {
          if (child.isMesh) {
            child.material.map = texture;
			child.material.transparent = true;
			child.material.alphaTest = 0.2;
          }
        });
      });

      npc.object = new THREE.Object3D();
      npc.object.position.set(x, y, z);
	  //npc.object.position.set(0, 0, 0);
      npc.object.rotation.set(0, rot, 0);
	  npc.object.scale.set(1, 1, 1);

      npc.object.add(object);
      if (npc.deleted === undefined) game.scene.add(npc.object);

      npc.object.add(box);

	  //if (game.animations.Idle!==undefined) npc.action = "Happy";
	  npc.action = object.animations[0]
    });
  }
	set action(name){
		//Make a copy of the clip if this is a remote player
		if (this.actionName == name) return;
		const clip = this.animations[name];
		const action = this.mixer.clipAction( name );
        action.time = 0;
		this.mixer.stopAllAction();
		/*if (name == "Dance"){

		}*/
		action.startAt(0.03333);
		this.actionName = name;
		this.actionTime = Date.now();

		action.fadeIn(0.5);
		action.play();
	}
	get action(){
		return this.actionName;
	}
}

class PlayerLocal extends Player{
	constructor(game, model){
		super(game, model);

		const player = this;
		const socket = io.connect();

		socket.on('redirect', function(destination) {
			window.location.href = destination;
		});

		socket.on('setId', function(data){
			player.id = data.id;
		});
		socket.on('remoteData', function(data){
			game.remoteData = data;
		});
		socket.on('deletePlayer', function(data){
			const players = game.remotePlayers.filter(function(player){
				if (player.id == data.id){
					return player;
				}
			});
			if (players.length>0){
				let index = game.remotePlayers.indexOf(players[0]);
				if (index!=-1){
					game.remotePlayers.splice( index, 1 );
					game.scene.remove(players[0].object);
				}
            }else{
                index = game.initialisingPlayers.indexOf(data.id);
                if (index!=-1){
                    const player = game.initialisingPlayers[index];
                    player.deleted = true;
                    game.initialisingPlayers.splice(index, 1);
                }
			}
		});

		socket.on('chat message', function(data){
			document.getElementById('chat').style.bottom = '0px';
			const player = game.getRemotePlayerById(data.id);
			game.chatSocketId = player.id;
			game.activeCamera = game.cameras.chat;
		});

		$('#msg-form').submit(function(e){
			socket.emit('chat message', { id:game.chatSocketId, message:$('#m').val() });
			$('#m').val('');
			return false;
		});

		/*var ts = timesync.create({
			server: socket,
			interval: 5000
		  });*/

		let video = document.getElementById( 'video' );
			video.play();
			video.addEventListener( 'play', function () {

		} );

		var firstSync = 0;

		/*ts.on('sync', function (state) {
			console.log('sync ' + state + '' + ' ' + Math.floor(ts.now()/1000- 1623203578));
			console.log(game.video.currentTime);
			if (firstSync == 0){
				console.log(game.loadProgress + "%");
				game.timerFirst = setInterval(function(){
					if (game.loadProgress < 80){
						game.loadProgress++;
						console.log(game.loadProgress + "%");
					}
				}, 800);
				firstSync = firstSync + 1;
				video.currentTime = Math.floor(ts.now()/1000- 1623203578);
			}
		  });

		ts.on('change', function (offset) {
			console.log('changed offset: ' + offset + ' ms');
			if (offset > 20000) {
				ts.sync();
			}
		  });

		ts.send = function (socket, data, timeout) {
		//console.log('send', data);
		return new Promise(function (resolve, reject) {
			var timeoutFn = setTimeout(reject, timeout);

			socket.emit('timesync', data, function () {
			clearTimeout(timeoutFn);
			resolve();
			});
		});
		};

		socket.on('timesync', function (data) {
		//console.log('receive', data);
		ts.receive(null, data);
		});*/

		//video.currentTime = Math.floor((ts.now() - 1622686387)/1000);

		this.socket = socket;
	}

	initSocket(){
		console.log("PlayerLocal.initSocket");
		this.socket.emit('init', {
			model:this.model,
			colour: this.colour,
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z,
			h: this.object.rotation.y,
			pb: this.object.rotation.x
		});
	}

	updateSocket(){
		if (this.socket !== undefined){
			//console.log(`PlayerLocal.updateSocket - rotation(${this.object.rotation.x.toFixed(1)},${this.object.rotation.y.toFixed(1)},${this.object.rotation.z.toFixed(1)})`);
			this.socket.emit('update', {
				x: this.object.position.x,
				y: this.object.position.y,
				z: this.object.position.z,
				h: this.object.rotation.y,
				pb: this.object.rotation.x,
				action: this.action
			})
		}
	}

	move(dt){
		const pos = this.object.position.clone();
		pos.y += 60;
		let dir = new THREE.Vector3();
		this.object.getWorldDirection(dir);
		if (this.motion.forward<0) dir.negate();
		let raycaster = new THREE.Raycaster(pos, dir);
		let blocked = false;
		const colliders = this.game.colliders;

		if (colliders!==undefined){
			const intersect = raycaster.intersectObjects(colliders);
			if (intersect.length>0){
				if (intersect[0].distance<100) blocked = true;
			}
		}

		if (!blocked){
			if (this.motion.forward>0){
				const speed = (game.Elettro) ? 2000 : 800;
				this.object.translateZ(dt*speed);
			}else{
				this.object.translateZ(-dt*300);
			}
		}

		if (colliders!==undefined){
			//cast left
			dir.set(-1,0,0);
			dir.applyMatrix4(this.object.matrix);
			dir.normalize();
			raycaster = new THREE.Raycaster(pos, dir);

			let intersect = raycaster.intersectObjects(colliders);
			if (intersect.length>0){
				if (intersect[0].distance<100) this.object.translateX(100-intersect[0].distance);
			}

			//cast right
			dir.set(1,0,0);
			dir.applyMatrix4(this.object.matrix);
			dir.normalize();
			raycaster = new THREE.Raycaster(pos, dir);

			intersect = raycaster.intersectObjects(colliders);
			if (intersect.length>0){
				if (intersect[0].distance<100) this.object.translateX(intersect[0].distance-100);
			}

			//cast down
			dir.set(0,-1,0);
			pos.y += 200;
			raycaster = new THREE.Raycaster(pos, dir);
			const gravity = 30;

			intersect = raycaster.intersectObjects(colliders);
			if (intersect.length>0){
				const targetY = pos.y - intersect[0].distance;
				if (targetY > this.object.position.y){
					//Going up
					this.object.position.y = 0.8 * this.object.position.y + 0.2 * targetY;
					this.velocityY = 0;
				}else if (targetY < this.object.position.y){
					//Falling
					if (this.velocityY==undefined) this.velocityY = 0;
					this.velocityY += dt * gravity;
					this.object.position.y -= this.velocityY;
					if (this.object.position.y < targetY){
						this.velocityY = 0;
						this.object.position.y = targetY;
					}
				}
			}
		}

		this.object.rotateY(this.motion.turn*dt);

		this.updateSocket();
	}
}
