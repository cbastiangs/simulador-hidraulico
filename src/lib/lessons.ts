/** Teaching prompts are presentation; all displayed numbers come from the engine. */
export const LESSONS: Record<string, { question: string; action: string }> = {
  "segunda-descarga": { question: "¿Qué le pasa a la primera línea al abrir otra?", action: "Toca la bomba y abre Descarga 2. Compara la presión real y el caudal de Descarga 1 antes y después. La familia CX tiene capacidad limitada." },
  "cambia-diametro": { question: "¿Cuánta presión se pierde en la manguera?", action: "Selecciona el tramo y cambia 1½″ por 2½″ sin tocar la bomba. Observa la fricción y el caudal entregado; el adaptador se añade automáticamente." },
  "sube-piso": { question: "¿Qué cambia al subir un piso?", action: "Selecciona el pitón y sube su altura 3 m (un piso). Compara presión y caudal; después cierra el pitón para observar la pérdida por altura con agua detenida." },
  "gira-selector": { question: "¿Más presión en el pitón significa más agua?", action: "Selecciona el G-Force y baja el ajuste de 95 a 60 gpm. Observa que sube la presión y baja el caudal entregado: el ajuste es nominal." },
  "waterous-cx": { question: "¿Por qué no alcanza los 200 psi solicitados?", action: "Selecciona la bomba y consulta su curva. Cambia entre Presión y RPM fijas para comparar la solicitud con la descarga real." },
};
