import type { ExerciseLessonId } from './document.ts';
import { u } from './display-units.svelte.ts';

/** Predictions and controlled edits, retained by the exercise's stable lesson id. */
export const EXERCISE_LESSONS: Record<ExerciseLessonId, { question: string; action: string }> = {
  diameter: {
    question: 'Antes de cambiar: ¿bastará una manguera de 2½″ para alcanzar la referencia?',
    action: 'Selecciona el tramo y cambia 1½″ por 2½″. Mantén largo, bomba y pitón. Compara fricción y entrega con la referencia; explica qué sigue limitando el caudal.',
  },
  'nozzle-capacity': {
    question: 'Antes de girar el selector: ¿cómo cambiarán la entrega y la presión en el pitón?',
    get action() { return `Selecciona el G-Force y sube el anillo de ${u.q(60, 0)} a ${u.q(125, 0)} ${u.flow} nominales. Mantén bomba y manguera. Compara entrega y presión; el número del anillo es una clasificación, no el caudal resuelto.`; },
  },
  'second-discharge': {
    question: 'Antes de abrir otra descarga: ¿se duplicará la entrega total y qué pasará con la primera línea?',
    action: 'Selecciona la bomba y abre Descarga 2. Mantén presión solicitada y límite de giro. Ambas líneas están asignadas; compara entrega total y presión real, y revisa cada descarga. La familia CX es genérica, sin calibración de un camión particular.',
  },
};
