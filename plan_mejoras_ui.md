# Plan de Mejora de Interfaces Gráficas

Este plan tiene como objetivo modernizar la interfaz de usuario de la aplicación LegalGenAI, aplicando un estilo profesional, sobrio y minimalista, con un tema oscuro base y acentos de color morado y azul.

## 1. Configuración General de Tailwind CSS

Modificaremos `tailwind.config.js` para incluir:

*   **Tema Oscuro:** Definiremos los colores base para el tema oscuro.
*   **Colores de Acento:**
    *   Morado: `#8B5CF6` (lo llamaremos `accent-purple`)
    *   Azul: `#3B82F6` (lo llamaremos `accent-blue`)
*   **Tipografía:**
    *   Fuente principal (sans-serif): `Inter`. Necesitaremos importar la fuente elegida en `public/index.html` o a través de CSS.
    *   Aseguraremos que la tipografía se aplique globalmente.

**Archivo a modificar:** `tailwind.config.js`

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // o 'media' si se prefiere basado en el sistema
  theme: {
    extend: {
      colors: {
        'background-dark': '#1A1A1A', // Un gris oscuro profundo para el fondo principal
        'surface-dark': '#2C2C2C',   // Un gris ligeramente más claro para superficies como cards, modales
        'text-primary-dark': '#E0E0E0', // Texto principal claro
        'text-secondary-dark': '#A0A0A0', // Texto secundario o menos importante
        'border-dark': '#404040',      // Bordes sutiles
        'accent-purple': '#8B5CF6',
        'accent-blue': '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Definir Inter como la fuente sans-serif por defecto
      },
      boxShadow: {
        'input-focus': '0 0 0 2px #3B82F6', // Sombra para focus en inputs, usando el azul de acento
        'modal': '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 20px 50px -12px rgba(0, 0, 0, 0.4)', // Sombra más pronunciada para modales
        'chat-input': '0 -4px 12px -1px rgba(0, 0, 0, 0.1)', // Sombra superior para la barra de entrada del chat
      }
    },
  },
  plugins: [],
}
```

**Archivo a modificar:** `public/index.html` (para importar la fuente Inter)

Añadir dentro de la etiqueta `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Archivo a modificar:** `src/index.css` (para aplicar el fondo oscuro base y la fuente al body)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background-dark text-text-primary-dark font-sans antialiased;
  }
}

@media print {
  .no-print {
    display: none;
  }
  body { /* Estilos de impresión para que no salga oscuro */
    @apply bg-white text-black;
  }
}
```

## 2. Componente de Chat (`Chatbot.jsx`)

*   **Contenedor Principal:**
    *   Fondo: `bg-surface-dark`
*   **Área de Mensajes:**
    *   Fondo: `bg-background-dark`.
    *   Bordes: `border-border-dark`.
*   **Burbujas de Conversación:**
    *   **Usuario (derecha):**
        *   Fondo: `bg-accent-blue`
        *   Texto: `text-white`
    *   **Asistente (izquierda):**
        *   Fondo: `bg-surface-dark`.
        *   Texto: `text-text-primary-dark`
    *   **Nombre del Rol ("Tú", "Asistente Legal"):**
        *   Texto: `text-text-secondary-dark`
*   **Barra de Entrada Inferior:**
    *   Fondo: `bg-surface-dark`
    *   Padding: `p-4` o `p-6`
    *   Sombra: `shadow-chat-input`.
    *   **Textarea:**
        *   Fondo: `bg-background-dark`
        *   Texto: `text-text-primary-dark`
        *   Borde: `border-border-dark`
        *   Focus: `focus:ring-2 focus:ring-accent-blue focus:border-accent-blue`
        *   Placeholder: `placeholder-text-secondary-dark`
    *   **Botón Enviar:**
        *   Fondo: `bg-accent-blue`
        *   Texto: `text-white`
        *   Estado `disabled`: `bg-opacity-50` del color `accent-blue`.

## 3. Modal Emergente (`ModalResult.jsx`)

*   **Overlay:**
    *   Fondo: `bg-black bg-opacity-75`.
    *   Efecto blur: `backdrop-blur-sm`.
*   **Contenedor del Modal:**
    *   Fondo: `bg-surface-dark`
    *   Esquinas: `rounded-lg` o `rounded-xl`
    *   Sombra: `shadow-modal`
*   **Título ("Resultado del Análisis"):**
    *   Texto: `text-text-primary-dark`
*   **Botón Cerrar (X):**
    *   Icono: `text-text-secondary-dark`
    *   Hover: `hover:text-text-primary-dark`
*   **Bloque Categoría Detectada:**
    *   Título ("Categoría Legal:"): `text-text-secondary-dark`
    *   Valor (`category`): `text-accent-blue font-semibold`
*   **Bloque Explicación del Agente:**
    *   Título ("Explicación:"): `text-text-secondary-dark`
    *   Valor (`explanation`): `text-text-primary-dark`
    *   Borde: `border border-accent-purple p-3 rounded-md`
*   **Botón "Generar Documento":**
    *   Fondo: `bg-accent-purple`
    *   Texto: `text-white`
*   **Animaciones:**
    *   Entrada/Salida del modal: `fade-in`, `scale-up`.

## 4. Cuadro de Texto tipo Word (`DraftViewer.jsx`)

*   **Contenedor Principal del Documento (`div` con `contentRef`):**
    *   Fondo: `bg-surface-dark`.
    *   Texto: `text-text-primary-dark`.
    *   Borde: `border border-border-dark rounded-md`.
    *   Padding: `p-6` o `p-8`.
*   **Encabezado ("Documento Legal Generado"):**
    *   Texto: `text-text-primary-dark`
    *   Borde inferior: `border-b-2 border-border-dark`
*   **Botones ("Revisar Documento", "Exportar PDF"):**
    *   "Revisar Documento (QA)": `bg-accent-blue`
    *   "Exportar PDF": `bg-green-500 text-white` (adaptado a tema oscuro).

## 5. General

*   **Tipografía:** `Inter` (configurada globalmente).
*   **Responsividad:** Revisar y asegurar con clases de Tailwind.
*   **Animaciones Suaves:** Transiciones en hovers y aparición de modales.

## Diagrama Mermaid (Conceptual)

```mermaid
graph TD
    A[Aplicación LegalGenAI] --> B(Tema Oscuro Global);
    B -- Fuente: Inter --> C{Componentes Principales};
    B -- Colores: Morado (#8B5CF6), Azul (#3B82F6) --> C;

    C --> D[Chatbot];
    D -- Barra Entrada Fija --> D1(Input + Botón Enviar Azul);
    D -- Burbujas --> D2(Usuario: Azul, Derecha);
    D -- Burbujas --> D3(Asistente: Gris Oscuro, Izquierda);

    C --> E[Modal Emergente];
    E -- Fondo Difuminado --> E1(Contenido Centrado);
    E1 -- Bloque Categoría --> E2(Texto Azul);
    E1 -- Bloque Explicación --> E3(Borde/Sombra Morada);

    C --> F[Visor Documento (DraftViewer)];
    F -- Caja Tipo Word --> F1(Fondo Oscuro Suave, Borde Claro);

    subgraph Estilos Generales
        G1[Tipografía Moderna: Inter]
        G2[Tailwind CSS]
        G3[Animaciones Suaves]
        G4[Minimalismo Funcional]
    end

    A --> G1;
    A --> G2;
    A --> G3;
    A --> G4;