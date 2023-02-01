import { getJSONValue, getKey, removeValue, setJSONValue } from "../client-db";
import { createElementWithClasses } from "../dom-utils";
import { markDone, markNotDone } from "../exercise/utils";
import { sendAndCacheData } from "../telemetry";
import {
  queryAreaFromInside,
  queryContainerFromInside,
  queryCorrectAnswer,
  queryDragArea,
  queryDropArea,
  queryEmptySlot,
  queryLastSlot,
  queryParsonsContainers,
  queryParsonsLines,
  querySlotFromInside,
  querySlots,
  querySubslots,
  selectExerciseUnderCursor,
} from "./queries";

export function saveCurrentState(exercise) {
  const dropArea = queryDropArea(exercise);
  const lines = [...queryParsonsLines(dropArea)];
  const idsAndIndentations = lines.map((line) => {
    const indentElement = line.parentElement.querySelector(".cur-indent");
    const prefix = "subslot-";
    const indentClass = [...indentElement.classList].filter((className) =>
      className.startsWith(prefix)
    )[0];
    const indentCount = parseInt(indentClass.substr(prefix.length)) - 1;

    const id = line.querySelector("a").id;
    return [id, indentCount];
  });

  const key = getStateCacheKey(exercise);
  setJSONValue(key, idsAndIndentations);
  removeValue(exercise);
}

export function recoverPreviousState(exercise, dropAreaSlotCount) {
  const key = getStateCacheKey(exercise);
  const prevState = getJSONValue(key);
  if (!prevState) {
    return;
  }

  const dragArea = queryDragArea(exercise);
  const dropArea = queryDropArea(exercise);
  for (const [lineId, indentCount] of prevState) {
    const line = dragArea.querySelector(`[name="${lineId}"]`).parentElement;
    const [slot, subslots] = createSlot(dropArea, dropAreaSlotCount);
    const subslot = subslots[indentCount];
    insertLineInSubslot(line, subslot);
  }
  cleanUpSlots(exercise);
}

export function resetPrevState(exercise) {
  const key = getStateCacheKey(exercise);
  removeValue(key);
  removeValue(exercise);
}

export function removeDragListeners(onDrag, onDrop) {
  window.removeEventListener("dragenter", onDrag);
  window.removeEventListener("dragover", onDrag);
  window.removeEventListener("drop", onDrop);
}

export function addDragListeners(onDrag, onDrop) {
  window.addEventListener("dragenter", onDrag);
  window.addEventListener("dragover", onDrag);
  window.addEventListener("drop", onDrop);
}

export function insertLineInSubslot(line, subslot) {
  if (!subslot) return;

  const slot = querySlotFromInside(subslot);
  slot.classList.remove("drag-over");
  slot.classList.add("with-line");
  subslot.classList.remove("drag-over");
  subslot.classList.add("cur-indent");

  slot.appendChild(line);
}

export function eventIsInsideExercise(ev, exercise) {
  return selectExerciseUnderCursor(ev) === exercise;
}

export function setCurrentSubslot(subslot, exercise) {
  if (!subslot) return;

  const slot = querySlotFromInside(subslot);
  slot.classList.add("drag-over");
  subslot.classList.add("drag-over");

  querySlots(exercise).forEach((other) => {
    if (other !== slot) other.classList.remove("drag-over");
  });
  querySubslots(exercise).forEach((other) => {
    if (other !== subslot) other.classList.remove("drag-over");
  });

  shiftLines(slot);

  const container = queryContainerFromInside(slot);
  const containers = queryParsonsContainers(exercise);
  resetContainers(containers, container);
  container.classList.add("drag-over");
}

export function createSlot(area, subslotCount, additionalClass) {
  const slot = createElementWithClasses("div", ["line-slot"], area);
  const classList = ["subslot"];
  if (additionalClass) classList.push(additionalClass);
  const subslots = [];
  for (let i = 0; i < subslotCount; i++) {
    subslots.push(
      createElementWithClasses("div", [...classList, `subslot-${i + 1}`], slot)
    );
  }
  createElementWithClasses("div", ["line-placeholder"], slot);

  return [slot, subslots];
}

export function hide(line) {
  setTimeout(() => {
    // We need this timeout because the element is copied to
    // be displayed as an image while dragging.
    // The timeout postpones hiding the slot (add .dragging).
    querySlotFromInside(line).classList.add("dragging");
  }, 0);
}

export function cleanUpSlots(exercise) {
  const slots = querySlots(exercise);
  for (let slot of slots) {
    slot.classList.remove("dragging");
    if (queryParsonsLines(slot).length === 0) {
      slot.remove();
    }
  }
}

export function resetExercise(exercise) {
  resetPrevState(exercise);
  markNotDone(exercise);

  const origArea = queryDragArea(exercise);
  const destArea = queryDropArea(exercise);
  queryParsonsLines(destArea).forEach((line) => {
    const slot = querySlotFromInside(line);
    const newSlot = createElementWithClasses(
      "div",
      ["line-slot", "with-line"],
      origArea
    );
    createElementWithClasses(
      "div",
      ["subslot", "cur-indent", "single-subslot"],
      newSlot
    );
    createElementWithClasses("div", ["line-placeholder"], newSlot);
    newSlot.appendChild(line);
    slot.remove();
  });
}

export function submitExercise(exercise) {
  exercise.classList.remove("correct");
  exercise.classList.remove("wrong");

  const origArea = queryDragArea(exercise);
  const answerArea = queryDropArea(exercise);

  const lines = queryParsonsLines(answerArea);
  let correct = lines.length > 0 && queryParsonsLines(origArea).length === 0;

  let answerCorrect = queryCorrectAnswer(exercise).innerText;
  let answerText = "";
  lines.forEach((line) => {
    const slot = querySlotFromInside(line);
    answerText += "    ".repeat(getIndentCount(slot)) + slot.innerText + "\n";
  });
  correct = correct && answerText === answerCorrect;

  // We need this timeout so the browser has time to reset the
  // exercise before animating again
  setTimeout(() => {
    finishParsonsExercise(exercise, correct);
  }, 0);
  sendAndCacheData(exercise, { correct, code: answerText }, correct ? 1 : 0);
}

export function finishParsonsExercise(exercise, correct) {
  markDone(exercise);
  if (correct) {
    exercise.classList.add("correct");
  } else {
    exercise.classList.add("wrong");
  }
}

function resetContainers(containers, exceptThis) {
  containers.forEach((otherContainer) => {
    if (otherContainer !== exceptThis) {
      shiftLines(queryLastSlot(otherContainer));
    }
  });
}

function shiftLines(slot) {
  if (!slot.classList.contains("with-line")) return;

  const area = queryAreaFromInside(slot);
  const emptySlot = queryEmptySlot(area);

  if (emptyIsBeforeRef(area, emptySlot, slot)) {
    area.insertBefore(emptySlot, slot.nextSibling);
  } else {
    area.insertBefore(emptySlot, slot);
  }
}

function emptyIsBeforeRef(area, emptySlot, refSlot) {
  for (let slot of querySlots(area)) {
    if (slot === emptySlot) return true;
    if (slot === refSlot) return false;
  }
  return false;
}

function getIndentCount(slot) {
  const subslot = slot.querySelector(".subslot.cur-indent");
  const prefix = "subslot-";
  for (let className of subslot.classList) {
    if (className.startsWith(prefix)) {
      const count = parseInt(className.substr(prefix.length));
      if (count) return count - 1;
    }
  }
  return 0;
}

function getStateCacheKey(exercise) {
  return `${getKey(exercise)}--currentstate`;
}
