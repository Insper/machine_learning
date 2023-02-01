export function queryParsonsExercises() {
  return document.querySelectorAll("div.admonition.exercise.parsons");
}

export function queryResetButton(exercise) {
  return exercise.querySelector("input[name=resetButton]");
}

export function querySubmitButton(exercise) {
  return exercise.querySelector("input[name=sendButton]");
}

export function queryAnswer(exercise) {
  return exercise.querySelector(".admonition.answer");
}

export function queryCorrectAnswer(exercise) {
  return exercise.querySelector(".parsons-answer");
}

export function queryParsonsContainers(exercise) {
  return exercise.querySelectorAll(".parsons-container");
}

export function queryDropArea(exercise) {
  return exercise.querySelector(".parsons-drop-area");
}

export function queryDragArea(exercise) {
  return exercise.querySelector(".parsons-drag-area");
}

export function queryParsonsLines(container) {
  return container.querySelectorAll(".parsons-line");
}

export function queryLastSlot(container) {
  return container.querySelector(".line-slot:last-child");
}

export function querySlots(exercise) {
  return exercise.querySelectorAll(".line-slot");
}

export function querySubslots(slot) {
  return slot.querySelectorAll(".subslot");
}

export function queryEmptySlot(container) {
  return container.querySelector(".line-slot:not(.with-line)");
}

export function queryCurrentSlot(exercise) {
  return exercise.querySelector(".line-slot.drag-over");
}

export function querySlotFromInside(el) {
  return el.closest(".line-slot");
}

export function queryAreaFromInside(el) {
  return el.closest(".parsons-area");
}

export function queryContainerFromInside(el) {
  return el.closest(".parsons-container");
}

export function selectSlotUnderCursor(ev, exercise) {
  const slot = selectElementWithClass(ev, "line-slot");
  if (slot) return slot;

  const container = selectElementWithClass(ev, "parsons-container");
  if (container) return queryEmptySlot(container);

  return queryCurrentSlot(exercise);
}

export function selectSubslotUnderCursor(ev, exercise) {
  const subslot = selectElementWithClass(ev, "subslot");
  if (subslot) return subslot;

  const slot = selectSlotUnderCursor(ev, exercise);
  return slot?.querySelector(".subslot");
}

export function selectExerciseUnderCursor(ev) {
  return selectElementWithClass(ev, "exercise");
}

function selectElementWithClass(ev, className) {
  const elementsBellowMouse = document.elementsFromPoint(
    ev.clientX,
    ev.clientY
  );
  for (let i = 0; i < elementsBellowMouse.length; i++) {
    if (elementsBellowMouse[i].classList.contains(className)) {
      return elementsBellowMouse[i];
    }
  }
}
