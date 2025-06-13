## Resumen

A continuación se describen los pasos para ejecutar localmente el repositorio de GAN para MNIST, entrenar o cargar un modelo preentrenado que genere dígitos falsos, y exponer esa funcionalidad mediante una API REST que se pueda integrar en tu propio proyecto. Se detallan: 1) cómo clonar e instalar dependencias, 2) cómo entrenar y guardar el generador, 3) cómo cargar el modelo entrenado y generar imágenes falsas de dígitos MNIST en CPU o GPU, 4) cómo crear una API usando FastAPI o Flask para servir la generación de imágenes, 5) ejemplos de conversión de tensores a imágenes y retorno en la respuesta HTTP

## 1. Clonar el repositorio y preparar el entorno

1. Clona el repositorio oficial de GitHub:

   ```bash
   git clone https://github.com/sssingh/mnist-digit-generation-gan.git
   ```

   ([github.com][1])
2. Entra en la carpeta del proyecto:

   ```bash
   cd mnist-digit-generation-gan
   ```
3. Crea un entorno virtual (recomendado) con Python 3.7+ y actívalo:

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # En Linux/Mac
   # o en Windows:
   # venv\Scripts\activate
   ```

   ([pytorch.org][2])
4. Instala las dependencias necesarias: NumPy, PyTorch, torchvision, matplotlib, pickle, etc. Por ejemplo, si no necesitas GPU:

   ```bash
   pip install torch torchvision numpy matplotlib
   ```

   ([pytorch.org][2])
   Si deseas soporte CUDA y tu máquina tiene GPU compatible, ajusta la instalación según la versión de CUDA: revisa la página oficial de PyTorch para la instrucción exacta según tu plataforma ([pytorch.org][3]).
5. Verifica que PyTorch funciona correctamente:

   ```python
   import torch
   print(torch.__version__)
   print("CUDA disponible:", torch.cuda.is_available())
   ```

   ([pytorch.org][2])

## 2. Entrenamiento y guardado del modelo

1. El repositorio incluye un notebook `mnist_gan.ipynb` con la definición de la red generadora (Generator) y discriminadora (Discriminator) en PyTorch ([github.com][1]).
2. Para entrenar desde cero: abre y ejecuta el notebook o crea un script `train.py` similar con:

   * Carga de MNIST con `torchvision.datasets.MNIST`, normalizando a \[-1,1] para coincidir con la salida `tanh` del generador ([github.com][1]).
   * Definición de redes: generator y discriminator según arquitecturas fully connected (capas lineales, LeakyReLU, dropout) tal como en el README ([github.com][1]).
   * Bucle de entrenamiento: para cada batch, entrenar no sólo el discriminador con pérdidas real vs fake, sino luego el generador inverso de etiquetas.
   * Después de cada época o cada N iteraciones, generar imágenes de prueba con un ruido fijo y opcionalmente salvarlas o visualizarlas.
3. Guardado de pesos del generador: al final del entrenamiento (o tras cada época), guarda el estado del generador en un fichero, p.ej.:

   ```python
   torch.save(generator.state_dict(), "generator_mnist.pth")
   ```

   ([docs.pytorch.org][4])
4. Si ya existe un modelo preentrenado disponible (el repositorio no incluye directamente un `.pth`), puedes entrenar localmente o buscar forks que hayan subido pesos. Si entrenas en GPU y planeas servir en CPU, recuerda luego mover el modelo a CPU cuando cargues para la API.

## 3. Cargar el modelo entrenado y generar imágenes

1. En un script de inferencia (`inference.py`), define la clase Generator idéntica a la usada en entrenamiento y luego:

   ```python
   import torch
   import numpy as np

   # Definir la clase Generator exactamente igual
   class Generator(torch.nn.Module):
       def __init__(...):
           super().__init__()
           # capas según notebook

       def forward(self, x):
           # forward idéntico
           return out

   def cargar_generator(ruta_pesos, device="cpu"):
       g = Generator(...)
       state = torch.load(ruta_pesos, map_location=device)
       g.load_state_dict(state)
       g.to(device)
       g.eval()
       return g

   def generar_imagen(g, latent_dim=100):
       z = np.random.uniform(-1, 1, size=(1, latent_dim))
       z = torch.from_numpy(z).float().to(next(g.parameters()).device)
       with torch.no_grad():
           fake = g(z)
       # fake shape: [1, 784] o [1,1,28,28] según implementación
       fake = fake.view(1, 1, 28, 28)
       # Normalmente está en rango [-1,1], convertir a [0,255]
       fake_img = (fake + 1) / 2  # rango [0,1]
       fake_img = fake_img.clamp(0,1)
       return fake_img  # tensor float en [0,1]
   ```

   ([github.com][1]) ([docs.pytorch.org][4])
2. Convertir el tensor a imagen serializable (PNG/JPEG) para la API:

   ```python
   from PIL import Image
   import io

   def tensor_a_bytes_imagen(tensor):
       # tensor: [1,1,28,28], float en [0,1]
       arr = (tensor.squeeze(0).squeeze(0).cpu().numpy() * 255).astype(np.uint8)  # shape (28,28)
       img = Image.fromarray(arr, mode='L')  # L = grayscale
       buffer = io.BytesIO()
       img.save(buffer, format="PNG")
       buffer.seek(0)
       return buffer.read()  # bytes de imagen PNG
   ```

   ([medium.com][5]) ([docs.pytorch.org][4])

## 4. Crear la API REST

### 4.1 Elección de framework: FastAPI vs Flask

* **Flask**: sencillo para APIs básicas; tutorial oficial de PyTorch usa Flask en un ejemplo de clasificación ([docs.pytorch.org][4]).
* **FastAPI**: rendimiento mayor, validación automática de tipos con Pydantic, documentación automática (Swagger UI), muy popular para ML ([medium.com][5]).

### 4.2 Ejemplo con FastAPI

1. Instala FastAPI y uvicorn:

   ```bash
   pip install fastapi uvicorn
   ```

   ([medium.com][5])
2. Crea un archivo `app.py` o `main.py` con:

   ```python
   from fastapi import FastAPI, Response
   import torch
   import numpy as np
   from PIL import Image
   import io

   # Importar o definir Generator e funciones de carga/generación
   class Generator(torch.nn.Module):
       def __init__(...):
           super().__init__()
           # definición idéntica

       def forward(self, x):
           # forward idéntico
           return out

   def cargar_generator(ruta_pesos, device):
       g = Generator(...)
       state = torch.load(ruta_pesos, map_location=device)
       g.load_state_dict(state)
       g.to(device)
       g.eval()
       return g

   def generar_imagen_bytes(g, latent_dim=100):
       z = np.random.uniform(-1, 1, size=(1, latent_dim))
       z = torch.from_numpy(z).float().to(next(g.parameters()).device)
       with torch.no_grad():
           fake = g(z)
       fake = fake.view(1, 1, 28, 28)
       fake = (fake + 1) / 2
       arr = (fake.squeeze(0).squeeze(0).cpu().numpy() * 255).astype(np.uint8)
       img = Image.fromarray(arr, mode='L')
       buf = io.BytesIO()
       img.save(buf, format='PNG')
       buf.seek(0)
       return buf.read()

   # Inicializar FastAPI
   app = FastAPI()

   # Cargar el modelo al iniciar la aplicación
   DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
   generator = cargar_generator("generator_mnist.pth", device=DEVICE)

   @app.get("/generate")
   def generate_digit():
       img_bytes = generar_imagen_bytes(generator, latent_dim=100)
       return Response(content=img_bytes, media_type="image/png")
   ```

   ([medium.com][5]) ([docs.pytorch.org][4])
3. Ejecuta la API localmente:

   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

   Al iniciar, FastAPI mostrará la documentación automática en `http://127.0.0.1:8000/docs` ([medium.com][5]).
4. Prueba llamando en el navegador o con `curl`:

   ```bash
   curl http://127.0.0.1:8000/generate --output fake.png
   ```

   Esto guardará la imagen PNG generada.

### 4.3 Ejemplo con Flask

1. Instala Flask:

   ```bash
   pip install flask
   ```

   ([docs.pytorch.org][4])
2. Crea `app_flask.py`:

   ```python
   from flask import Flask, send_file, make_response
   import torch, numpy as np
   from PIL import Image
   import io

   # Definir Generator y funciones de carga/generación como antes

   app = Flask(__name__)
   DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
   generator = cargar_generator("generator_mnist.pth", device=DEVICE)

   @app.route('/generate', methods=['GET'])
   def generate_digit():
       img_bytes = generar_imagen_bytes(generator, latent_dim=100)
       return Response(img_bytes, mimetype='image/png')
   # Alternativamente:
   # return send_file(io.BytesIO(img_bytes), mimetype='image/png', as_attachment=False, attachment_filename='fake.png')

   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=5000)
   ```

   ([docs.pytorch.org][4])
3. Ejecuta:

   ```bash
   python app_flask.py
   ```

   Y prueba en `http://127.0.0.1:5000/generate`.

*IMPORTANTE: DESPUÉS DE REALIZAR TODO LO ANTERIOR AHORA SE ENCUENTRA CORRIENDO EN EL PUERTO: http://localhost:8000/generate.

Se muestra como tal la especie de imagen.

ESTO FALTARÍA POR IMPLEMENTAR EN EL FRONT DEL PROYECTO:

5. Integración en tu proyecto
Consumo de la API desde tu front O en el proxy:

En tu frontend  puedes solicitar GET /generate y mostrar la imagen recibida directamente en un <img src="data:image/png;base64,..."> tras codificar a Base64, o apuntar el src al endpoint si el dominio coincide


