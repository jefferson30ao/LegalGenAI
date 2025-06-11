# Plan de Implementación: Soporte Markdown en DraftViewer

## Objetivo
Mejorar el componente `DraftViewer` para interpretar y mostrar correctamente:
- Sintaxis Markdown (negritas, itálicas, listas)
- Caracteres especiales

## Solución Propuesta
1. **Instalar dependencia**:
   ```bash
   npm install react-markdown
   ```

2. **Modificar `src/components/DraftViewer.jsx`**:
   - Importar ReactMarkdown
   - Reemplazar visualización de texto plano
   ```jsx
   // Añadir en imports
   import ReactMarkdown from 'react-markdown';

   // Reemplazar línea 28
   <ReactMarkdown className="whitespace-pre-line">
     {content}
   </ReactMarkdown>
   ```

3. **Pruebas de validación**:
   - Verificar renderizado de **negritas**
   - Probar con *itálicas* y listas
   - Confirmar visualización de caracteres especiales

## Beneficios
- Interpretación nativa de Markdown
- Seguridad contra XSS
- Mantenimiento simplificado

## Pasos Siguientes
Implementar cambios en modo Code