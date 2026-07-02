# Notas para revisión de App Store (iOS)

Copiar este texto en **App Store Connect → App Review Information → Notes** al enviar Docta Pánico.

---

## Descripción de la aplicación

Docta Pánico es un pulsador de emergencia para residentes de barrios que cuentan con el sistema de monitoreo Desit SA. La app requiere configuración previa con código de barrio y número de cuenta provistos por el administrador del barrio.

## Cuenta de prueba para el revisor

> Completar antes de enviar: código de barrio, número de cuenta y datos de un usuario de prueba en servidor de **producción**.

- Código de barrio: `[COMPLETAR]`
- Número de cuenta: `[COMPLETAR]`
- La licencia se genera automáticamente al completar el registro en la app.

## Comportamiento del botón de pánico en iOS

Tras enviar un evento de emergencia con éxito, la aplicación intenta **ocultar la pantalla de inmediato** sin mostrar confirmación visible al usuario.

**Motivo de seguridad:** en una situación de amenaza, un agresor no debe ver en pantalla que la víctima activó una alerta de pánico.

En Android la app puede cerrarse directamente. En iOS, Apple no permite que las aplicaciones se cierren por sí mismas. Por eso, en iPhone la app intenta pasar a segundo plano abriendo brevemente otra aplicación del sistema (Ajustes, Teléfono o Mail) como mecanismo de ocultamiento. Este comportamiento es intencional y forma parte del diseño de seguridad del producto.

## Funciones no visibles para el usuario final

- Existe un flujo técnico de borrado local de emergencia, accesible solo con clave interna de soporte. No forma parte del uso normal del residente.

## Permisos y datos

- La app no utiliza GPS.
- Envía eventos de emergencia por Internet; si no hay conexión, puede ofrecer envío por SMS.
- Recopila datos de registro (nombre, teléfono, cuenta, barrio) para gestionar la licencia y el servicio de alertas.
- Utiliza Sentry únicamente para reportes técnicos de errores en producción.

## Contacto de soporte

> Completar antes de enviar.

- Email: `[COMPLETAR]`
- URL de política de privacidad: `[COMPLETAR]`
