let palos = ["viu", "cua", "hex", "cir"];
let colores = {
    gris: ['cir', 'hex'],
    naranja: ['viu', 'cua']
}
let numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
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
let botonReset = document.getElementById("reset");

let contTiempo = document.getElementById("contador_tiempo"); // span cuenta tiempo
let segundos = 0;    // cuenta de segundos
let temporizador = null; // manejador del temporizador


// Funcion que devuelve el objeto tapete pasandole solo su id
function getTapeteObject(idTapete) {
    return tapetesMazos.find((tapete) => tapete.id === idTapete);
}

function comenzarJuego() {
    // Inicio del juego
    botonReset.disabled = true;
    ponerACeroTapetes();
    setContador(contMovimientos, 0);

    // Objetos img y propiedades de tapetes
    cargarBaraja();
    configurarTapetes();

    // Barajar y dejar mazoInicial en tapete inicial
    const tapeteInicial = getTapeteObject('inicial');
    tapeteInicial.mazo = barajar(tapeteInicial.mazo);
    cargarTapeteInicial();

    // Arrancar el conteo de tiempo
    arrancarTiempo();
}

// Para todos los tapetes, poner el contador a cero y vaciar el mazo
function ponerACeroTapetes() {
    tapetesMazos.forEach((element) => {
        vaciarTapete(element);
    })
}

// Funcion que instancia todos los elementos img y los deja en el mazo inicial
function cargarBaraja() {
    for (let iteradorPalo = 0; iteradorPalo < palos.length; iteradorPalo++) {
        for (let iteradorNumero = 0; iteradorNumero < numeros.length; iteradorNumero++) {
            const temporalImage = crearCarta(numeros[iteradorNumero], palos[iteradorPalo]);
            getTapeteObject('inicial').mazo.push(temporalImage);
        }
    }
}

// Encargada de crear el objeto img y de setear sus propiedades
function crearCarta(numero, palo) {
    const temporalImage = document.createElement("img");
    temporalImage.src = "./imagenes/baraja/" + numero + "-" + palo + ".png";
    temporalImage.width = 75;
    temporalImage.height = 100;
    temporalImage.id = palo + numero;
    temporalImage.setAttribute("data-palo", palo);
    temporalImage.setAttribute("data-numero", numero);
    temporalImage.setAttribute("data-tapete", "inicial");
    return temporalImage;
}

// Encargada de configurar las propiedades y comportamientos de los tapetes
function configurarTapetes() {
    const tapetesDraggeables = tapetesMazos.filter((tapete) => {
        const draggeable = ["receptor1", "receptor2", "receptor3", "receptor4"]
        return draggeable.includes(tapete.id)
    })

    for (const objetoTapete of tapetesDraggeables) {
        objetoTapete.tapete.ondragenter = function (e) {
            e.preventDefault();
        };
        objetoTapete.tapete.ondragover = function (e) {
            e.preventDefault();
        };
        objetoTapete.tapete.ondragleave = function (e) {
            e.preventDefault();
        };
        objetoTapete.tapete.ondrop = getFuncionSoltarReceptores(objetoTapete);
    }

    const tapeteSobrantes = getTapeteObject('sobrantes');
    tapeteSobrantes.tapete.ondragenter = function (e) {
        e.preventDefault();
    };
    tapeteSobrantes.tapete.ondragover = function (e) {
        e.preventDefault();
    };
    tapeteSobrantes.tapete.ondragleave = function (e) {
        e.preventDefault();
    };
    tapeteSobrantes.tapete.ondrop = getFuncionSoltarSobrantes(tapeteSobrantes);
}

// Funcion drop tapetes receptores
function getFuncionSoltarReceptores(objetoTapete) {
    return function (event) {
        event.preventDefault();
        let tapeteOrigen = getTapeteObject(event.dataTransfer.getData("text/plain/tapete"));
        if (tapeteOrigen.id === 'inicial' || tapeteOrigen.id === 'sobrantes') {
            let carta = document.getElementById(event.dataTransfer.getData("text/plain/id"));
            if (movimientoValido(carta, objetoTapete)) {
                moverCartaTapete(carta, tapeteOrigen, objetoTapete);
                carta.draggable = false;
            }
        } else {
            console.log("No se pueden mover cartas de los tapetes receptores")
        }
    };
}

// Funcion drop tapete sobrantes
function getFuncionSoltarSobrantes(tapeteSobrantes) {
    return function (event) {
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

// Rutina para mover una carta de un tapete a otro
function moverCartaTapete(carta, origen, destino) {
    origen.tapete.removeChild(carta);
    decContador(origen.contador);
    origen.mazo.pop();

    carta.style.top = "50%";
    carta.style.left = "50%";
    carta.style.transform = "translate(-50%, -50%)";
    carta.dataset["tapete"] = destino.id;

    destino.tapete.appendChild(carta);
    incContador(destino.contador);
    destino.mazo.push(carta);

    incContador(contMovimientos);
    const tapeteInicial = getTapeteObject('inicial');
    if (origen.id === 'inicial') {
        if (tapeteInicial.mazo.length === 0) {
            moverCartasSobranteAInicial();
        } else {
            tapeteInicial.mazo[tapeteInicial.mazo.length - 1].draggable = true;
        }
    }
}

// Cuando el tapete inicial se queda a cero, se trasladan las cartas de sobrantes a el
function moverCartasSobranteAInicial() {
    let sobrantes = getTapeteObject('sobrantes');
    let inicial = getTapeteObject('inicial');

    if (sobrantes.mazo.length === 0) {
        finDelJuego();
    } else {
        inicial.mazo = barajar(sobrantes.mazo);
        inicial.mazo.forEach((element) => {
            element.style.top = "0";
            element.style.left = "0";
            element.style.transform = "";
        })
        vaciarTapete(sobrantes);
        cargarTapeteInicial();
        console.log(tapetesMazos);
    }
}

// Validador de movimientos de cartas
function movimientoValido(carta, tapeteDestino) {
    if (tapeteDestino.mazo.length === 0) {
        return carta.dataset['numero'] === "12";
    } else {
        // Comprobar con los datos de la carta destino si es compatible en color y en numero
        let cartaDestino = tapeteDestino.mazo[tapeteDestino.mazo.length - 1]
        let numeroCartaDestino = cartaDestino.dataset["numero"];
        let numeroCarta = carta.dataset["numero"]
        let paloCartaDestino = cartaDestino.dataset["palo"]
        let paloCarta = carta.dataset["palo"]
        if (sonPalosCompatibles(paloCartaDestino, paloCarta)) {
            if (parseInt(numeroCarta) === (parseInt(numeroCartaDestino) - 1)) {
                return true;
            }
        }
        return false;
    }
}

// Comprueba si los palos son compatibles para que una carta se ponga sobre otra
function sonPalosCompatibles(palo1, palo2) {
    if (colores.gris.includes(palo1)) {
        return colores.naranja.includes(palo2);
    } else if (colores.naranja.includes(palo1)) {
        return colores.gris.includes(palo2);
    }
    return false;
}

// Inicia el contador a cero
function arrancarTiempo() {
    if (temporizador) clearInterval(temporizador);
    let hms = function () {
        let seg = Math.trunc(segundos % 60);
        let min = Math.trunc((segundos % 3600) / 60);
        let hor = Math.trunc((segundos % 86400) / 3600);
        let tiempo = ((hor < 10) ? "0" + hor : "" + hor)
            + ":" + ((min < 10) ? "0" + min : "" + min)
            + ":" + ((seg < 10) ? "0" + seg : "" + seg);
        setContador(contTiempo, tiempo);
        segundos++;
    }
    segundos = 0;
    hms(); // Primera visualización 00:00:00
    temporizador = setInterval(hms, 1000);
} // arrancarTiempo

// Mueve aleatoriamente las posiciones de las cartas del mazo inicial
function barajar(mazo) {
    for(var carta = mazo.length-1; carta > 0; carta--){
        var cartaCambio = Math.floor( Math.random() * (carta + 1) ); //random cartandex
        [mazo[carta], mazo[cartaCambio]] = [mazo[cartaCambio], mazo[carta]]; // swap
    }
    // const mazoBarajado = mazo.sort(() => Math.random() - 0.5);
    setContador(getTapeteObject('inicial').contador, mazo.length);
    return mazo;
}

// Encargada de meter en el tapete incial las cartas, con un efecto lento usando timeouts
function cargarTapeteInicial() {
    const inicial = getTapeteObject('inicial');
    for (let carta = 0; carta < inicial.mazo.length; carta++) {
        inicial.mazo[carta].dataset["tapete"] = "inicial";
        // Le damos un timeout para dar el efecto de que se van colocando poco a poco y no de golpe
        setTimeout(cargarCarta, 50 * carta, inicial.mazo[carta], carta, inicial.mazo.length);
    }
}

// Configura la carta que se carga en el tapete con su funcionalidad drag y sus datos de evento
function cargarCarta(carta, indice, total) {
    carta.style.position = "absolute";
    carta.style.top = "" + (5 * indice) + "px";
    carta.style.left = "" + (5 * indice) + "px";
    carta.draggable = false;
    let dragged = undefined;
    carta.addEventListener("dragstart", (event) => {
        // store a ref. on the dragged elem
        dragged = event.target;
        console.log('Carta atrapada: ' + event.target.dataset["palo"] + " / " + event.target.dataset["numero"]);
        event.dataTransfer.setData("text/plain/numero", event.target.dataset["numero"]);
        event.dataTransfer.setData("text/plain/palo", event.target.dataset["palo"]);
        event.dataTransfer.setData("text/plain/tapete", event.target.dataset["tapete"]);
        event.dataTransfer.setData("text/plain/id", event.target.id);
    });
    carta.addEventListener("drag", () => {
    });
    carta.addEventListener("dragend", () => {
    });
    getTapeteObject('inicial').tapete.appendChild(carta);
    if (indice === total - 1) {
        // Habilitamos el boton de reseteo por si se quiere reiniciar la partida
        // Se pone la ultima carta del monton con el atributo draggable a true, para que se pueda arrastrar
        botonReset.disabled = false;
        carta.draggable = true;
    }
}

// Elimina todos los hijos del componente tapete (que no sean contadores)
function vaciarTapete(tapeteObjeto) {
    while (tapeteObjeto.tapete.firstChild && !tapeteObjeto.tapete.lastChild.id.includes('contador')) {
        tapeteObjeto.tapete.removeChild(tapeteObjeto.tapete.lastChild);
    }
    tapeteObjeto.mazo = [];
    setContador(tapeteObjeto.contador, 0);
}

// Incrementa en uno el contador
function incContador(contador) {
    contador.innerHTML = parseInt(contador.innerHTML) + 1;
    return contador;
}

function decContador(contador) {
    contador.innerHTML = parseInt(contador.innerHTML) - 1
    return contador;
}

// Setea un valor personalizado en un contador
function setContador(contador, valor) {
    contador.innerHTML = valor;
}

// Funcion que ejecuta el final del juego
function finDelJuego() {
    if (temporizador) clearInterval(temporizador);
    alert("Enhorabuena!!\n Has finalizado el juego con un total de " + contMovimientos.innerHTML + " movimientos,\n en un" +
        "tiempo de " + contTiempo.innerHTML);
}

body = document.body;
body.addEventListener('onload', arrancarTiempo());
body.addEventListener('onload', comenzarJuego());

botonReset.addEventListener('click', _ => {
    location.reload();
})