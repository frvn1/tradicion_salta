# Tradición de Salta — PWA de fidelización

Aplicación web progresiva (PWA) para registrar solicitudes de visitas y gestionar el programa de fidelización del hotel. Esta versión conserva la demo original y agrega identidad visual beige, marca Tradición de Salta y opción de instalación.

## Incluye
- Página pública para ingresar el DNI y enviar una solicitud de visita.
- Botón superior «Instalar nuestra app» con instalación compatible cuando el navegador la ofrece y orientación para iPhone.
- Manifiesto PWA, iconos y service worker para almacenar los recursos de la aplicación y permitir una apertura básica sin conexión después de la primera carga.
- Panel de administración de demostración.
- Confirmación o rechazo manual de solicitudes: la visita solo cuenta cuando el personal la confirma.
- Historial, clientes, beneficios, canjes y exportación CSV.
- Datos locales en el navegador, sin Supabase por ahora.

## Credenciales de demostración
- Usuario: `admin`
- Contraseña: `tradicion-demo`

## Probar localmente
1. Descomprimí la carpeta.
2. Podés abrir `index.html` para revisar el diseño y las funciones de demostración.
3. Para que funcione la instalación PWA y el service worker, publicá la carpeta en un sitio con HTTPS (por ejemplo, Netlify) o ejecutala mediante un servidor local. Abrir los archivos directamente como `file://` no permite registrar el service worker.
4. Desde un navegador compatible, tocá «Instalar nuestra app» o usá la opción de instalación del navegador. En iPhone/iPad, abrí el sitio en Safari, tocá Compartir y luego «Agregar a pantalla de inicio».
5. Para entrar al panel, abrí `admin.html` e ingresá las credenciales de demostración.

## Importante antes de usar con huéspedes reales
Esta versión sigue siendo una demo: los datos se guardan en el almacenamiento local del navegador y no se comparten entre dispositivos. El acceso administrativo es de demostración y no debe considerarse seguro. No cargues DNI reales ni datos personales sensibles en una publicación pública.

El siguiente paso será integrar Supabase, autenticación segura para el personal, políticas RLS y validaciones del lado del servidor para evitar duplicados y proteger los datos. La PWA por sí sola no convierte el almacenamiento local en una base de datos compartida.
