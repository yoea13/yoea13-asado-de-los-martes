# 🥩 yoea13-asado-de-los-martes

Aplicación web mobile-first diseñada para resolver la división y compensación equitativa de gastos en reuniones de amigos y asados de los martes.

Deployable en [Vercel](https://vercel.com).

## 🚀 Funcionalidades

- **Carga rápida y sencilla**: Ingreso de Nombre, Detalle de lo comprado y Valor de la compra.
- **Soporte para compras múltiples**: Si una misma persona realiza varias compras (ej. Carne, Bebidas), el sistema acumula sus gastos automáticamente.
- **Edición y eliminación**: Posibilidad de modificar o eliminar gastos ya cargados en cualquier momento.
- **División equitativa con botón "Pagar"**:
  - Pregunta la cantidad total de comensales/asistentes.
  - Asume que los compradores están dentro de los asistentes.
  - Los asistentes restantes que no compraron se calculan de forma genérica.
  - Muestra claramente quién debe poner plata y a quién le quedó saldo a favor (y cuánto debe cobrar).
- **Compartir por WhatsApp**: Genera un mensaje formateado con emojis listo para enviar al grupo de WhatsApp del asado.
- **Copiar Resumen**: Copiado rápido al portapapeles con un solo toque.
- **Diseño Mobile-First**: Optimizado para pantallas táctiles y celulares (Android / iOS).

---

## 🛠️ Stack Tecnológico

- **Backend**: Node.js & Express
- **Frontend**: HTML5, CSS3 moderno (Mobile-First, Dark Theme) y Vanilla JavaScript
- **Deployment**: Vercel (`@vercel/node`)

---

## 💻 Instalación y Uso Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/yoea13/yoea13-asado-de-los-martes.git
   cd yoea13-asado-de-los-martes
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   ```

4. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

---

## ☁️ Deploy en Vercel

El proyecto incluye el archivo `vercel.json` configurado:

```bash
vercel
```

O conectando el repositorio directamente desde el panel de control de Vercel.

---

## 📝 Ejemplo de Cálculo

Si **Germán** gastó `$50.000` en carne y **Mario** gastó `$10.000` en pan y carbón:
- **Total gastado**: `$60.000`
- Al presionar **Pagar**, se ingresa que son **10 asistentes**:
  - **Cuota por persona**: `$6.000` ($60.000 / 10)
  - **Germán**: Recibe **+$44.000** (puso $50.000)
  - **Mario**: Recibe **+$4.000** (puso $10.000)
  - **Los 8 asistentes restantes**: Deben poner **$6.000** cada uno
