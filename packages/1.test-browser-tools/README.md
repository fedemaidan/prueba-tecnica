# Questions Frontend - Ejercicio #1

El objetivo de este ejercicio es que te familiarices con las herramientas de desarrollo de los browsers, en particular
con Chrome Devtools.

## Qué hay que hacer

El autocomplete / search field debe andar correctamente.

Adicionalmente, te pedimos:.
- Que nos indiques los pasos que hiciste para solucionarlo.

	1. Movi el <script src="index.js"></script> hacia abajo, antes de que cierre la etiqueta body. No puede estar dentro del Head.
	2. Hardcodeo el document.querySelector con (.autocomplete input), para verificar que esto funcione al menos.
	2.1. Arregle el document.querySelector, ahora se le manda ('.' + selector + ' input') por parametro, ya que lo que 	    estaba originalmente, no lo reconocía como valido.
	3. Elimino el " fetchData("").then(showResults);" para que NO muestre todo el listado cuando el input esta vacio ("").
	4. Agrego condicional para que solo filtre lo del input cuando ' text != "" ', caso contrario, borro el contenido de la lista 

- Por qué es que no funcionaba en un primer lugar.
	
	1. El script del .html no puede estar dentro del Head, lo ubique antes de que cierre el body.
	2. El document.querySelector(`${selector} input`) no esta funcionando.

- Nos digas una mejora que le harías (fuera de lo que es estilo o gráfica) al código para que funcione mejor.

	1. Eliminar el " fetchData("").then(showResults);"  para que no traiga todos la lista cuando el input esta vacio ("")
	2. Deberia poder borrar toda la lista filtrada cuando el input este vacio (""). Esto esta hecho parcialmente, ya que si borro todo el contenido del input (y despues presiono una vez mas "borrar"), borra BIEN, pero a veces pareciera que queda algo en el buffer y sigue filtrando. Yo creo que tiene que ver con que esa funcionalidad de borrar NO deberia estar dentro del "eventListener" ya que quizas "escucha" basura y filtra igual, por mas que este vacio el input. Otra opcion que se me ocurre, es poder limpiar el buffer (para que no contenga basura) que escucha el eventListener.
