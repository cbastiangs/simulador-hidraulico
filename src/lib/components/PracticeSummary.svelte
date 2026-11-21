<script lang="ts">
  import type { exerciseReadings } from '$lib/fire-flow.ts';
  import type { ExerciseLessonId } from '$lib/document.ts';
  import { EXERCISE_LESSONS } from '$lib/exercise-lessons.ts';
  import { u } from '$lib/display-units.svelte.ts';
  let { readings, revealed, lessonId, compact = false, onOpen }: {
    readings: NonNullable<ReturnType<typeof exerciseReadings>>; revealed: boolean;
    lessonId?: ExerciseLessonId; compact?: boolean; onOpen: () => void;
  } = $props();
  const lesson = $derived(lessonId ? EXERCISE_LESSONS[lessonId] : null);
</script>

<section aria-label="Resumen de práctica NFA" class="practice-live" class:compact>
  <button type="button" class="open" onclick={onOpen}><strong>Práctica NFA{compact && revealed ? ` · ${u.flow}` : ''}</strong><span>{revealed ? (compact ? 'Ver ejercicio ›' : 'Ver ejercicio y líneas ›') : 'Estimar y comprobar ›'}</span></button>
  {#if revealed}
    <dl aria-live="polite" aria-atomic="true">
      <div><dt>Referencia</dt><dd>{u.q(readings.reference.requiredFlowGpm)} {#if !compact}<small>{u.flow}</small>{/if}</dd></div>
      <div><dt>Entrega asignada</dt><dd>{readings.comparison ? u.q(readings.comparison.deliveredFlowGpm) : '—'} {#if !compact}<small>{u.flow}</small>{/if}</dd></div>
      <div><dt>{readings.comparison && readings.comparison.marginGpm >= 0 ? 'Exceso' : 'Falta'}</dt><dd>{readings.comparison ? u.q(Math.abs(readings.comparison.marginGpm)) : '—'} {#if !compact}<small>{u.flow}</small>{/if}</dd></div>
    </dl>
    {#if readings.unavailable.length}<p role="status">Sin resultado: {readings.unavailable.join(', ')}. Comparación no disponible.</p>
    {:else if !readings.comparison}<p role="status">Asigna al menos un pitón en el ejercicio.</p>
    {:else}<p class="basis">Convención de entrenamiento · {readings.lines.filter(l => l.assigned).length} {readings.lines.filter(l => l.assigned).length === 1 ? 'pitón asignado' : 'pitones asignados'}</p>{/if}
  {:else}
    <p>Referencia oculta hasta comprobar tu estimación.</p>
  {/if}
  {#if lesson && !compact}
    <details><summary>Predice y cambia una cosa</summary><p><b>{lesson.question}</b></p><p>{lesson.action}</p></details>
  {/if}
</section>
<style>
  .practice-live { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
  .open { width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 0; background: var(--accent-soft); color: var(--accent); padding: 8px 12px; cursor: pointer; font: inherit; font-size: 13px; text-align: left; }
  @media (max-height: 760px) { .compact .basis { display: none; } }
  .open span { font-size: 12px; }
  dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0; padding: 8px 12px 4px; }
  dt { font-size: 11px; color: var(--muted); } dd { margin: 4px 0 0; font-size: 17px; font-weight: 750; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; } small { font-size: 11px; font-weight: 500; }
  p { margin: 0; padding: 4px 12px 8px; font-size: 11px; line-height: 1.4; color: var(--muted); }
  details { border-top: 1px solid var(--line); } summary { min-height: 44px; box-sizing: border-box; padding: 12px; color: var(--accent); font-size: 12px; cursor: pointer; } details p { font-size: 12px; color: var(--ink); }
  details[open] { max-height: 210px; overflow-y: auto; }
</style>
