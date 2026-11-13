<img src="icon.svg" width="72" alt="Icono de Procesador URN">

# Procesador URN

**Versión 1.3.1**

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

En **Ajustes → Curva límite** se elige el criterio (DNV-GL RU-SHIP Pt.6 Ch.7 Sec.6, tabla 2; dB re 1 µPa @ 1 m en tercios de octava):

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

## Varias pasadas

- Carga por lotes de señales, GPS y ruido de fondo, con emparejamiento automático por hora, velocidad y costado.
- «Procesar todas» y pestaña **Resumen** con la gráfica comparativa y las tablas de todas las pasadas.
- «Copiar imagen» da un PNG con fondo blanco para Word; «Copiar tabla» da texto separado por tabuladores para Excel.

## Uso

Abre `index.html` en un navegador actual (Chrome, Edge o Firefox) o usa la versión publicada en https://oscarvib.github.io/procesador-urn/. Desde Chrome o Edge se puede instalar como aplicación (icono de instalar en la barra de direcciones); una vez abierta con conexión, funciona también sin ella. Al abrirse carga un ejemplo **sintético**: una trayectoria GPS inventada y una señal simulada de dos hidrófonos.

Los ficheros `.mat` en formato v7.3 (HDF5) no se pueden leer: guárdalos con `save("fichero.mat","recorded_data","-v7")`.

## Historial de versiones

- **1.3.1**: el lector UNV acepta canales separados por un solo `-1` (antes solo leía el primer canal) y redondea la frecuencia de muestreo.
- **1.3.0**: sincronización señal–GPS (hora de cabecera UNV/.mat, manual o ajuste automático), ventana centrada en el CPA del GPS, corrección r(t) por segmento, lectura UNV ASCII más rápida.
- **1.2.1**: se quita la curva Silent(S) (sísmica).
- **1.2.0**: curvas límite DNV Silent R, E (tránsito y crucero silencioso), F (búsqueda ligera y arrastre pesado), A (prospección ligera y hélices de maniobra) y S (por tercio y global), seleccionables en Ajustes.
- **1.1.2**: iconos en más tamaños (48–512 px) y favicon.ico para el acceso directo del escritorio en Windows.
- **1.1.1**: instalable como aplicación en Chrome/Edge con su icono (manifiesto e iconos PNG) y uso sin conexión (service worker).
- **1.1.0**: ruido de fondo desde un fichero aparte (completo o un tramo), con asignación de canales y carga por lotes; ejemplo GPS sintético; número de versión e icono.
- **1.0.0**: primera versión: GPS y CPA, señal .mat/UNV/WAV, tendencia RMS, ventana DWL, nivel de fuente a 1 m con N·log10(r), resumen frente a SILENT(R)/ICES 209.
