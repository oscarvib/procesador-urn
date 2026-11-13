<img src="icon.svg" width="72" alt="Icono de Procesador URN">

# Procesador URN

**Versión 1.1.0**

Herramienta web (un único `index.html`, sin instalación) para procesar medidas de **ruido radiado al agua (URN)** en pruebas de mar y obtener el **nivel de fuente a 1 m** por tercios de octava.

Todo el cálculo se hace en el navegador: los ficheros no salen del equipo.

## Flujo por pasada

1. **GPS**: NMEA del barco y de la boya del hidrófono (`$GxGGA` / `$GxRMC`). Calcula la distancia horizontal en el CPA, la hora del CPA, la velocidad sobre el fondo (SOG), el rumbo y la deriva de la boya. Muestra el mapa de tránsito y la distancia frente al tiempo.
2. **Señal de presión**: `.mat` v5/v7 (p. ej. `recorded_data(k).data` con `names`, `units` y `sampling`), UNV dataset 58/58b o WAV. Para cada hidrófono se indica la profundidad y el factor de calibración.
3. **Ruido de fondo**: un tramo del propio registro o un **fichero aparte** (completo o un tramo), con la asignación de canales que elijas.
4. **Procesado**:
   - paso alto Butterworth de 4º orden, RMS por bloques y media móvil → CPA acústico (o CPA manual con un clic);
   - ventana DWL de longitud fija o ±θ respecto al CPA, con COMEX y FINEX;
   - espectro de Welch con ventana Hann y 50 % de solape;
   - corrección a 1 m con `N(f)·log10(r)`, donde `r = √(d_CPA² + (z_h − z_s)²)` y N varía linealmente entre N₁ y N₂ (por defecto 11 → 20 entre 10 y 100 Hz).
5. **Resultados**: tendencia, nivel de fuente en banda estrecha y en tercios de octava, ruido de fondo, S/N y margen frente a DNV SILENT(R) / ICES 209.

## Varias pasadas

- Carga por lotes de señales, GPS y ruido de fondo, con emparejamiento automático por hora, velocidad y costado.
- «Procesar todas» y pestaña **Resumen** con la gráfica comparativa y las tablas de todas las pasadas.
- «Copiar imagen» da un PNG con fondo blanco para Word; «Copiar tabla» da texto separado por tabuladores para Excel.

## Uso

Abre `index.html` en un navegador actual (Chrome, Edge o Firefox) o publícalo con GitHub Pages. Al abrirse carga un ejemplo **sintético**: una trayectoria GPS inventada y una señal simulada de dos hidrófonos.

Los ficheros `.mat` en formato v7.3 (HDF5) no se pueden leer: guárdalos con `save("fichero.mat","recorded_data","-v7")`.

## Historial de versiones

- **1.1.0**: ruido de fondo desde un fichero aparte (completo o un tramo), con asignación de canales y carga por lotes; ejemplo GPS sintético; número de versión e icono.
- **1.0.0**: primera versión: GPS y CPA, señal .mat/UNV/WAV, tendencia RMS, ventana DWL, nivel de fuente a 1 m con N·log10(r), resumen frente a SILENT(R)/ICES 209.
