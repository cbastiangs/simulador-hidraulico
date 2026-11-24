import type { ExerciseLessonId } from './document.ts';
import { u } from './display-units.svelte.ts';

/** Predictions and controlled edits, retained by the exercise's stable lesson id. */
export const EXERCISE_LESSONS: Record<ExerciseLessonId, { question: string; action: string }> = {
  diameter: {
    question: 'Antes de cambiar: ¿bastará una manguera de 2½″ para alcanzar la referencia?',
    action: 'Selecciona el tramo y cambia de 1½″ a 2½″. Mantén el largo, la bomba y el pitón. ¿Qué pasó con la fricción y la entrega? ¿Por qué la referencia del piso sigue igual?',
  },
  'nozzle-capacity': {
    question: 'Antes de girar el selector: ¿cómo cambiarán la entrega y la presión en el pitón?',
    get action() { return `Selecciona el Turbojet 1720 y sube el anillo de ${u.q(60, 0)} a ${u.q(125, 0)} ${u.flow} nominales. Mantén bomba y manguera. Compara entrega y presión; el número del anillo es una clasificación, no el caudal resuelto.`; },
  },
  'second-discharge': {
    question: 'Antes de abrir otra descarga: ¿la bomba podrá mantener la presión y el caudal de la primera línea?',
    action: 'Anota la presión real, el caudal de Descarga 1 y el total. Selecciona la bomba y abre Descarga 2 sin cambiar presión solicitada ni límite de giro. Compara las tres lecturas: ¿aumentó el total?, ¿se mantuvo o bajó el caudal de la primera línea? Cierra Descarga 2 para comprobar la diferencia. Ambas líneas están asignadas. La curva CX es genérica, no calibrada para M11-5.',
  },
};
