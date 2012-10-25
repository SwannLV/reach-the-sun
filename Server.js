var fu = require("./fu");
var HOST = process.env.IP;
var PORT = process.env.PORT;

fu.listen(Number(process.env.PORT || PORT), HOST);

fu.get("/", fu.staticHandler("Index.html"));
fu.get("/THREEx.KeyboardState.js", fu.staticHandler("THREEx.KeyboardState.js"));
fu.get("/requestAnimationFrame.js", fu.staticHandler("requestAnimationFrame.js"));
fu.get("/spaceship.js", fu.staticHandler("spaceship.js"));
fu.get("/Physi.js", fu.staticHandler("Physi.js"));
fu.get("/physijs_worker.js", fu.staticHandler("physijs_worker.js"));
fu.get("/ammo.js", fu.staticHandler("ammo.js"));
fu.get("/webaudio.js", fu.staticHandler("webaudio.js"));
//fu.get("/sounds/T7.mp3", fu.staticHandler("sounds/T7.mp3"));
fu.get("/textures/cloud.png", fu.staticHandler("textures/cloud.png"));
fu.get("/textures/lavatext.jpg", fu.staticHandler("textures/lavatext.jpg"));
fu.get("/Game.js", fu.staticHandler("Game.js"));

// the No Winners
// Useless relaxing games
// > play without fear to loose, to let imagination goes away, but play.
// As the children, they play, but never loose.
// ex: free driving in gta > so cool experience