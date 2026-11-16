<img src="icon.svg" width="72" alt="Icono de Procesador URN">

# Procesador URN

**Versión 1.5.3**

Herramienta web (un único `index.html`, sin instalación) para procesar medidas de **ruido radiado al agua (URN)** en pruebas de mar y obtener el **nivel de fuente a 1 m** por tercios de octava.

Todo el cálculo se hace en el navegador: los ficheros no salen del equipo.

## Flujo por pasada

1. **GPS**: NMEA del barco y de la boya del hidrófono (`$GxGGA` / `$GxRMC`). Calcula la distancia horizontal en el CPA, la hora del CPA, la velocidad sobre el fondo (SOG), el rumbo y la deriva de la boya. Muestra el mapa de tránsito y la distancia frente al tiempo.
2. **Señal de presión**: `.mat` v5/v7 (p. ej. `recorded_data(k).data` con `names`, `units` y `sampling`), UNV dataset 58/58b o WAV. Para cada hidrófono se indica la profundidad y el factor de calibración.
3. **Sincronización con el GPS**: hora de inicio leída de la cabecera UNV (p. ej. `30-abr.-26 10:26:48`) o de un campo de fecha del `.mat`, hora manual, o ajuste automático de la tendencia acústica con −20·log r(t). La hora del fichero se pasa a UTC (por defecto, hora de España CET/CEST). Con la señal sincronizada:
   - la ventana DWL se centra en el **CPA geométrico del GPS**;
   - cada segmento de Welch se corrige con su **distancia real r(t)** antes de promediar;
   - en la tendencia RMS se dibuja la curva esperada 1/r del GPS, y en la gráfica de distancia, el tramo grabado y la ventana;
   - con hora del fichero o manual, el ajuste automático sirve de comprobación del desfase.
4. **Ruido de fondo**: un tramo del propio registro o un **fichero aparte** (completo o un tramo), con la asignación de canales que elijas.
5. **Procesado**:
   - paso alto Butterworth de 4º orden, RMS por bloques y media móvil → CPA acústico (o CPA manual con un clic);
   - ventana DWL de longitud fija o ±θ respecto al CPA, con COMEX y FINEX;
   - espectro de Welch con ventana Hann y 50 % de solape;
   - corrección a 1 m con `N(f)·log10(r)`, donde `r = √(d_CPA² + (z_h − z_s)²)` y N varía linealmente entre N₁ y N₂ (por defecto 11 → 20 entre 10 y 100 Hz).
6. **Resultados**: tendencia, nivel de fuente en banda estrecha y en tercios de octava, ruido de fondo, S/N y margen frente a la curva límite elegida.

## Curvas límite

La curva se elige en el **Resumen**, en los resultados de cada pasada o en **Ajustes → Curva límite**; es una sola elección para todo el proyecto. Criterios disponibles (DNV-GL RU-SHIP Pt.6 Ch.7 Sec.6, tabla 2; dB re 1 µPa @ 1 m en tercios de octava):

| Notación | Condición | Criterio |
|---|---|---|
| Silent(R) | Buque de investigación (ICES CRR 209 modificado < 25 Hz) | 171,8 − 22,5·log f (10–25 Hz) · 128,7 + 8,3·log f (25 Hz–1 kHz) · 153,6 − 12·log f(kHz) (1–100 kHz) |
| Silent(E) | Tránsito | 183 − 5·log f (10 Hz–1 kHz) · 168 − 12·log f(kHz) (1–100 kHz) |
| Silent(E) | Crucero silencioso | 171 − 3·log f (10 Hz–1 kHz) · 162 − 12·log f(kHz) (1–100 kHz) |
| Silent(F) | Búsqueda ligera | 162 − 6·log f (10–100 Hz) · 138 + 6·log f (100 Hz–1 kHz) · 156 − 13,2·log f(kHz) (1–100 kHz) |
| Silent(F) | Arrastre pesado | 178 − 8·log f (10–100 Hz) · 162 (100 Hz–1 kHz) · 162 − 15·log f(kHz) (1–100 kHz) |
| Silent(A) | Prospección ligera | 156 − 12·log f(kHz) (1–100 kHz) |
| Silent(A) | Con hélices de maniobra | 165 − 12·log f(kHz) (1–100 kHz) |

La curva elegida se dibuja en las gráficas y se usa para el margen mínimo y para las tablas.

## Propagación: estimación de N

La pestaña **Propagación (N)** estima, para la geometría de la medida, el N de `N·log10(r)` por tercio de octava:

- **Entradas:** d_CPA, ventana DWL, calado (fuente a 0,7 × calado o la profundidad que indiques), profundidades de los hidrófonos (o «Tomar de la pasada»), fondo (sin fondo, o arcilla, limo, arena, grava, morrena, creta, caliza, basalto o personalizado, con su profundidad), altura de ola y paredes verticales (paralelas o perpendiculares a la derrota, con material o R).
- **Modelo:** fuentes imagen en 3D. Superficie con coeficiente −1 atenuado por el oleaje, reflexiones superficie–fondo con el coeficiente de Rayleigh de un fondo fluido con pérdidas y paredes con R fijo. Suma coherente a 16 frecuencias por tercio y promedio de energía; TL referida al campo libre a 1 m.
- **Qué corrige N:** por defecto, **solo el fondo y las paredes**, que es el nivel radiado comparable con DNV/ICES: N = 20 + (TL − TL de aguas profundas)/log r, y vale 20 en mar abierto profundo. Como opción, **también la superficie** (nivel de fuente monopolar, ISO 17208-2): N = TL/log r, que supera 20 a baja frecuencia por el efecto dipolo.
- **Resultados:**
  - N en el CPA y **N efectivo en la DWL**, calculado con 15 posiciones del barco y la misma corrección r(t) que el procesado;
  - aviso de la frecuencia por debajo de la cual domina el dipolo de superficie;
  - mapa de TL o de N en la sección del CPA;
  - planta y tabla.
- **«Usar este N en el procesado»:** cada hidrófono usa la curva de su profundidad (también en la corrección r(t)), y se toma la profundidad de la fuente para r. En Ajustes se puede volver al N lineal.

## Proyectos

La herramienta se abre **en blanco**. Desde la cabecera:

- **Nuevo** empieza un proyecto vacío.
- **Abrir…** (Ctrl+O) carga un proyecto guardado.
- **Guardar** (Ctrl+S) y **Guardar como…** (Ctrl+Mayús+S) escriben el proyecto en un fichero `.json`. En Chrome/Edge se elige carpeta y nombre, y luego «Guardar» sobrescribe el mismo fichero; en otros navegadores se descarga.

El proyecto guarda los ajustes, las posiciones GPS, la configuración de cada pasada (canales, profundidades, sincronización, ventanas) y los **resultados** (tendencia y espectros). Al abrirlo se ven las gráficas, las tablas y el resumen sin volver a procesar. Las señales no se guardan, porque son ficheros muy grandes: para reprocesar una pasada se vuelve a cargar su UNV/.mat, y se conserva la configuración de canales.

La cabecera avisa de los cambios sin guardar, y el navegador pide confirmación al cerrar. Además, la última sesión se guarda automáticamente en el navegador y se puede recuperar con «Restaurar última sesión».

## Varias pasadas

- Carga por lotes de señales, GPS y ruido de fondo, con emparejamiento automático por hora, velocidad y costado.
- «Procesar todas» y pestaña **Resumen** con la gráfica comparativa y las tablas de todas las pasadas.
- «Copiar imagen» da un PNG con fondo blanco para Word; «Copiar tabla» da texto separado por tabuladores para Excel.

## Uso

Abre `index.html` en un navegador actual (Chrome, Edge o Firefox) o usa la versión publicada en https://oscarvib.github.io/procesador-urn/. Desde Chrome o Edge se puede instalar como aplicación (icono de instalar en la barra de direcciones); una vez abierta con conexión, funciona también sin ella. Se abre en blanco; el botón «Ver un ejemplo» carga una pasada **sintética** (trayectoria GPS inventada y señal simulada de dos hidrófonos).

Los ficheros `.mat` en formato v7.3 (HDF5) no se pueden leer: guárdalos con `save("fichero.mat","recorded_data","-v7")`.

## Historial de versiones

- **1.5.3**: mapa de propagación con escala de color jet (o viridis), zoom de la escala de niveles con la rueda del ratón, desplazamiento con Mayús + rueda, límites editables y escala automática con doble clic.
- **1.5.2**: uso sin conexión más robusto: con red lenta se abre la copia guardada a los 3,5 s, las fuentes se guardan al instalar e indicador «Disponible sin conexión» / «Sin conexión».
- **1.5.1**: opción «Qué corrige N» en la pestaña Propagación: nivel radiado (solo fondo y paredes, por defecto, comparable con DNV/ICES) o nivel de fuente monopolar (también la superficie).
- **1.5.0**: pestaña Propagación (N): modelo de fuentes imagen con superficie rugosa, fondo fluido (Rayleigh), paredes, N efectivo en la DWL, mapa de TL/N y aplicación del N por banda e hidrófono al procesado.
- **1.4.2**: selector de curva límite también en el resumen y en los resultados de cada pasada (sincronizado con Ajustes).
- **1.4.1**: las versiones nuevas se ven al recargar (sin esperar a la caché de GitHub Pages) y aviso cuando hay una versión nueva.
- **1.4.0**: arranque en blanco; proyectos Nuevo/Abrir/Guardar/Guardar como (.json con ajustes, GPS, pasadas y resultados), aviso de cambios sin guardar y restauración de la última sesión.
- **1.3.2**: velocidad sobre el fondo (SOG, media en ±5 s a partir de las posiciones) en eje secundario de la gráfica de distancia.
- **1.3.1**: el lector UNV acepta canales separados por un solo `-1` (antes solo leía el primer canal) y redondea la frecuencia de muestreo.
- **1.3.0**: sincronización señal–GPS (hora de cabecera UNV/.mat, manual o ajuste automático), ventana centrada en el CPA del GPS, corrección r(t) por segmento, lectura UNV ASCII más rápida.
- **1.2.1**: se quita la curva Silent(S) (sísmica).
- **1.2.0**: curvas límite DNV Silent R, E (tránsito y crucero silencioso), F (búsqueda ligera y arrastre pesado), A (prospección ligera y hélices de maniobra) y S (por tercio y global), seleccionables en Ajustes.
- **1.1.2**: iconos en más tamaños (48–512 px) y favicon.ico para el acceso directo del escritorio en Windows.
- **1.1.1**: instalable como aplicación en Chrome/Edge con su icono (manifiesto e iconos PNG) y uso sin conexión (service worker).
- **1.1.0**: ruido de fondo desde un fichero aparte (completo o un tramo), con asignación de canales y carga por lotes; ejemplo GPS sintético; número de versión e icono.
- **1.0.0**: primera versión: GPS y CPA, señal .mat/UNV/WAV, tendencia RMS, ventana DWL, nivel de fuente a 1 m con N·log10(r), resumen frente a SILENT(R)/ICES 209.
