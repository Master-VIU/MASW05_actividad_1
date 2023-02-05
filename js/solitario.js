let palos = ["viu", "cua", "hex", "cir"];
let colores = {
	gris: ['cir', 'hex'],
	naranja: ['viu', 'cua']
}
let numeros = [9, 10, 11, 12];
let paso = 5;

const tapetesMazos = [
	{
		id: "inicial",
		tapete: document.getElementById("inicial"),
		mazo: [],
		contador: document.getElementById("contador_inicial")
	},
	{
		id: "sobrantes",
		tapete: document.getElementById("sobrantes"),
		mazo: [],
		contador: document.getElementById("contador_sobrantes")
	},
	{
		id: "receptor1",
		tapete: document.getElementById("receptor1"),
		mazo: [],
		contador: document.getElementById("contador_receptor1")
	},
	{
		id: "receptor2",
		tapete: document.getElementById("receptor2"),
		mazo: [],
		contador: document.getElementById("contador_receptor2")
	},
	{
		id: "receptor3",
		tapete: document.getElementById("receptor3"),
		mazo: [],
		contador: document.getElementById("contador_receptor3")
	},
	{
		id: "receptor4",
		tapete: document.getElementById("receptor4"),
		mazo: [],
		contador: document.getElementById("contador_receptor4")
	}
]

let contMovimientos = document.getElementById("contador_movimientos");
let botonReset		= document.getElementById("reset");

let contTiempo  = document.getElementById("contador_tiempo"); // span cuenta tiempo
let segundos 	 = 0;    // cuenta de segundos
let temporizador = null; // manejador del temporizador


function comenzarJuego() {

	botonReset.disabled = true;
	
	for (let iteradorPalo = 0; iteradorPalo < palos.length; iteradorPalo++) {
		for (let iteradorNumero = 0; iteradorNumero < numeros.length; iteradorNumero++) {
			let temporalImage = document.createElement("img");
			temporalImage.src = "./imagenes/baraja/" + numeros[iteradorNumero] + "-" + palos[iteradorPalo] + ".png";
			temporalImage.width = 75;
			temporalImage.height = 100;
			temporalImage.id = palos[iteradorPalo] + numeros[iteradorNumero];
			temporalImage.setAttribute("data-palo", palos[iteradorPalo]);
			temporalImage.setAttribute("data-numero", numeros[iteradorNumero]);
			temporalImage.setAttribute("data-tapete", "inicial");
			getTapeteObject('inicial').mazo.push(temporalImage);
		}
	}

	getTapeteObject("inicial").contador.innerHTML = "0";
	getTapeteObject("receptor1").contador.innerHTML = "0";
	getTapeteObject("receptor2").contador.innerHTML = "0";
	getTapeteObject("receptor3").contador.innerHTML = "0";
	getTapeteObject("receptor4").contador.innerHTML = "0";
	getTapeteObject("sobrantes").contador.innerHTML = "0";
	contMovimientos.innerHTML = "0";

	configurarTapetes();

	// Barajar y dejar mazoInicial en tapete inicial
	const tapeteInicial = getTapeteObject('inicial');
	tapeteInicial.mazo = barajar(tapeteInicial.mazo);
	vaciarTapete(tapeteInicial.tapete);
	cargarTapeteInicial(tapeteInicial.mazo);		
	// Arrancar el conteo de tiempo
	arrancarTiempo();
} // comenzarJuego

function configurarTapetes() {

	const tapetesDraggeables = tapetesMazos.filter((tapete) => {
		const draggeable = ["receptor1", "receptor2", "receptor3", "receptor4"]
		return draggeable.includes(tapete.id)
	})

	for (const objetoTapete of tapetesDraggeables) {
		objetoTapete.tapete.ondragenter = function(e) { e.preventDefault(); };
		objetoTapete.tapete.ondragover = function(e) { e.preventDefault(); };
		objetoTapete.tapete.ondragleave = function(e) { e.preventDefault(); };
		objetoTapete.tapete.ondrop = function(event) {
			event.preventDefault();
			let tapeteOrigen = getTapeteObject(event.dataTransfer.getData("text/plain/tapete"));		
			if (tapeteOrigen.id === 'inicial' || tapeteOrigen.id === 'sobrantes') {
				let carta = document.getElementById(event.dataTransfer.getData("text/plain/id"));
				if ( movimientoValido(carta, objetoTapete) ) {
					moverCartaTapete(carta, tapeteOrigen, objetoTapete)
					carta.draggable = false;
				}
			} else {
				console.log("No se pueden mover cartas de los tapetes receptores")
			}
		};
	}

	const tapeteSobrantes = getTapeteObject('sobrantes');
	tapeteSobrantes.tapete.ondragenter = function(e) { e.preventDefault(); };
	tapeteSobrantes.tapete.ondragover = function(e) { e.preventDefault(); };
	tapeteSobrantes.tapete.ondragleave = function(e) { e.preventDefault(); };
	tapeteSobrantes.tapete.ondrop = function(event) {
		event.preventDefault();
		let tapeteOrigen = getTapeteObject(event.dataTransfer.getData("text/plain/tapete"));
		if (tapeteOrigen.id === 'inicial') {
			let carta = document.getElementById(event.dataTransfer.getData("text/plain/id"));
			moverCartaTapete(carta, tapeteOrigen, tapeteSobrantes)
		} else {
			console.log("No se pueden mover cartas de los tapetes receptores")
		}
	}
}

function moverCartaTapete(carta, origen, destino) {
	origen.tapete.removeChild(carta);
	decContador(origen.contador);
	origen.mazo.pop();
	const tapeteInicial = getTapeteObject('inicial');
	if(tapeteInicial.mazo.length == "0"){
		recargarTapeteInicial(getTapeteObject('sobrantes'));
	} else {
	origen.mazo[origen.mazo.length - 1].draggable = true;
	carta.style.top = "50%";
	carta.style.left = "50%";
	carta.style.transform="translate(-50%, -50%)";
	destino.tapete.appendChild(carta);
	incContador(destino.contador);
	destino.mazo.push(carta);
	incContador(contMovimientos);
	}
}

function movimientoValido(carta, tapeteDestino) {
	if (tapeteDestino.mazo.length === 0) {
		return carta.dataset['numero'] == "12";
	} else {
		let cartaDestino = tapeteDestino.mazo[tapeteDestino.length-1];
		let cartaMover = carta.dataset['numero'];
		if(cartaMover == "11"){
			return carta.dataset['numero'] == "11";
		}if(cartaMover == "10"){
			return carta.dataset['numero'] == "10";
		}if(cartaMover == "9"){
			return carta.dataset['numero'] == "9";
		}if(cartaMover == "8"){
			return carta.dataset['numero'] == "8";
		}
		
		// Comprobar con los datos de la carta destino si es compatible en color y en numero
	}
}

function getTapeteObject(idTapete) {
	return tapetesMazos.find((tapete) => tapete.id === idTapete);
}

/**
	Se debe encargar de arrancar el temporizador: cada 1000 ms se
	debe ejecutar una función que a partir de la cuenta autoincrementada
	de los segundos (segundos totales) visualice el tiempo oportunamente con el 
	format hh:mm:ss en el contador adecuado.

	Para descomponer los segundos en horas, minutos y segundos pueden emplearse
	las siguientes igualdades:

	segundos = truncar (   segundos_totales % (60)                 )
	minutos  = truncar ( ( segundos_totales % (60*60) )     / 60   )
	horas    = truncar ( ( segundos_totales % (60*60*24)) ) / 3600 )

	donde % denota la operación módulo (resto de la división entre los operadores)

	Así, por ejemplo, si la cuenta de segundos totales es de 134 s, entonces será:
	   00:02:14

	Como existe la posibilidad de "resetear" el juego en cualquier momento, hay que 
	evitar que exista más de un temporizador simultáneo, por lo que debería guardarse
	el resultado de la llamada a setInterval en alguna variable para llamar oportunamente
	a clearInterval en su caso.   
*/

function arrancarTiempo(){
	if (temporizador) clearInterval(temporizador);
    let hms = function (){
			let seg = Math.trunc( segundos % 60 );
			let min = Math.trunc( (segundos % 3600) / 60 );
			let hor = Math.trunc( (segundos % 86400) / 3600 );
			let tiempo = ( (hor<10)? "0"+hor : ""+hor ) 
						+ ":" + ( (min<10)? "0"+min : ""+min )  
						+ ":" + ( (seg<10)? "0"+seg : ""+seg );
			setContador(contTiempo, tiempo);
            segundos++;
		}
		
	segundos = 0;
    hms(); // Primera visualización 00:00:00
	temporizador = setInterval(hms, 1000);
} // arrancarTiempo


/**
	Si mazo es un array de elementos <img>, en esta rutina debe ser
	reordenado aleatoriamente. Al ser un array un objeto, se pasa
	por referencia, de modo que si se altera el orden de dicho array
	dentro de la rutina, esto aparecerá reflejado fuera de la misma.
*/
function barajar(mazo) {
	const mazoBarajado = mazo.sort(() => Math.random()-0.5);
	getTapeteObject('inicial').contador.innerHTML = mazoBarajado.length + "";
	return mazo;	
}

function cargarTapeteInicial(mazo) {
	for (let carta = 0; carta < mazo.length; carta++) {
		// Le damos un timeout para dar el efecto de que se van colocando poco a poco y no de golpe
		setTimeout(cargarCarta, 50*carta, mazo[carta], carta, mazo.length);
	}
}

function recargarTapeteInicial(tapeteSobrantes){
	const tapeteInicial = getTapeteObject('inicial');	
		cargarTapeteInicial(tapeteSobrantes.mazo);		
		tapeteInicial.mazo = barajar(tapeteSobrantes.mazo);
		getTapeteObject("sobrantes").contador.innerHTML = "0";
		return tapeteInicial.mazo;
}

function cargarCarta(carta, indice, total) {
	carta.style.position = "absolute";
	carta.style.top = ""+(5 * indice)+"px";
	carta.style.left = ""+(5 * indice)+"px";
	carta.draggable = false;

	let dragged = undefined;
	carta.addEventListener("dragstart", (event) => {
		// store a ref. on the dragged elem
		dragged = event.target;
		console.log('Carta atrapada: ' + event.target.dataset["palo"] + " / " + event.target.dataset["numero"]);
		event.dataTransfer.setData( "text/plain/numero", event.target.dataset["numero"] );
		event.dataTransfer.setData( "text/plain/palo", event.target.dataset["palo"] );
		event.dataTransfer.setData( "text/plain/tapete", "inicial");
		event.dataTransfer.setData( "text/plain/id", event.target.id );
	});
	carta.addEventListener("drag", () => {});
	carta.addEventListener("dragend", () => {});
	getTapeteObject('inicial').tapete.appendChild(carta);
	if (indice === total - 1) {
		// Habilitamos el boton de reseteo por si se quiere reiniciar la partida
		// Se pone la ultima carta del monton con el atributo draggable a true, para que se pueda arrastrar
		botonReset.disabled = false;
		carta.draggable = true;
	}
}

function vaciarTapete(tapete) {
	while(tapete.firstChild && !tapete.lastChild.id.includes('contador')) {
		tapete.removeChild(tapete.lastChild);
	}
}


function incContador(contador){
	contador.innerHTML = parseInt(contador.innerHTML) + 1;
	return contador;
}

function decContador(contador){
	contador.innerHTML = "" + parseInt(contador.innerHTML) - 1
	return contador;
}

function setContador(contador, valor) {
	contTiempo.innerHTML = "" + valor;

} // setContador

body = document.body;
body.addEventListener('onload', arrancarTiempo());
body.addEventListener('onload', comenzarJuego());

botonReset.addEventListener('click', _ =>{
	location.reload();
});

