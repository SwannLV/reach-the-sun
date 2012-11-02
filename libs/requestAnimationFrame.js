//*****************************************fonction qui gère requestAnimationFrame (différence entre navigateurs) ***************
// requestAnimationFrame est une nouvelle fonction qui permet de gérer la boucle principale plus efficacement 
//(au niveau des FPS)(remplace setTimeout)
//Pour plus d'info sur le sujet https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame
//gestion des différents navigateurs :
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback, element){
	//si le navigateur ne gère pas requestAnimationFrame, on revient à un setTimeout classique (avec FPS=60)
	window.setTimeout(callback, 1000/60);
	};
})();