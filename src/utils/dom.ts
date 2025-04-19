export function handleSelection(
    element: Element,
    selected_handle: Function,
    not_selected_handle: Function
) {
    let moved = false;

    let move_detector = () => {
        moved = true;
    }

    let select_detector = (event: Event) => {
        if (moved) {
            if (typeof selected_handle === 'function') {
                selected_handle(event);
            } else if (typeof not_selected_handle === 'function') {
                not_selected_handle(event);
            }
        }

        element.removeEventListener("mousemove", move_detector);
        element.removeEventListener("mouseup", select_detector);
    }

    element.addEventListener("mousemove", move_detector);
    element.addEventListener("mouseup", select_detector);
}