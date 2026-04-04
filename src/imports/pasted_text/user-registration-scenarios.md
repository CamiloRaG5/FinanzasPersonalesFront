1. Crear cuenta de usuario
Escenario 1: Registro exitoso con datos válidos: 

Dado que el usuario está en la pantalla de registro, cuando ingresa un correo válido, una contraseña válida y confirma la contraseña, entonces el sistema debe crear la cuenta y mostrar un mensaje de "Registro exitoso"


Escenario 2: Intento de registro con correo inválido:

Dado que el usuario está en la pantalla de registro, cuando ingresa un correo con formato inválido e intenta registrarse, entonces el sistema debe mostrar un mensaje indicando que el correo no es válido y no debe crear la cuenta.


Escenario 3: Intento de registro con correo ya registrado:

Dado que el usuario está en la pantalla de registro, cuando ingresa un correo ya registrado y envía el formulario, entonces el sistema debe mostrar un mensaje indicando que el correo ya está en uso.


Escenario 4: Contraseñas no coinciden:

Dado que el usuario está en la pantalla de registro, cuando ingresa contraseñas que no coinciden e intenta registrarse, entonces el sistema debe mostrar un mensaje indicando que las contraseñas deben coincidir y no debe crear la cuenta.


Escenario 5: Contraseña no cumple requisitos de seguridad:

Dado que el usuario está en la pantalla de registro, cuando ingresa una contraseña que no cumple con los requisitos de seguridad o contiene caracteres inválidos, entonces el sistema debe mostrar un mensaje indicando que la contraseña es inválida y debe ingresar una contraseña válida.


Escenario 6: Nombre inválido:

Dado que el usuario está en la pantalla de registro, cuando ingresa un nombre que no cumple con el mínimo de caracteres o contiene caracteres no válidos, entonces el sistema debe mostrar un mensaje indicando que el nombre es inválido.


Escenario 7: Apellido inválido:

Dado que el usuario está en la pantalla de registro, cuando ingresa un apellido que no cumple con el mínimo de caracteres o contiene caracteres no válidos, entonces el sistema debe mostrar un mensaje indicando que el apellido es inválido.


Escenario 8: Campos obligatorios vacíos:

Dado que el usuario está en la pantalla de registro, cuando intenta registrarse sin completar los campos obligatorios (nombre, apellido, correo o contraseña), entonces el sistema debe mostrar un mensaje indicando que todos los campos deben ser completados.

2. Registrar monto de un ingreso
Escenario 1: Registro de monto exitoso:

Dado que el usuario está autenticado, cuando ingresa un monto válido (mayor que 0), entonces el sistema debe guardar el ingreso correctamente.



Escenario 2: Validación de monto obligatorio:

Dado que el usuario autenticado está en el formulario para registrar un monto, cuando intenta guardar sin ingresar un monto, entonces el sistema debe mostrar un mensaje de error indicando que el campo es obligatorio.



Escenario 3: Validación de monto exitoso:

Dado que el usuario autenticado está registrando un ingreso, cuando ingresa un monto menor a igual a cero. Entonces el sistema debe rechazar el valor y mostrar un mensaje indicando que el monto debe ser mayor a cero.



Escenario 4: Formato numérico válido:

Dado que el usuario autenticado está registrando un ingreso, cuando el usuario ingresa un valor no numérico, el sistema debe mostrar un mensaje de error indicando que el formato es inválido.



Escenario 5: Rendimiento: 

Dado que el usuario está autenticado, cuando se registra un ingreso válido, entonces el sistema debe guardar la información en menos de 2 segundos.


Escenario 6: Seguridad en el registro:

Dado que un usuario no está autenticado, cuando intenta registrar un ingreso, el sistema debe impedir el acceso.

3. Ver historial de transacciones
Escenario 1: Visualización del historial:

Dado que el usuario está autenticado, cuando accede a la sección del historial, entonces el sistema debe mostrar todas las transacciones registradas en el sistema.

Escenario 2: Historial vacío:

Dado que el usuario está autenticado y no tiene transacciones registradas, cuando accede al historial de transacciones, entonces el sistema debe mostrar un mensaje indicando que no hay transacciones disponibles.

Escenario 3: Actualización del historial:

Dado que el usuario está autenticado y  registró una nueva transacción, cuando consulta el historial, entonces la nueva transacción debe verse reflejada.

Escenario 4: Carga rápida del historial:

Dado que el usuario está autenticado, cuando accede al historial, entonces el sistema debe cargar en menos de 2 segundos.

Escenario 5: Seguridad en el historial:

Dado que el usuario no está autenticado, cuando intenta ingresar al historial, entonces el sistema debe denegar el acceso y solicitar la autenticación.


4. Ver categorías disponibles
Escenario 1: Visualización completa

Dado que soy un usuario autenticado y estoy en formulario de gasto/ingreso, cuando abro lista de categorías, entonces veo todas categorías predefinidas (Alimentación, Transporte, Salud, Entretenimiento, Otros). 


Escenario 2: Carga rápida

Dado que soy un usuario autenticado y abro lista categorías, cuando cargo la página, entonces la lista aparece en menos de 1 segundo.


Escenario 3: Búsqueda rápida

Dado que el usuario está autenticado y existen múltiples categorías registradas, cuando ingresa un término en el campo de búsqueda, entonces el sistema debe mostrar solo las categorías que coincidan con el término ingresado.


Escenario 6: Móvil responsive 

Dado que el usuario accede desde el celular, cuando abro categorías, entonces la lista se adapta sin scroll horizontal.


Escenario 5: Sin categorías 

Dado que no hay categorías configuradas, cuando abro lista de categorías, entonces el sistema muestra “No hay categorías disponibles”.


Escenario 6: Selección obligatoria

Dado que el usuario está en el formulario de registro de un movimiento, cuando selecciona una categoría y presiona "Guardar", entonces el sistema debe asignar la categoría correctamente al movimiento

5. Registrar monto de un gasto
Escenario 1: Registro exitoso


Dado que el usuario está autenticado y se encuentra en el formulario de "Nuevo Gasto", cuando selecciona una categoría, ingresa un monto mayor a 0 y una fecha menor o igual a la actual, entonces el sistema debe guardar el gasto correctamente.


Escenario 2: Rendimiento


Dado que el usuario está autenticado y se encuentra en el formulario de "Nuevo Gasto", cuando completa el formulario con datos válidos y presiona "Guardar", entonces el sistema debe responder en menos de 2 segundos.


Escenario 3: Categoría Obligatoria

Dado que el usuario está autenticado y se encuentra en el formulario de "Nuevo Gasto", cuando intenta guardar sin seleccionar una categoría, entonces el sistema debe mostrar el mensaje "Seleccione una categoría" y no debe guardar el gasto.


Escenario 4: Monto Inválido


Dado que el usuario está autenticado y se encuentra en el formulario de "Nuevo Gasto", cuando ingresa un monto menor o igual a 0 o deja el campo vacío y presiona "Guardar", entonces el sistema debe mostrar el mensaje "Monto inválido" y no debe guardar el gasto.


Escenario 5: Verificación en historial

Dado que el usuario está autenticado y el gasto fue guardado correctamente, cuando accede al historial de transacciones, entonces el gasto debe aparecer con la fecha, categoría y monto correctos.


Escenario 6: Responsive


Dado que el usuario está autenticado y accede desde un dispositivo móvil, cuando registra un gasto, entonces el sistema debe permitir la interacción de los campos de forma adecuada para pantallas táctiles.
