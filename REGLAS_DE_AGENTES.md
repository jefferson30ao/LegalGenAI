
1. **Agente de validación o entrevista inicial**:

   * Objetivo: Entrevistar al usuario para recabar datos mínimos: fechas, partes, jurisdicción, etc.
   * Herramientas: GPT + lógica en frontend que decide cuándo el prompt necesita preguntar algo adicional.
   * “YA IMPLEMENTADO, podría mejorarse”

2. **Agente de clasificación especializado**:

   * Objetivo: Dada la descripción, devolver una categoría legal (“Contrato de arrendamiento”, “Despido laboral”, “Reclamación de herencia”, etc.).
   * Herramientas: GPT con prompt templated.

3. **Agente de búsqueda/recuperación de información legal**:

   * Objetivo: Consultar fuentes externas (APIs de jurisprudencia, bases de datos de leyes, o simulaciones) para contextualizar la explicación.
   * Herramientas: llamar a APIs de terceros que devuelvan textos normativos o resúmenes.
   * Beneficio: En la explicación ampliada (“por qué clasifiqué así”), se añaden referencias concretas y actualizadas, reduciendo alucinaciones.

4. **Agente explicativo**:

   * Objetivo: Con la categoría y la información recuperada, usar GPT para construir una justificación clara y formal indicando referencias legales.
   * Beneficio: Transparencia frente al profesional legal: “He usado tal artículo para concluir…”.

5. **Agente de generación de borrador**:

   * Objetivo: Estructurar el documento (títulos, secciones, cláusulas) adaptado al tipo de asunto.
   * Herramientas: GPT con prompt robusto que reciba la categoría, los detalles del caso y quizá plantillas predefinidas para cada tipo de documento.
   * Beneficio: Documentos más consistentes, con formato y secciones esperables en la práctica jurídica.

6. **Agente de revisión o QA**:

   * Objetivo: Revisar el borrador generado para detectar incoherencias, omisiones evidentes o lenguaje ambiguo.
   * Herramientas: GPT con prompt de revisión o incluso un prompt “actúa como revisor legal” que señale puntos débiles.
   * Beneficio: Mejora la confianza en el borrador antes de que el usuario lo vea.


### 2.2. Flujo con agentes coordinados

* El frontend (o un backend ligero) orquesta llamadas a cada agente en secuencia o de forma concurrente cuando corresponda.
* Cada agente tiene su prompt o lógica especializada y puede devolverse como una “etiqueta” clara al usuario.
* Ejemplo de secuencia:

  1. **Agente de entrevista**: recopila info mínima.
  2. **Agente de clasificación**: determina categoría.
  3. **Agente de búsqueda**: consulta APIs o repositorios internos.
  4. **Agente explicativo**: construye justificación.
  5. **Agente de generación**: produce borrador.
  6. **Agente de revisión**: sugiere mejoras o alerta de posibles riesgos.