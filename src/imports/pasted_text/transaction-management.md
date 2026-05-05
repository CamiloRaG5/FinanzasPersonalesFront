1. Eliminar una transacción
descripcion:
Como usuario autenticado, quiero eliminar una transacción de mi historial, para corregir errores en mis registros financieros.
Criterios de aceptacion:
Escenario 1: Eliminación exitosa desde el historial.
Dado que estoy autenticado y visualizo una transacción existente en mi historial, cuando selecciono la opción de eliminar y confirmo la acción, entonces el sistema debe borrar la transacción y actualizar el historial y el balance correspondiente.

Escenario 2: Solicitud de confirmación antes de eliminar.
Dado que estoy autenticado y selecciono la opción de eliminar una transacción de mi historial, cuando el sistema recibe la solicitud, entonces debe mostrar un mensaje de confirmación antes de realizar la eliminación.

Escenario 3: Cancelación de la eliminación.
Dado que el sistema muestra el mensaje de confirmación de eliminación, cuando selecciono la opción de cancelar, entonces la transacción debe permanecer registrada en el historial sin ningún cambio.

Escenario 4: Intento de eliminar una transacción inexistente.
Dado que estoy autenticado y selecciono una transacción que ya no está disponible en el sistema, cuando intento eliminarla, entonces el sistema debe informar que la operación no puede completarse porque la transacción no existe.

2. Editar categoría de transacciones
descripcion:
Como usuario autenticado, quiero editar la categoría de una transacción, para mantener mi historial financiero más ordenado y preciso.
Criterios de aceptacion:

Escenario 1: Edición exitosa de la categoría.
Dado que estoy autenticado y visualizo una transacción existente en mi historial, cuando selecciono la opción de editar categoría, cambio la categoría por una válida y guardo los cambios, entonces el sistema debe actualizar la transacción correctamente.

Escenario 2: Visualización del cambio en el historial.
Dado que edité la categoría de una transacción, cuando regreso al historial, entonces la transacción debe mostrarse con la nueva categoría asignada.

Escenario 3: Categoría no válida.
Dado que estoy autenticado e intento asignar una categoría que no existe, cuando guardo la modificación, entonces el sistema debe rechazar el cambio y mostrar un mensaje de error.

Escenario 5: Se conservan los demás datos.
Dado que actualizo solo la categoría de una transacción, cuando guardo los cambios, entonces los demás datos de la transacción deben mantenerse iguales.

3. Confirmar eliminacion de transacción
descripcion:
Como usuario autenticado, quiero confirmar antes de eliminar una transacción, para evitar borrados accidentales de información importante.
Criterios de aceptacion:

Escenario 1: Mostrar confirmación antes de borrar.
Dado que estoy autenticado y selecciono la opción de eliminar una transacción, cuando el sistema detecta la acción, entonces debe mostrar una ventana o mensaje de confirmación antes de ejecutar el borrado.

Escenario 2: Confirmación aceptada.
Dado que aparece el mensaje de confirmación, cuando presiono aceptar, entonces el sistema debe eliminar la transacción y actualizar el historial.

Escenario 3: Confirmación cancelada.
Dado que aparece el mensaje de confirmación, cuando presiono cancelar, entonces la transacción no debe eliminarse y debe permanecer visible en el historial.

Escenario 4: Mensaje claro sobre lo que se elimina.
Dado que el sistema solicita confirmar la eliminación, cuando se muestra el mensaje, entonces debe indicar de forma clara qué transacción será eliminada para evitar confusión.
Historia de abuso:
HA  3.2.3 Eliminación no autorizada de transacciones
Como atacante o usuario malintencionado, quiero eliminar una transacción sin la confirmación explícita del usuario o manipulando la interfaz, para borrar información importante de forma no autorizada o sin que el usuario lo note.
Mitigaciones:
Confirmación explícita
El sistema debe solicitar una confirmación explícita antes de eliminar una transacción, mostrando claramente los datos relevantes de la misma.
Re Autenticación 
El sistema debe requerir la re-autenticación del usuario (contraseña) antes de permitir la eliminación de una transacción.
Control de autorización
El sistema debe verificar que el usuario autenticado tenga permisos para eliminar la transacción seleccionada.

4. crear presupuesto mensual
descripcion:
Como usuario autenticado quiero crear un presupuesto mensual ingresando mis ingresos y límite de gastos para organizar mis finanzas y controlar mis gastos durante el mes.
Criterios de aceptacion:
Escenario 1: Creación exitosa del presupuesto mensual
Dado que el usuario se encuentra en la sección de presupuestos, cuando ingresa el mes, sus ingresos y el límite de gastos, entonces el sistema guarda el presupuesto y lo muestra en la lista de presupuestos activos
Escenario 2: Campos obligatorios vacíos
Dado que el usuario desea crear un presupuesto, cuando deja campos obligatorios vacíos, entonces el sistema muestra un mensaje indicando que debe completar la información requerida.
Escenario 3: Valores inválidos
Dado que el usuario está registrando un presupuesto, cuando ingresa valores negativos o no numéricos, entonces el sistema muestra un error y no permite guardar el presupuesto.

5. Asignar presupuesto por categoría
descripcion:
Como usuario autenticado quiero asignar una parte de mi presupuesto mensual a diferentes categorías de gasto para distribuir mejor mi dinero según mis necesidades.
Criterios de aceptacion:
Escenario 1: Asignación exitosa por categoría
Dado que el usuario ya tiene un presupuesto mensual creado, cuando selecciona una categoría e ingresa un monto, entonces el sistema guarda la asignación y actualiza el saldo disponible.
Escenario 2: Monto mayor al disponible
Dado que el usuario está asignando presupuesto, cuando ingresa un valor superior al saldo disponible, entonces el sistema muestra una alerta y no permite guardar la asignación.
Escenario 3: Editar asignación existente
Dado que el usuario ya asignó presupuesto a una categoría, cuando modifica el valor asignado, entonces el sistema actualiza la información y recalcula el saldo restante.

6. Ver progreso del presupuesto
descripcion:
Como usuario autenticado quiero visualizar el progreso de ejecución de mi presupuesto mensual para conocer cuánto he gastado y cuánto me queda disponible.
Criterios de aceptacion:
Escenario 1: Visualización general del progreso
Dado que el usuario tiene gastos registrados y un presupuesto activo, cuando ingresa al módulo de progreso, entonces el sistema muestra porcentaje gastado, saldo restante y avance por categorías.
Escenario 2: Sin gastos registrados
Dado que el usuario tiene un presupuesto creado, cuando aún no registra gastos, entonces el sistema muestra progreso en 0% y saldo completo disponible.
Escenario 3: Presupuesto excedido
Dado que el usuario supera el monto presupuestado, cuando consulta el progreso, entonces el sistema muestra una alerta indicando sobrepaso del presupuesto.

7. Ver presupuesto restante
descripcion:
Como usuario quiero visualizar el presupuesto restante de mi periodo actual para saber cuanto dinero me queda disponible y tomar mejores decisiones financieras.
Criterios de aceptacion:
Escenario 1: Visualizar presupuesto restante correctamente

Dado que el usuario tiene un presupuesto mensual definido y ha registrado gastos en el mes actual cuando accede a la sección de presupuesto entonces el sistema debe mostrar el presupuesto total,  el total de gastos y el presupuesto restante calculado.

Escenario 2: Usuario sin presupuesto definido

Dado que el usuario no tiene un presupuesto mensual definido cuando accede a la sección de presupuesto entonces el sistema debe mostrar un mensaje indicando que debe crear un presupuesto.

Escenario 3: Presupuesto en negativo

Dado que los gastos del usuario superan el presupuesto mensual cuando accede a la sección de presupuesto entonces el sistema debe mostrar el valor restante en negativo y indicar visualmente que ha excedido el presupuesto.

Escenario 4: Actualización automática del presupuesto

Dado que el usuario tiene un presupuesto definido cuando registra un nuevo gasto entonces el presupuesto restante debe actualizarse automáticamente.

8. Editar presupuesto mensual
descripcion:
Como usuario quiero modificar el valor de mi presupuesto mensual para ajustarlo según mis necesidades o cambios en mis ingresos.
Criterios de aceptacion:
Escenario 1: Edición exitosa del presupuesto

Dado que el usuario tiene un presupuesto mensual definido, cuando ingresa un nuevo valor válido y guarda los cambios entonces el sistema debe actualizar el presupuesto mensual y mostrar un mensaje de confirmación.

Escenario 2: Validación de valor inválido

Dado que el usuario intenta editar su presupuesto, cuando ingresa un valor no numérico o menor o igual a cero, entonces el sistema debe mostrar un mensaje de error y no debe guardar los cambios.

Escenario 3: Actualización reflejada en el sistema

Dado que el usuario ha editado su presupuesto correctamente, cuando consulta el presupuesto restante entonces el sistema debe reflejar el nuevo valor actualizado.

Escenario 4: Error al guardar cambios

Dado que ocurre un error en el sistema al guardar, cuando el usuario intenta editar el presupuesto, entonces el sistema debe mostrar un mensaje indicando que no se pudo completar la acción.

9. Eliminar presupuesto mensual
descripcion:
Como usuario, quiero eliminar mi presupuesto mensual, para reiniciar o dejar de usar la planificación de presupuesto.
Criterios de aceptacion:
Escenario 1: Eliminación confirmada

Dado que el usuario tiene un presupuesto mensual definido, cuando selecciona la opción de eliminar presupuesto y confirma la acción, entonces el sistema debe eliminar el presupuesto y mostrar un mensaje de confirmación.

Escenario 2: Cancelación de eliminación

Dado que el usuario selecciona eliminar presupuesto, cuando decide cancelar la acción entonces el presupuesto debe mantenerse sin cambios.

Escenario 3: Eliminación sin presupuesto existente

Dado que el usuario no tiene un presupuesto definido, cuando intenta eliminar el presupuesto entonces el sistema debe mostrar un mensaje indicando que no existe un presupuesto.

Escenario 4: Estado posterior a la eliminación

Dado que el presupuesto ha sido eliminado, cuando el usuario accede a la sección de presupuesto entonces no se debe mostrar información de presupuesto restante y se debe sugerir crear un nuevo presupuesto.