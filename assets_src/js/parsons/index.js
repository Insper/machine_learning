import { markNotDone } from "../exercise/utils";
import { getSubmissionCache, sendAndCacheData } from "../telemetry";
import {
  queryDragArea,
  queryDropArea,
  queryParsonsExercises,
  queryParsonsLines,
  queryResetButton,
  querySubmitButton,
  selectSubslotUnderCursor,
} from "./queries";
import {
  removeDragListeners,
  cleanUpSlots,
  createSlot,
  eventIsInsideExercise,
  hide,
  insertLineInSubslot,
  addDragListeners,
  setCurrentSubslot,
  resetExercise,
  submitExercise,
  saveCurrentState,
  recoverPreviousState,
  resetPrevState,
  finishParsonsExercise,
} from "./utils";

const DROP_AREA_SLOTS = 6;

export function initParsonsPlugin() {
  queryParsonsExercises().forEach((exercise) => {
    registerListeners(exercise);

    recoverPreviousState(exercise, DROP_AREA_SLOTS);

    const { value: prevAnswer, submitted } = getSubmissionCache(exercise);
    if (prevAnswer !== null) {
      finishParsonsExercise(exercise, prevAnswer.correct);
      if (!submitted) {
        sendAndCacheData(exercise, prevAnswer, prevAnswer.correct ? 1 : 0);
      }
    }
  });
}

function registerListeners(exercise) {
  const destArea = queryDropArea(exercise);
  const origArea = queryDragArea(exercise);
  let draggedLine = null;

  window.addEventListener("reset-handout", () => {
    resetPrevState(exercise);
  });

  queryResetButton(exercise).addEventListener("click", (event) => {
    event.preventDefault();
    resetExercise(exercise);
  });
  querySubmitButton(exercise).addEventListener("click", (event) => {
    event.preventDefault();
    submitExercise(exercise);
  });

  function onDrag(ev) {
    ev.preventDefault();
    markNotDone(exercise);

    if (!eventIsInsideExercise(ev, exercise)) return;
    setCurrentSubslot(selectSubslotUnderCursor(ev, exercise), exercise);
  }

  function onDrop(ev) {
    ev.preventDefault();
    removeDragListeners(onDrag, onDrop);

    if (eventIsInsideExercise(ev, exercise)) {
      insertLineInSubslot(draggedLine, selectSubslotUnderCursor(ev, exercise));
    }
    cleanUpSlots(exercise);
    draggedLine = null;

    saveCurrentState(exercise);
  }

  function onDragStart(ev) {
    addDragListeners(onDrag, onDrop);

    createSlot(origArea, 1, "single-subslot");
    createSlot(destArea, DROP_AREA_SLOTS);

    draggedLine = ev.target;
    hide(draggedLine);
  }

  queryParsonsLines(exercise).forEach((line) => {
    line.addEventListener("dragstart", onDragStart);
  });
}
