var fu = require("./libs/fu");
var HOST = process.env.IP;
var PORT = process.env.PORT;

fu.listen(Number(process.env.PORT || PORT), HOST);

// FILES
fu.get("/", fu.staticHandler("index.html"));
fu.get("/Game.js", fu.staticHandler("Game.js"));

// LIBS
fu.get("/libs/three.min.js", fu.staticHandler("libs/three.min.js"));
fu.get("/libs/THREEx.KeyboardState.js", fu.staticHandler("libs/THREEx.KeyboardState.js"));
fu.get("/libs/postprocessing/EffectComposer.js", fu.staticHandler("libs/postprocessing/EffectComposer.js"));
fu.get("/libs/postprocessing/ShaderPass.js", fu.staticHandler("libs/postprocessing/ShaderPass.js"));
fu.get("/libs/postprocessing/MaskPass.js", fu.staticHandler("libs/postprocessing/MaskPass.js"));
fu.get("/libs/postprocessing/RenderPass.js", fu.staticHandler("libs/postprocessing/RenderPass.js"));
fu.get("/libs/postprocessing/BloomPass.js", fu.staticHandler("libs/postprocessing/BloomPass.js"));
fu.get("/libs/postprocessing/FilmPass.js", fu.staticHandler("libs/postprocessing/FilmPass.js"));
fu.get("/libs/shaders/ConvolutionShader.js", fu.staticHandler("libs/shaders/ConvolutionShader.js"));
fu.get("/libs/shaders/CopyShader.js", fu.staticHandler("libs/shaders/CopyShader.js"));
fu.get("/libs/shaders/FilmShader.js", fu.staticHandler("libs/shaders/FilmShader.js"));
fu.get("/libs/ImprovedNoise.js", fu.staticHandler("libs/ImprovedNoise.js"));
fu.get("/libs/Visualiser.js", fu.staticHandler("libs/Visualiser.js"));
fu.get("/libs/buffer-loader.js", fu.staticHandler("libs/buffer-loader.js"));
fu.get("/libs/stats.min.js", fu.staticHandler("libs/stats.min.js"));
fu.get("/libs/Detector.js", fu.staticHandler("libs/Detector.js"));

// MESHES
fu.get("/meshes/spaceship.js", fu.staticHandler("meshes/spaceship.js"));

// SOUNDS
fu.get("/sounds/DarkNappe1.mp3", fu.staticHandler("sounds/DarkNappe1.mp3"));
fu.get("/sounds/DarkNappe2.mp3", fu.staticHandler("sounds/DarkNappe2.mp3"));
fu.get("/sounds/DarkNappe3.mp3", fu.staticHandler("sounds/DarkNappe3.mp3"));
fu.get("/sounds/DarkNappe4.mp3", fu.staticHandler("sounds/DarkNappe4.mp3"));
fu.get("/sounds/balls/bouli1.mp3", fu.staticHandler("sounds/balls/bouli1.mp3"));
fu.get("/sounds/balls/bouli2.mp3", fu.staticHandler("sounds/balls/bouli2.mp3"));
fu.get("/sounds/balls/bouli3.mp3", fu.staticHandler("sounds/balls/bouli3.mp3"));
fu.get("/sounds/balls/bouli4.mp3", fu.staticHandler("sounds/balls/bouli4.mp3"));
fu.get("/sounds/balls/bouli5.mp3", fu.staticHandler("sounds/balls/bouli5.mp3"));
fu.get("/sounds/Kick.mp3", fu.staticHandler("sounds/Kick.mp3"));

// SKYBOX
/*fu.get("/images/skybox_stars/stars_left2.png", fu.staticHandler("images/skybox_stars/stars_left2.png"));
fu.get("/images/skybox_stars/stars_right1.png", fu.staticHandler("images/skybox_stars/stars_right1.png"));
fu.get("/images/skybox_stars/stars_top3.png", fu.staticHandler("images/skybox_stars/stars_top3.png"));
fu.get("/images/skybox_stars/stars_bottom4.png", fu.staticHandler("images/skybox_stars/stars_bottom4.png"));
fu.get("/images/skybox_stars/stars_front5.png", fu.staticHandler("images/skybox_stars/stars_front5.png"));
fu.get("/images/skybox_stars/stars_back6.png", fu.staticHandler("images/skybox_stars/stars_back6.png"));*/

// TEXTURES
fu.get("/textures/cloud.png", fu.staticHandler("textures/cloud.png"));
fu.get("/textures/lavatext.jpg", fu.staticHandler("textures/lavatext.jpg"));


// the No Winners
// Useless relaxing games
// > play without fear to loose, to let imagination goes away, but play.
// As the children, they play, but never loose.
// ex: free driving in gta > so cool experience