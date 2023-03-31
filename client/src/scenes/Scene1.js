import { Scene } from "phaser";
import { objectInit } from "@/utils/ObjectsInit/ObjectsInit";
import { GridEngineCreate } from "./GridEngineConfig";
import { fpsDisplay } from "../utils/FpsDisplay/FpsDisplay";
import { socketHandler } from "../services/SocketEvents/SocketEvents";
import { initKeyboardControls } from "../utils/InitKeyboardControls/InitKeyboardControls";
import { GameInfos } from "@/constants/GameInfos/GameInfos";
var onlinePlayers = [];

export default class Scene1 extends Scene {
  constructor() {
    super("Scene1");
  }

  init(data) {
    if (this.data) {
      this.socket = data.socket;
      // Map data
      this.mapName = data.user.onMap;
      // Player Texture starter position
      this.localPlayer = data.user;
      this.changedSceneData = data.changedSceneData;
      this.playerTexturePosition = data.user.position.ld;
      // Set container
      this.container = [];

      if (this.localPlayer) {
        this.socket.emit("PLAYER_JOIN", this.localPlayer);
        this.socket.emit("localPlayer", {
          id: this.localPlayer._id,
          nickName:
            this.localPlayer.nickName.charAt(0).toUpperCase() +
            this.localPlayer.nickName.slice(1),
          role: this.localPlayer.role,
        });
      }
    }
  }

  create() {
    if (this.socket && this.localPlayer) {
      this.gameHasFocused = true;
      // CREATE MAP AND PLAYER
      this.createMapAndPlayer();

      // CREATE DIALOGUE BOX ON UI

      fpsDisplay(this);
    }
  }

  createMapAndPlayer() {
    let self = this;
    this.walk = this.sound.add("walk", { loop: false, volume: 0.05, rate: 1 });

    /**
     * This socketHandler function handles the socket events related to player interaction on the map.
     * It creates, updates or removes the corresponding player objects on the scene based on the received data.
     * @param {Object} thisCopy - A copy of the current `this` object.
     * @param {Object} self - The `this` object.
     * @param {Object} onlinePlayers - An object that contains all the online player objects currently on the scene.
     */
    socketHandler(this, self, onlinePlayers);

    this.map = this.make.tilemap({ key: this.mapName });
    this.sound.add(`${this.mapName}-Audio`, { loop: true, volume: 0.2 }).play();

    this.map.addTilesetImage("pokemmo-sample-16px-extruded", "tiles");

    for (let i = 0; i < this.map.layers.length; i++) {
      const layer = this.map.createLayer(
        i,
        "pokemmo-sample-16px-extruded",
        0,
        0
      );
      layer.scale = GameInfos.gameScale;
    }

    this.spawnPoint = this.map.findObject(
      "SpawnPoints",
      (obj) => obj.name === "Spawn Point"
    );

    this.newZone = this.map.findObject("Zone", (obj) => {
      return obj;
    });

    this.gridEngineClass = new GridEngineCreate(this);
    this.gridEngineClass.setPlayer();

    objectInit(this, this.map.objects);
    this.isCrossActivated = this.gridEngineClass.getCantCrossRun();
    this.cameras.main.fadeIn(1000);

    console.log(this.map);
    // this.map.findObject("Weather", (obj) => {
    //   startWeather(this, this.map, obj.name);
    // });

    // this.map.findObject("Effects", (obj) => {
    //   startEffects(this, obj);
    // });
  }

  // addNpc(self) {
  //   this.map.findObject("Npc", (obj) => {
  //     console.log("Name", obj.name);
  //     console.log("Direction", obj.properties[0].value);
  //     console.log("Position", obj.properties[1].value);
  //     const direction = obj.properties[0].value;
  //     const [x, y] = obj.properties[1].value.split("|");
  //     self.gridEngineClass.addNpc({
  //       id: obj.name,
  //       x: parseInt(x),
  //       y: parseInt(y),
  //       speed: 0,
  //       walkingAnimationMapping: obj.properties[2].value,
  //       collides: true,
  //     });
  //     self.gridEngineClass.setTurnTowards(obj.name, direction);
  //   });
  // }

  update() {
    this.gridEngineClass.playerUpdate();
    initKeyboardControls(this);
  }
}
